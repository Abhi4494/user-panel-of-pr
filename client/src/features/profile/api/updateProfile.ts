import { authFetch } from '@/features/auth/api/authFetch';
import { readApiMessage } from '@/features/auth/api/readApiMessage';
import { UnauthorizedError } from '@/features/auth/api/UnauthorizedError';
import { parseProfile } from '@/features/profile/api/getProfile';
import type { Profile, ProfileChanges } from '@/features/profile/types';

const GENERIC_ERROR = 'Unable to update your profile right now. Please try again later.';

export interface UpdateProfileResult {
  message: string;
  /** The saved profile as the API now has it. */
  profile: Profile;
}

/**
 * Saves profile changes via `POST /api/v1/user-panel/profile` (multipart form; the photo goes in the `Image` file field).
 * Only the given fields are sent. Rejects with the API's message (e.g. "Email Id already Exists"), or with
 * `UnauthorizedError` when the session has ended.
 */
export async function updateProfile(changes: ProfileChanges): Promise<UpdateProfileResult> {
  const form = new FormData();
  if (changes.name !== undefined) form.append('Name', changes.name);
  if (changes.mobileNumber !== undefined) form.append('MobileNumber', changes.mobileNumber);
  if (changes.landline !== undefined) form.append('Landline', changes.landline);
  if (changes.email !== undefined) form.append('Email', changes.email);
  if (changes.bio !== undefined) form.append('Bio', changes.bio);
  if (changes.image) form.append('Image', changes.image);

  let response: Response;
  try {
    // No Content-Type header: the browser sets the multipart boundary itself.
    response = await authFetch('/api/v1/user-panel/profile', { method: 'POST', body: form });
  } catch (error) {
    throw error instanceof UnauthorizedError ? error : new Error(GENERIC_ERROR);
  }

  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) throw new Error(readApiMessage(body) ?? GENERIC_ERROR);

  const profile = parseProfile(typeof body === 'object' && body !== null && 'data' in body ? body.data : null);
  if (!profile) throw new Error(GENERIC_ERROR);
  return { message: readApiMessage(body) ?? 'Profile updated successfully', profile };
}
