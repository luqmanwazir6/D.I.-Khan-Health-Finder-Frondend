/**
 * Service request lifecycle statuses. Values must match the backend exactly.
 * `tone` maps to the status colour tokens defined in index.css
 * (--color-<tone>, --color-<tone>-soft).
 */
export const REQUEST_STATUS = Object.freeze({
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
});

export const REQUEST_STATUS_META = Object.freeze({
  [REQUEST_STATUS.PENDING]: { label: 'Pending', tone: 'warning' },
  [REQUEST_STATUS.ACCEPTED]: { label: 'Accepted', tone: 'info' },
  [REQUEST_STATUS.REJECTED]: { label: 'Rejected', tone: 'danger' },
  [REQUEST_STATUS.IN_PROGRESS]: { label: 'In progress', tone: 'primary' },
  [REQUEST_STATUS.COMPLETED]: { label: 'Completed', tone: 'success' },
  [REQUEST_STATUS.CANCELLED]: { label: 'Cancelled', tone: 'neutral' },
});

/** Statuses from which a customer may still cancel a request (UI hint only). */
export const CANCELLABLE_STATUSES = Object.freeze([REQUEST_STATUS.PENDING, REQUEST_STATUS.ACCEPTED]);

export const getRequestStatusMeta = (status) =>
  REQUEST_STATUS_META[status] ?? { label: status ? String(status) : 'Unknown', tone: 'neutral' };
