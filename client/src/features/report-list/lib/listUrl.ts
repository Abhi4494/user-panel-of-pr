/**
 * Link to a reports list screen, optionally pre-filtered:
 * `listUrl('/dashboard/loadallpcrreport', { categoryId: 1 })` -> `/dashboard/loadallpcrreport?categoryId=1`.
 */
export function listUrl(basePath: string, { categoryId, search }: { categoryId?: number | null; search?: string } = {}): string {
  const params = new URLSearchParams();
  if (categoryId != null) params.set('categoryId', String(categoryId));
  if (search?.trim()) params.set('search', search.trim());
  const query = params.toString();
  return query ? `${basePath}?${query}` : basePath;
}

/** `?categoryId=` -> a positive integer, or null when missing/invalid (never trust the URL). */
export function parseCategoryId(value: string | null): number | null {
  if (value === null || !/^\d{1,6}$/.test(value)) return null;
  const id = Number(value);
  return id > 0 ? id : null;
}
