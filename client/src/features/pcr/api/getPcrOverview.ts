import { getApiData, records, text } from '@/lib/apiData';
import type { PcrOverview } from '@/features/pcr/types';
import { parseApiDay } from '@/lib/parseApiDay';
import { pcrUrl } from '@/lib/websiteUrl';

/** Totals, recent cost models and purchased reports for the PCR dashboard, from `GET /api/v1/user-panel/pcr-dashboard`. */
export async function getPcrOverview(): Promise<PcrOverview> {
  const data = await getApiData('/api/v1/user-panel/pcr-dashboard', 'Unable to load the production cost reports right now.');

  return {
    totals: {
      totalReports: Number(data.TotalReports) || 0,
      purchasedReports: Number(data.PurchasedReports) || 0,
      bookmarkedReports: Number(data.BookmarkedReportCount) || 0,
    },
    recentModels: records(data.ReportsList).map((report) => ({
      id: text(report, 'PCReportID'),
      title: text(report, 'ShortName') || text(report, 'Name'),
      description: text(report, 'ShortDescription'),
      categoryId: Number(report.CategoryID) || 0,
      categoryName: text(report, 'CategoryName'),
      country: text(report, 'CountryName'),
      href: pcrUrl(text(report, 'Url')),
    })),
    purchasedReports: records(data.PurchasedReportsList).map((report) => ({
      title: text(report, 'ShortName') || text(report, 'Name'),
      href: pcrUrl(text(report, 'Url')),
      purchasedAt: parseApiDay(report.PurchaseDate),
    })),
  };
}
