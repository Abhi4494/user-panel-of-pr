import { readApiMessage } from '@/features/auth/api/readApiMessage';
import { apiFetch } from '@/lib/api';

const GENERIC_ERROR = 'Unable to set the password right now. Please try again later.';

/**
 * Whether the reset link from the e-mail can still be used, via `GET /api/v1/user-panel/reset-password/:id`.
 * Resolves with the API's reason ("Invalid link", "Link expired", "Link already used") when it cannot.
 */
export async function checkResetLink(resetId: string): Promise<{ valid: true } | { valid: false; message: string }> {
  let response: Response;
  try {
    response = await apiFetch(`/api/v1/user-panel/reset-password/${encodeURIComponent(resetId)}`);
  } catch {
    return { valid: false, message: GENERIC_ERROR };
  }
  if (response.ok) return { valid: true };
  const body: unknown = await response.json().catch(() => null);
  return { valid: false, message: readApiMessage(body) ?? 'Invalid link' };
}

/** Saves the new password via `POST /api/v1/user-panel/reset-password`; resolves with the API's confirmation. */
export async function setPassword(resetId: string, password: string, confirmPassword: string): Promise<string> {
  let response: Response;
  try {
    response = await apiFetch('/api/v1/user-panel/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ResetId: resetId, Password: password, ConfirmPassword: confirmPassword }),
    });
  } catch {
    throw new Error(GENERIC_ERROR);
  }

  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) throw new Error(readApiMessage(body) ?? GENERIC_ERROR);
  return readApiMessage(body) ?? 'Password updated.';
}
