import type { PriceAlert } from '@/features/alerts/types';
import { productGraphPath } from '@/features/product-search/lib/productUrl';
import { getApiData, records, text } from '@/lib/apiData';

/** `GET /api/v1/user-panel/price-alerts`: `data` is the list of the user's alerts. */
export async function getPriceAlerts(): Promise<PriceAlert[]> {
  const rows = records(await getApiData('/api/v1/user-panel/price-alerts', 'Unable to load your alerts right now.'));
  return rows
    .map((row) => ({
      id: String(row.AlertId ?? ''),
      productName: text(row, 'ProductName'),
      href: text(row, 'ProductUrl') ? productGraphPath(text(row, 'ProductUrl'), text(row, 'CountryShortName') || text(row, 'LocationName')) : '',
      categoryName: text(row, 'CategoryName'),
      locationName: text(row, 'LocationName'),
      price: Number(row.Price),
    }))
    .filter((alert) => alert.id && alert.productName);
}
