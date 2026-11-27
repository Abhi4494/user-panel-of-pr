import { apiFetch } from '@/lib/api';

export interface SubscribedProduct {
  id: string | number;
  name: string;
  slug: string;
}

export async function getSubscribedProductsForGraph(unitId?: string): Promise<SubscribedProduct[]> {
  const params = new URLSearchParams();
  if (unitId) params.set('unitId', unitId);
  const response = await apiFetch(`/api/v1/user-panel/subscribed-products-for-graph?${params}`);
  const body = await response.json().catch(() => null);
  if (!response.ok || !body?.data?.products) return [];
  return body.data.products as SubscribedProduct[];
}
