import { apiFetch } from '@/lib/api';

/**
 * Ends the session via `POST /api/v1/user-panel/logout`, which clears the session cookies.
 * The caller redirects to /account/login once this resolves.
 */
export async function logout(): Promise<void> {
  const response = await apiFetch('/api/v1/user-panel/logout', { method: 'POST' });
  // A 401 means the session was already gone, which is what logging out wants anyway.
  if (!response.ok && response.status !== 401) throw new Error('Unable to log out right now. Please try again.');
}
