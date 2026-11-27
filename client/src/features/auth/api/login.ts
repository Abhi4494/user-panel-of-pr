import type { LoginValues } from '@/features/auth/validation';
import { COMPLETE_PROFILE_PATH } from '@/features/auth/paths';
import { apiFetch } from '@/lib/api';

export interface LoginRequest extends LoginValues {
  /** App path to prefer over the API's own `returnUrl` (the `ReturnUrl` query of the login page). */
  returnUrl?: string;
}

export interface LoginResponse {
  /** Where to go after signing in. */
  redirectUrl: string;
}

const GENERIC_ERROR = 'Unable to log in right now. Please try again later.';
const DEFAULT_REDIRECT = '/dashboard';

/**
 * Signs in via `POST /api/v1/user-panel/login`. The API stores the session in httpOnly cookies (`pr_access`,
 * `pr_refresh`, `user_sid`) that the browser sends back automatically on every same-origin request, so the app
 * never reads or stores a token itself.
 */
export async function login(request: LoginRequest): Promise<LoginResponse> {
  let response: Response;
  try {
    response = await apiFetch('/api/v1/user-panel/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ Email: request.email, Password: request.password }),
    });
  } catch {
    throw new Error(GENERIC_ERROR);
  }

  const body: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(readString(body, 'message') ?? GENERIC_ERROR);
  }

  const data = readObject(body, 'data');
  // Like the .NET site: a user whose profile is not complete always goes to the "Complete your profile" step first,
  // even when the login page was opened with a ReturnUrl.
  const profileComplete = readObject(readObject(data, 'user'), 'IsProfileComplete');
  if (profileComplete === false || profileComplete === 0) return { redirectUrl: COMPLETE_PROFILE_PATH };

  const apiReturnUrl = readString(data, 'returnUrl');
  return { redirectUrl: pickAppPath(request.returnUrl) ?? pickAppPath(apiReturnUrl) ?? DEFAULT_REDIRECT };
}

/** Only same-app paths are followed (never `//host` or an absolute URL). */
function pickAppPath(path: string | null | undefined): string | null {
  return path && path.startsWith('/') && !path.startsWith('//') ? path : null;
}

function readObject(source: unknown, key: string): unknown {
  return typeof source === 'object' && source !== null && key in source ? (source as Record<string, unknown>)[key] : null;
}

function readString(source: unknown, key: string): string | null {
  const value = readObject(source, key);
  return typeof value === 'string' && value !== '' ? value : null;
}
