/**
 * User roles. Must match the role strings returned by the backend.
 * Frontend role checks only control UI/navigation — the backend is the
 * final authority on what a user may actually do.
 */
export const ROLES = Object.freeze({
  CUSTOMER: 'customer',
  PROVIDER: 'provider',
  ADMIN: 'admin',
});

/** Roles a visitor may choose during public registration. Admin is never allowed. */
export const PUBLIC_REGISTRATION_ROLES = Object.freeze([ROLES.CUSTOMER, ROLES.PROVIDER]);

export const ROLE_LABELS = Object.freeze({
  [ROLES.CUSTOMER]: 'Customer',
  [ROLES.PROVIDER]: 'Professional',
  [ROLES.ADMIN]: 'Administrator',
});
