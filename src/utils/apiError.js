import axios from 'axios';

/**
 * Every failed API call is converted into an ApiError so components can rely
 * on one shape, matching the backend error contract:
 *   { success: false, message: string, errors?: [{ field, message }] }
 */
export class ApiError extends Error {
  constructor({ message, status = 0, code = 'UNKNOWN', errors = [], data = null, isCanceled = false }) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.errors = errors;
    this.data = data;
    this.isCanceled = isCanceled;
  }

  get isNetworkError() {
    return this.code === 'NETWORK_ERROR' || this.code === 'TIMEOUT';
  }

  get isUnauthorized() {
    return this.status === 401;
  }

  get isForbidden() {
    return this.status === 403;
  }

  get isNotFound() {
    return this.status === 404;
  }
}

const STATUS_MESSAGES = {
  400: 'Some of the information provided is not valid. Please review and try again.',
  401: 'Please log in to continue.',
  403: "You don't have permission to do this.",
  404: "We couldn't find what you were looking for.",
  409: 'This conflicts with existing information. Please review and try again.',
  413: 'The file you uploaded is too large.',
  422: 'Some of the information provided is not valid. Please review and try again.',
  429: 'Too many attempts. Please wait a moment and try again.',
};

const GENERIC_SERVER_MESSAGE = 'Something went wrong on our side. Please try again shortly.';
const NETWORK_MESSAGE = "We couldn't reach the server. Please check your internet connection and try again.";
const TIMEOUT_MESSAGE = 'The server is taking too long to respond. Please try again.';

const messageForStatus = (status) =>
  STATUS_MESSAGES[status] ?? (status >= 500 ? GENERIC_SERVER_MESSAGE : 'Something went wrong. Please try again.');

const sanitizeFieldErrors = (errors) =>
  Array.isArray(errors)
    ? errors
        .filter((item) => item && typeof item.message === 'string')
        .map((item) => ({ field: typeof item.field === 'string' ? item.field : null, message: item.message }))
    : [];

/** Convert any thrown value (Axios error or otherwise) into an ApiError. */
export function normalizeApiError(error) {
  if (error instanceof ApiError) return error;

  if (axios.isCancel(error)) {
    return new ApiError({ message: 'Request was cancelled.', code: 'CANCELED', isCanceled: true });
  }

  if (error?.response) {
    const { status, data } = error.response;
    const serverMessage = data && typeof data.message === 'string' && data.message.trim() ? data.message : null;

    return new ApiError({
      // Hide raw server messages for 5xx — they may leak internals and don't help users.
      message: status >= 500 ? GENERIC_SERVER_MESSAGE : serverMessage || messageForStatus(status),
      status,
      code: `HTTP_${status}`,
      errors: sanitizeFieldErrors(data?.errors),
      data: data ?? null,
    });
  }

  if (error?.code === 'ECONNABORTED' || error?.code === 'ETIMEDOUT') {
    return new ApiError({ message: TIMEOUT_MESSAGE, code: 'TIMEOUT' });
  }

  if (error?.request) {
    return new ApiError({ message: NETWORK_MESSAGE, code: 'NETWORK_ERROR' });
  }

  return new ApiError({ message: error?.message || 'Something went wrong. Please try again.' });
}

/**
 * Map backend field errors to `{ [field]: message }` so forms can show each
 * message next to its input.
 */
export function getFieldErrors(error) {
  const list = error instanceof ApiError ? error.errors : sanitizeFieldErrors(error?.errors);
  return list.reduce((acc, { field, message }) => {
    if (field && !acc[field]) acc[field] = message;
    return acc;
  }, {});
}
