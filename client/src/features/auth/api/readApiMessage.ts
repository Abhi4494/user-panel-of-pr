/** The `message` of an API response body, or `null` when the body has none. */
export function readApiMessage(body: unknown): string | null {
  if (typeof body === 'object' && body !== null && 'message' in body && typeof body.message === 'string' && body.message !== '') {
    return body.message;
  }
  return null;
}
