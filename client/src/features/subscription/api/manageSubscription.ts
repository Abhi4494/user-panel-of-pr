import { productGraphPath } from '@/features/product-search/lib/productUrl';
import { ApiError, getApiData, records, text } from '@/lib/apiData';

export interface SubscriptionSummary {
  activeCount: number;
  expiredCount: number;
}

export interface SubscriptionItem {
  id: string;
  productName: string;
  categoryName: string;
  locationName: string;
  /** Link to the product's graph for that location; empty when the product has no URL. */
  href: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface SubscriptionPage {
  items: SubscriptionItem[];
  total: number;
}

export interface SubscriptionRequestRow {
  id: string;
  message: string;
  statusLabel: string;
  createdDate: string;
}

const BASE = '/api/v1/user-panel/manage-subscription';

/** `GET /manage-subscription/summary`: how many subscriptions are running and how many have expired. */
export async function getSubscriptionSummary(): Promise<SubscriptionSummary> {
  const data = await getApiData(`${BASE}/summary`, 'Unable to load your subscriptions right now.');
  return { activeCount: Number(data.activeCount) || 0, expiredCount: Number(data.expiredCount) || 0 };
}

/** `GET /manage-subscription/subscriptions`: one page of the user's subscriptions (active first). `search` may be "active", "expired" or part of a product name. */
export async function getMySubscriptions(page: number, limit: number, search: string): Promise<SubscriptionPage> {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (search) params.set('search', search);
  const data = await getApiData(`${BASE}/subscriptions?${params.toString()}`, 'Unable to load your subscriptions right now.');
  const items = records(data.items)
    .map((row): SubscriptionItem => {
      const slug = text(row, 'productUrl');
      const location = text(row, 'locationShortName') || text(row, 'locationName');
      return {
        id: String(row.id ?? ''),
        productName: text(row, 'productName'),
        categoryName: text(row, 'categoryName'),
        locationName: text(row, 'locationName'),
        href: slug && location ? productGraphPath(slug, location) : '',
        startDate: text(row, 'startDate'),
        endDate: text(row, 'endDate'),
        isActive: row.isActive === true,
      };
    })
    .filter((item) => item.id && item.productName);
  return { items, total: Number(data.total) || 0 };
}

/** `GET /manage-subscription/requests`: every request the user raised, newest first. */
export async function getMySubscriptionRequests(): Promise<SubscriptionRequestRow[]> {
  const data = await getApiData(`${BASE}/requests`, 'Unable to load your requests right now.');
  return records(data.items)
    .map((row) => ({
      id: String(row.id ?? ''),
      message: text(row, 'message'),
      statusLabel: text(row, 'statusLabel') || 'New',
      createdDate: text(row, 'createdDate'),
    }))
    .filter((row) => row.id);
}

export interface ProductOption {
  id: number;
  name: string;
}

export interface LocationOption {
  id: number;
  name: string;
}

const USER_PANEL = '/api/v1/user-panel';

/** Products whose name contains `searchText` (3+ characters): `GET /search/global`. No match is an empty list, not an error. */
export async function searchProductsToRequest(searchText: string): Promise<ProductOption[]> {
  try {
    const data = await getApiData(`${USER_PANEL}/search/global?searchText=${encodeURIComponent(searchText)}`, 'Unable to search products right now.');
    return records(data.Products)
      .map((row) => ({ id: Number(row.ProductID ?? row.ProductId), name: text(row, 'Name') }))
      .filter((product) => product.id > 0 && product.name);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return [];
    throw error;
  }
}

/** The places a product is tracked in: `GET /location-by-product`. */
export async function getLocationsToRequest(productId: number): Promise<LocationOption[]> {
  const data = await getApiData(`${USER_PANEL}/location-by-product?productId=${productId}`, 'Unable to load the locations right now.');
  return records(data)
    .map((row) => ({ id: Number(row.CountryId ?? row.CountryID), name: text(row, 'CountryName') || text(row, 'CountryShortName') }))
    .filter((location) => location.id > 0 && location.name);
}
