import { apiFetch, assetUrl } from '@/lib/api';
import type { Category } from '@/features/catalog/types';

const GENERIC_ERROR = 'Unable to load the categories right now.';

/**
 * All industry categories, in the order the API returns them, from `GET /api/v1/user-panel/categories`.
 * Used by every screen that lists categories (Industry Reports and Production Cost dashboards, library, report-list filter).
 */
export async function getCategories(): Promise<Category[]> {
  let response: Response;
  try {
    response = await apiFetch('/api/v1/user-panel/categories');
  } catch {
    throw new Error(GENERIC_ERROR);
  }
  if (!response.ok) throw new Error(GENERIC_ERROR);

  const body: unknown = await response.json().catch(() => null);
  const data = typeof body === 'object' && body !== null && 'data' in body ? body.data : null;
  if (!Array.isArray(data)) throw new Error(GENERIC_ERROR);
  return data.map(parseCategory).filter((category): category is Category => category !== null);
}

/** Maps one API category (`CategoryId`, `CategoryName`, `CategoryImage`) to the screens' `Category`. */
function parseCategory(item: unknown): Category | null {
  if (typeof item !== 'object' || item === null) return null;
  const record = item as Record<string, unknown>;
  const id = Number(record.CategoryId);
  const name = typeof record.CategoryName === 'string' ? record.CategoryName : '';
  if (!Number.isFinite(id) || !name) return null;
  const image = typeof record.CategoryImage === 'string' ? record.CategoryImage : '';
  return { id, name, imageUrl: image ? assetUrl(image) : undefined };
}
