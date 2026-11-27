import type { RegistrationValues } from '@/features/auth/registrationValidation';
import { apiFetch } from '@/lib/api';

const GENERIC_ERROR = 'Unable to register right now. Please try again later.';

/** Fields the API needs; terms and captcha are checked client-side. */
export type RegisterRequest = Omit<RegistrationValues, 'terms' | 'captcha' | 'product'> & {
  /** Numeric ids of the selected products, e.g. `[12250, 485]`. */
  productIds: number[];
};

export interface RegisterResult {
  /** The API's confirmation, e.g. "Account created. Your account is pending admin approval." */
  message: string;
  /** App path to go to next (the API sends `/account/login`). */
  redirect: string;
}

/** Registers the user via `POST /api/v1/user-panel/register`; rejects with the API message on a 4xx. */
export async function register(request: RegisterRequest): Promise<RegisterResult> {
  let response: Response;
  try {
    response = await apiFetch('/api/v1/user-panel/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        Name: request.fullName,
        MobileNumber: request.phone,
        CompanyName: request.company,
        // Not collected by the form; the API expects the keys.
        Designation: '',
        Location: '',
        ProductIds: request.productIds,
        OtherProduct: '',
        Email: request.email,
        Password: request.password,
        ConfirmPassword: request.confirmPassword,
      }),
    });
  } catch {
    throw new Error(GENERIC_ERROR);
  }

  if (!response.ok) {
    const body: unknown = await response.json().catch(() => null);
    const message =
      typeof body === 'object' && body !== null && 'message' in body && typeof body.message === 'string'
        ? body.message
        : GENERIC_ERROR;
    throw new Error(message);
  }

  const body: unknown = await response.json().catch(() => null);
  const message = readString(body, 'message') ?? 'Registration successful.';
  const redirect = readString(readObject(body, 'data'), 'redirect');
  // Only same-app paths are followed; anything else falls back to the login screen.
  const isAppPath = redirect !== null && redirect.startsWith('/') && !redirect.startsWith('//');
  return { message, redirect: isAppPath ? redirect : '/account/login' };
}

function readObject(source: unknown, key: string): unknown {
  return typeof source === 'object' && source !== null && key in source ? (source as Record<string, unknown>)[key] : null;
}

function readString(source: unknown, key: string): string | null {
  const value = readObject(source, key);
  return typeof value === 'string' && value !== '' ? value : null;
}
