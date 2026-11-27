import { apiFetch } from '@/lib/api';

export interface ProductLocationOption {
  id: string | number; // CountryID
  value: string; // CountryShortName
  label: string; // CountryName
}

/** Fetches ALL locations for a product (no subscription filter), matching .NET GetLocationByProductUrl logic. */
export async function getProductLocationsForGraph(slug: string): Promise<ProductLocationOption[]> {
  const params = new URLSearchParams({ slug });
  const response = await apiFetch(`/api/v1/user-panel/product-locations-for-graph?${params}`);
  const body = await response.json().catch(() => null);
  if (!response.ok || !body?.data?.locations) return [];
  return body.data.locations as ProductLocationOption[];
}
