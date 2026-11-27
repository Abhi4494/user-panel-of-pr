import { postApi } from '@/lib/apiData';

/**
 * Stores a price alert: the user is notified when the product's price in that location reaches `priceThreshold`.
 * `POST /api/v1/user-panel/store-price-alerts` with `{ productId, locationId, priceThreshold }`. Throws an `Error` whose message is
 * safe to show (the API's own message when it gave one).
 */
export const setPriceAlert = (productId: string, locationId: string, priceThreshold: number) =>
  postApi('/api/v1/user-panel/store-price-alerts', { productId, locationId, priceThreshold: String(priceThreshold) }, 'We could not set the alert right now. Please try again.');
