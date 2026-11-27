import { apiFetch } from '@/lib/api';

export interface SavedGraphSeries {
  slug: string | null;
  productName: string | null;
  locationShortName: string | null;
  locationName: string | null;
  /** Price-basis label such as "Spot" or "FOB"; part of the legend name, like the .NET dashboard. */
  locationData?: string | null;
  isDefault: boolean;
}

export interface SavedGraph {
  graphDashboardId: number;
  title: string;
  description: string | null;
  series: SavedGraphSeries[];
  slug: string | null;
  productName: string | null;
  locationShortName: string | null;
  locationName: string | null;
  unitName: string | null;
  unitId: string | null;
  currency: string | null;
  createdDate: string | null;
}

export async function getSavedGraphs(): Promise<SavedGraph[]> {
  const response = await apiFetch('/api/v1/user-panel/my-saved-graphs');
  const body = await response.json().catch(() => null);
  // A failed request must surface as an error, not as an empty library.
  if (!response.ok || !Array.isArray(body?.data)) throw new Error('Could not load saved graphs');
  return body.data as SavedGraph[];
}
