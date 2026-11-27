import { authFetch } from '@/features/auth/api/authFetch';
import { UnauthorizedError } from '@/features/auth/api/UnauthorizedError';
import type { DashboardUser } from '@/features/dashboard/types';
import { profileImageUrl } from '@/features/profile/lib/profileImage';

const GENERIC_ERROR = 'Unable to load your account right now.';

interface ProfileResponse {
  data: { RegistrationID: string; Name: string };
}

/**
 * The signed-in user, from `GET /api/v1/user-panel/profile` (the session cookie identifies the user). An expired access
 * cookie is renewed transparently (see `authFetch`). Throws `UnauthorizedError` when the user has to sign in again.
 */
export async function getCurrentUser(): Promise<DashboardUser> {
  let response: Response;
  try {
    response = await authFetch('/api/v1/user-panel/profile');
  } catch (error) {
    throw error instanceof UnauthorizedError ? error : new Error(GENERIC_ERROR);
  }
  if (!response.ok) throw new Error(GENERIC_ERROR);

  const body: unknown = await response.json().catch(() => null);
  if (!isProfileResponse(body)) throw new Error(GENERIC_ERROR);
  return {
    id: body.data.RegistrationID,
    name: body.data.Name,
    avatarUrl: profileImageUrl((body.data as { Image?: unknown }).Image),
    roleLabel: 'Customer',
  };
}

function isProfileResponse(body: unknown): body is ProfileResponse {
  if (typeof body !== 'object' || body === null || !('data' in body)) return false;
  const { data } = body;
  return typeof data === 'object' && data !== null && 'RegistrationID' in data && 'Name' in data && typeof data.Name === 'string';
}
