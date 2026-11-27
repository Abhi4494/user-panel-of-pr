/**
 * The one place that knows where the API is. Everything comes from the env files (see `.env.example`):
 *   VITE_API_BASE_URL    where the API lives, no trailing slash; empty = same origin (`/api/...`, served by the dev proxy or
 *                        a host rewrite).
 *   VITE_API_AUTH_TOKEN  sent as the `x-auth-token` header on every call.
 */
const baseUrl = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/+$/, '');
const authToken = import.meta.env.VITE_API_AUTH_TOKEN ?? '';

/** Full URL for an API or uploaded-file path, e.g. `/api/v1/user-panel/login` or `/uploaded-files/...`. */
export const apiUrl = (path: string) => `${baseUrl}${path}`;

/** An image/file path from the API: a full `http(s)` URL is used as it is, a relative path gets the API base URL. */
export const assetUrl = (path: string) => (/^https?:\/\//i.test(path) ? path : apiUrl(path));

/**
 * `fetch` for the API: prefixes the base URL, adds the auth token and sends the session cookies. Use it for every
 * request to the API instead of calling `fetch` directly.
 */
export function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  if (authToken) headers.set('x-auth-token', authToken);
  return fetch(apiUrl(path), { ...init, headers, credentials: 'include' });
}
