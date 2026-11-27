import { apiFetch } from '@/lib/api';
import type { PricePoint } from '@/features/product-graph/types';

/** Fetches the price series for one extra series (product + location) using the existing graph endpoint. */
export async function getExtraSeriesData(
  slug: string,
  locationShortName: string,
  unitId: string,
  currency: string,
  /** When true, a failed request throws with the API's message instead of returning an empty series. */
  throwOnError = false,
  /** Set by the Graph Library so a saved graph can be previewed even without a current subscription (see the API). */
  savedGraphId?: number,
): Promise<PricePoint[]> {
  const response = await apiFetch('/api/v1/user-panel/price-trend-product-graph', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productURL: slug, countryShortName: locationShortName, unitId, currency, ...(savedGraphId ? { savedGraphId } : {}) }),
  });
  const body = await response.json().catch(() => null);
  // Surface the API's reason (e.g. 403 "You are not subscribed to this product") instead of an empty series.
  if (!response.ok && throwOnError) {
    throw new Error(typeof body?.message === 'string' && body.message ? body.message : `Request failed (${response.status})`);
  }
  if (!response.ok || !body?.data?.data) return [];

  const rows: unknown[] = Array.isArray(body.data.data) ? body.data.data : [];
  const forecastCount = Math.max(0, Math.min(rows.length, Number(body.data.forecastCount) || 0));
  const firstForecastIdx = rows.length - forecastCount;

  return rows
    .map((row: unknown, index: number): PricePoint => {
      const r = row as Record<string, unknown>;
      const isForecast = r.isForecast === true || r.isForecast === 1 || r.isForecast === '1' || index >= firstForecastIdx;
      return {
        date: String(r.date ?? '').slice(0, 10),
        value: Number(r.price),
        ...(isForecast ? { forecast: true as const } : {}),
      };
    })
    .filter((pt) => /^\d{4}-\d{2}-\d{2}$/.test(pt.date) && Number.isFinite(pt.value))
    .sort((a, b) => a.date.localeCompare(b.date));
}
