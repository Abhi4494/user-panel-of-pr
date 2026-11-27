import { getApiData, records, text } from '@/lib/apiData';
import { assetUrl } from '@/lib/api';

/** Which list: the sidebar's "My Purchases" or "My Subscriptions" group. */
export type MyReportsGroup = 'purchases' | 'subscriptions';

/** The three report kinds, as they appear in the sidebar URLs (`/dashboard/purchases/industry-reports`). */
export type MyReportsKind = 'industry-reports' | 'production-cost-reports' | 'strategy-reports';

export interface MyReport {
  id: string;
  title: string;
  shortDescription: string;
  /** The report's slug on the public website (`/reports/{url}` or `/cost-analysis/{url}`); empty when the report no longer exists. */
  url: string;
  imageUrl: string;
  categoryName: string;
  locationName: string;
  quarter: string;
  /** Purchases only. */
  orderNumber: string;
  planName: string;
  amount: number | null;
  /** Purchase date (purchases) as an ISO string. */
  date: string;
  /** Subscription period (subscriptions). */
  startDate: string;
  endDate: string;
}

export interface MyReportsPage {
  items: MyReport[];
  total: number;
}

export interface MyReportsQuery {
  page: number;
  limit: number;
  search: string;
  categoryId?: number;
}

const API_KIND: Record<MyReportsKind, string> = {
  'industry-reports': 'industry',
  'production-cost-reports': 'production-cost',
  'strategy-reports': 'strategy',
};

export const isMyReportsKind = (value: string): value is MyReportsKind => value in API_KIND;

/** `GET /my-reports/{purchases|subscriptions}/{kind}`: one page of the user's paid orders or active subscriptions. */
export async function getMyReports(group: MyReportsGroup, kind: MyReportsKind, query: MyReportsQuery): Promise<MyReportsPage> {
  const params = new URLSearchParams({ page: String(query.page), limit: String(query.limit) });
  if (query.search) params.set('search', query.search);
  if (query.categoryId) params.set('categoryId', String(query.categoryId));
  const data = await getApiData(`/api/v1/user-panel/my-reports/${group}/${API_KIND[kind]}?${params.toString()}`, 'Unable to load your reports right now.');
  const items = records(data.items)
    .map((row): MyReport => {
      const image = text(row, 'image');
      return {
        id: String(row.id ?? ''),
        title: text(row, 'title'),
        shortDescription: text(row, 'shortDescription'),
        url: text(row, 'url'),
        imageUrl: image ? assetUrl(image) : '',
        categoryName: text(row, 'categoryName'),
        locationName: text(row, 'locationName'),
        quarter: text(row, 'quarter'),
        orderNumber: text(row, 'orderNumber'),
        planName: text(row, 'planName'),
        amount: row.amount === null || row.amount === undefined ? null : Number(row.amount),
        date: text(row, 'date'),
        startDate: text(row, 'startDate'),
        endDate: text(row, 'endDate'),
      };
    })
    .filter((report) => report.id && report.title);
  return { items, total: Number(data.total) || 0 };
}
