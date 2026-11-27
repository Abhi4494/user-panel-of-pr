import { getApiData, records, text } from '@/lib/apiData';
import type { PriceTrendsDashboard } from '@/features/price-trends/types';

/** Product graph screen of a product (same URL as the live site). */
const productHref = (url: string) => `/price-trend-dashboard/${url}`;

/**
 * Everything the Price Trends dashboard shows, from one call: `GET /api/v1/user-panel/price-trend-dashboard`
 * (totals, the products the user is subscribed to, and the product list with each one's subscription status).
 */
export async function getPriceTrendsDashboard(): Promise<PriceTrendsDashboard> {
  const data = await getApiData('/api/v1/user-panel/price-trend-dashboard', 'Unable to load the price trends right now.');

  return {
    totals: { locations: Number(data.locationCount) || 0, products: Number(data.productCount) || 0 },
    subscription: {
      count: Number(data.subscriptionCount) || 0,
      highlighted: records(data.subscriptionProductList).map((product) => ({
        id: text(product, 'ProductID'),
        name: text(product, 'Name'),
        href: productHref(text(product, 'Url')),
      })),
    },
    products: records(data.productList).map((product) => ({
      id: text(product, 'ProductID'),
      name: text(product, 'Name'),
      categoryName: text(product, 'CategoryName'),
      subscribed: text(product, 'SubscriptionStatus') === 'Subscribed',
      href: productHref(text(product, 'Url')),
    })),
  };
}
