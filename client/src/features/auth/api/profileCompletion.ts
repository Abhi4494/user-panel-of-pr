import { authFetch } from '@/features/auth/api/authFetch';
import { UnauthorizedError } from '@/features/auth/api/UnauthorizedError';

export interface AreaOfInterest {
  id: number;
  name: string;
  /** True when the user already saved this area. */
  selected: boolean;
}

const LOAD_ERROR = 'Unable to load the areas of interest right now. Please try again later.';
const SAVE_ERROR = 'We could not save your profile right now. Please try again.';

const asObject = (value: unknown): Record<string, unknown> => (typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : {});

/** The top-level industries to choose from, with the user's saved choices: `GET /api/v1/user-panel/areas-of-interest`. */
export async function getAreasOfInterest(): Promise<AreaOfInterest[]> {
  let response: Response;
  try {
    response = await authFetch('/api/v1/user-panel/areas-of-interest');
  } catch (error) {
    throw error instanceof UnauthorizedError ? error : new Error(LOAD_ERROR);
  }
  if (!response.ok) throw new Error(LOAD_ERROR);
  const body = asObject(await response.json().catch(() => null));
  const items = asObject(body.data).items;
  return (Array.isArray(items) ? items : [])
    .map((item) => asObject(item))
    .map((item) => ({ id: Number(item.id), name: typeof item.name === 'string' ? item.name : '', selected: item.selected === true }))
    .filter((area) => area.id > 0 && area.name);
}

/** Saves the chosen areas and marks the profile complete: `POST /api/v1/user-panel/complete-profile`. Returns the API's confirmation message. */
export async function completeProfile(interestIds: number[]): Promise<string> {
  let response: Response;
  try {
    response = await authFetch('/api/v1/user-panel/complete-profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ interestIds }),
    });
  } catch (error) {
    throw error instanceof UnauthorizedError ? error : new Error(SAVE_ERROR);
  }
  const body = asObject(await response.json().catch(() => null));
  const message = typeof body.message === 'string' && body.message ? body.message : '';
  if (!response.ok) throw new Error(message || SAVE_ERROR);
  return message || 'Profile Completed';
}
