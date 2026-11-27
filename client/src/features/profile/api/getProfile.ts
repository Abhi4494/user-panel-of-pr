import { authFetch } from '@/features/auth/api/authFetch';
import { UnauthorizedError } from '@/features/auth/api/UnauthorizedError';
import { profileImageUrl } from '@/features/profile/lib/profileImage';
import type { Profile } from '@/features/profile/types';

const GENERIC_ERROR = 'Unable to load your profile right now.';

/** The signed-in user's profile, from `GET /api/v1/user-panel/profile`. Throws `UnauthorizedError` when the session has ended. */
export async function getProfile(): Promise<Profile> {
  let response: Response;
  try {
    response = await authFetch('/api/v1/user-panel/profile');
  } catch (error) {
    throw error instanceof UnauthorizedError ? error : new Error(GENERIC_ERROR);
  }
  if (!response.ok) throw new Error(GENERIC_ERROR);

  const body: unknown = await response.json().catch(() => null);
  const profile = parseProfile(typeof body === 'object' && body !== null && 'data' in body ? body.data : null);
  if (!profile) throw new Error(GENERIC_ERROR);
  return profile;
}

/** Maps the API's profile object (also returned by the update call) to the screen's `Profile`. */
export function parseProfile(data: unknown): Profile | null {
  if (typeof data !== 'object' || data === null) return null;
  const record = data as Record<string, unknown>;
  const text = (key: string) => (typeof record[key] === 'string' ? (record[key] as string) : '');
  if (!text('Name')) return null;
  return {
    name: text('Name'),
    email: text('Email'),
    mobileNumber: text('MobileNumber'),
    landline: text('Landline'),
    bio: text('Bio').trim(),
    imageUrl: profileImageUrl(record.Image),
  };
}
