import { apiFetch } from '@/lib/api';

export interface ExportSeries {
  label: string;
  rows: Array<{ month: number; year: number; price: number }>;
}

/**
 * Fetches monthly aggregated price data for each series (via SP `P_ExportData` on the backend).
 * `POST /api/v1/user-panel/export-graph`.
 */
export async function exportGraph(
  currency: string,
  graphProductLocation: Array<{ productId: string | number; locationId: string | number }>,
): Promise<ExportSeries[]> {
  const response = await apiFetch('/api/v1/user-panel/export-graph', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ currency, graphProductLocation }),
  });
  const body = await response.json().catch(() => null);
  if (!response.ok || !body?.data?.series) throw new Error('We could not export the data right now. Please try again.');
  return body.data.series as ExportSeries[];
}
