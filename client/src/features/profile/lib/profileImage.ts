import { apiUrl } from '@/lib/api';

/**
 * Browser URL of the profile photo the API reports in `Image`, or `undefined` for "no photo". The API stores uploads as
 * `uploaded-files/user-profile/<file>` and serves them from its web root (the dev proxy forwards that path), while its
 * default placeholder (`/img/usericon.png`) is not served here, so the avatar falls back to the user's initial.
 */
export function profileImageUrl(image: unknown): string | undefined {
  if (typeof image !== 'string' || image === '') return undefined;
  const path = image.replace(/^\/+/, '');
  return path.startsWith('uploaded-files/') ? apiUrl(`/${path}`) : undefined;
}
