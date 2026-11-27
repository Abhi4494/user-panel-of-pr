import type { DashboardSummary } from '@/features/dashboard/types';
import { apiFetch } from '@/lib/api';

const GENERIC_ERROR = 'Unable to load the dashboard right now.';

/**
 * Headline counts for the dashboard home, from `GET /api/v1/user-panel/dashboard`.
 * Order matters: the grid places cards in this order (tall, small, tall, small).
 */
export async function getDashboardSummary(): Promise<DashboardSummary> {
  let response: Response;
  try {
    response = await apiFetch('/api/v1/user-panel/dashboard');
  } catch {
    throw new Error(GENERIC_ERROR);
  }
  if (!response.ok) throw new Error(GENERIC_ERROR);

  const body: unknown = await response.json().catch(() => null);
  const data = typeof body === 'object' && body !== null && 'data' in body ? body.data : null;
  if (typeof data !== 'object' || data === null) throw new Error(GENERIC_ERROR);
  const record = data as Record<string, unknown>;
  const count = (key: string) => Number(record[key]) || 0;

  return {
    stats: [
      { id: 'industry-reports', title: 'Industry Reports', count: count('industry_report_count'), unit: 'Reports', href: '/dashboard/mrrdashboard' },
      { id: 'price-trends', title: 'Price Trends', count: count('price_trend_product_count'), unit: 'Products', href: '/dashboard/pricetrend' },
      { id: 'production-cost-reports', title: 'Production Cost Reports', count: count('product_cost_report_count'), unit: 'Reports', href: '/dashboard/pcrdashboard' },
      { id: 'my-purchases', title: 'My Purchases', count: count('my_purchased_reports_count'), unit: 'Reports', href: '/dashboard/purchases/industry-reports' },
    ],
  };
}
