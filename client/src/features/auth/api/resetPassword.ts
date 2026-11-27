import { readApiMessage } from '@/features/auth/api/readApiMessage';
import { apiFetch } from '@/lib/api';

const GENERIC_ERROR = 'Unable to reset the password right now. Please try again later.';

/**
 * Asks the API to e-mail a reset link via `POST /api/v1/user-panel/forgot-password`. Resolves with the API's
 * confirmation, which is the same for unknown addresses (so it never reveals which e-mails are registered).
 */
export async function requestPasswordReset(email: string): Promise<string> {
  let response: Response;
  try {
    response = await apiFetch('/api/v1/user-panel/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ Email: email }),
    });
  } catch {
    throw new Error(GENERIC_ERROR);
  }

  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) throw new Error(readApiMessage(body) ?? GENERIC_ERROR);
  return readApiMessage(body) ?? 'If this email is registered, a password reset link has been sent.';
}
