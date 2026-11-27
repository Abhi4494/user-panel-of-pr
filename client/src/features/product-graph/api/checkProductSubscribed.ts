import { apiFetch } from '@/lib/api';

/**
 * Checks whether the logged-in user has an active subscription for a product + location.
 * `GET /api/v1/user-panel/check-product-subscribed?productId=X&locationId=Y`.
 */
export async function checkProductSubscribed(productId: string, locationId: string): Promise<boolean> {
  const params = new URLSearchParams({ productId, locationId });
  const response = await apiFetch(`/api/v1/user-panel/check-product-subscribed?${params}`);
  const body = await response.json().catch(() => null);
  if (!response.ok) return false;
  return body?.data?.isSubscribed === true;
}
