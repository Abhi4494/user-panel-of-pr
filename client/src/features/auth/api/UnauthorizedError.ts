/** Thrown by API functions on a 401: the session cookie is missing or expired, so the user must sign in again. */
export class UnauthorizedError extends Error {
  constructor(message = 'Your session has expired. Please sign in again.') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}
