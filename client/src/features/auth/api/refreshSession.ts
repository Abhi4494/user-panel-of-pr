import { apiFetch } from '@/lib/api';

let inFlight: Promise<boolean> | null = null;

/**
 * Renews the session via `POST /api/v1/user-panel/refresh`. The API reads the `pr_refresh` cookie and sets fresh
 * cookies, so there is nothing to store here (the body field is sent empty on purpose). Resolves `false` when the
 * refresh cookie is missing or expired, i.e. the user has to sign in again.
 *
 * Calls made while a refresh is already running share it, so several 401s at once trigger a single refresh.
 */
export function refreshSession(): Promise<boolean> {
  inFlight ??= requestRefresh().finally(() => {
    inFlight = null;
  });
  return inFlight;
}

async function requestRefresh(): Promise<boolean> {
  try {
    const response = await apiFetch('/api/v1/user-panel/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: '' }),
    });
    return response.ok;
  } catch {
    return false;
  }
}
