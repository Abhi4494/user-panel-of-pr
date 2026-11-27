import { postApi } from '@/lib/apiData';

/** `POST /api/v1/user-panel/delete-price-alert` with `{ alertId }`. */
export const deletePriceAlert = (alertId: string) => postApi('/api/v1/user-panel/delete-price-alert', { alertId }, 'We could not delete this alert right now. Please try again.');
