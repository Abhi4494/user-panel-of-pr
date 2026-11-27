import { getMrrOverview } from '@/features/mrr/api/getMrrOverview';
import type { LibraryOverview } from '@/features/library/types';

/**
 * Totals, trending report and news for the Library screen (production calls it "Live Report Dashboard", `/dashboard/LiveReportDashboard`).
 *
 * MOCK DATA: values are those of the reference screenshot (1 report, 0 purchased, 1 bookmarked); news is shared with the Industry Reports screen.
 *
 * TODO(backend): replace with `GET /api/library/overview` -> `LibraryOverview`. Keep the signature.
 */
export async function getLibraryOverview(): Promise<LibraryOverview> {
  const { news } = await getMrrOverview();
  return {
    totals: { totalReports: 1, purchasedReports: 0, bookmarkedReports: 1 },
    trending: {
      id: 'global-optical-fibre-market',
      title: 'Global Optical Fibre Market: Analysis and Forecast 2024-2032',
      publishedAt: '2022-03-17',
      categoryId: 10,
      categoryName: 'Other',
      href: '/dashboard/livereportdetail',
    },
    latestReports: [{ id: 'global-optical-fibre-market', title: 'Global Optical Fibre Market: Analysis and Forecast 2024-2032', publishedAt: '2022-03-17', href: '/dashboard/livereportdetail' }],
    news,
  };
}
