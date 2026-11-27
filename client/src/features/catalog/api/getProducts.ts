import type { ProductOption } from '@/features/catalog/types';
import { apiFetch } from '@/lib/api';

const GENERIC_ERROR = 'Unable to load products right now.';

interface ProductListResponse {
  data: { ProductID: string; Name: string }[];
}

/** Products matching `searchText` (empty text returns the full list), via `GET /api/v1/user-panel/product-list`. */
export async function getProducts(searchText: string, signal?: AbortSignal): Promise<ProductOption[]> {
  const response = await apiFetch(`/api/v1/user-panel/product-list?search_text=${encodeURIComponent(searchText)}`, { signal });
  if (!response.ok) throw new Error(GENERIC_ERROR);

  const body: unknown = await response.json().catch(() => null);
  if (!isProductListResponse(body)) throw new Error(GENERIC_ERROR);
  return body.data.map((product) => ({ id: product.ProductID, name: product.Name }));
}

function isProductListResponse(body: unknown): body is ProductListResponse {
  return typeof body === 'object' && body !== null && 'data' in body && Array.isArray(body.data);
}
