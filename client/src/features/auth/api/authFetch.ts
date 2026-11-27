import { refreshSession } from '@/features/auth/api/refreshSession';
import { UnauthorizedError } from '@/features/auth/api/UnauthorizedError';
import { apiFetch } from '@/lib/api';

/**
 * `apiFetch` for endpoints that need a signed-in user. On a 401 it renews the session once and retries the request;
 * if the renewal fails (or the retry is still 401) it throws `UnauthorizedError`, which the dashboard turns into a
 * redirect to the login screen. Network failures reject as usual.
 */
export async function authFetch(input: string, init?: RequestInit): Promise<Response> {
  const send = () => apiFetch(input, init);

  const response = await send();
  if (response.status !== 401) return response;

  if (!(await refreshSession())) throw new UnauthorizedError();
  const retry = await send();
  if (retry.status === 401) throw new UnauthorizedError();
  return retry;
}
