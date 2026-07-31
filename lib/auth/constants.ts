/**
 * Development-only cookie signing keys.
 *
 * Shared so the Node runtime (`lib/admin/session.ts`, `lib/registration/cookie.ts`) and the Edge
 * runtime (`lib/auth/edge-cookies.ts`) can never drift apart — a mismatch would silently sign
 * cookies with one key and verify them with another, logging every local user straight back out.
 *
 * These are never used in production: both runtimes throw or reject when the real environment
 * variable is missing. This file must stay free of Node-only imports so Edge can load it.
 */
export const DEV_ADMIN_SECRET = "dev-only-admin-secret-change-me";
export const DEV_REGISTRATION_SECRET = "dev-only-registration-secret-change-me";
