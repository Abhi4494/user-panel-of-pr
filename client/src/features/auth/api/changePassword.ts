import { authFetch } from '@/features/auth/api/authFetch';
import { readApiMessage } from '@/features/auth/api/readApiMessage';
import { UnauthorizedError } from '@/features/auth/api/UnauthorizedError';

const GENERIC_ERROR = 'Unable to change the password right now. Please try again later.';

/**
 * Changes the signed-in user's password via `POST /api/v1/user-panel/change-password` (the session cookie says whose).
 * Resolves with the API's confirmation; rejects with its message (e.g. "Old password incorrect"), or with
 * `UnauthorizedError` when the session has ended.
 */
export async function changePassword(oldPassword: string, newPassword: string): Promise<string> {
  let response: Response;
  try {
    response = await authFetch('/api/v1/user-panel/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ OldPassword: oldPassword, NewPassword: newPassword }),
    });
  } catch (error) {
    throw error instanceof UnauthorizedError ? error : new Error(GENERIC_ERROR);
  }

  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) throw new Error(readApiMessage(body) ?? GENERIC_ERROR);
  return readApiMessage(body) ?? 'Password changed successfully';
}
