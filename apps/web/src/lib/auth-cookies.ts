// Shared between middleware.ts and the /api/auth/* route handlers so the cookie
// names can't drift out of sync between where they're set and where they're read.
export const ACCESS_TOKEN_COOKIE = 'fitness_access_token';
export const REFRESH_TOKEN_COOKIE = 'fitness_refresh_token';
