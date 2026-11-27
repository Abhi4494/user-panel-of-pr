import { getApiData, records, text } from '@/lib/apiData';
import type { MrrOverview } from '@/features/mrr/types';
import { assetUrl } from '@/lib/api';
import { parseApiDay } from '@/lib/parseApiDay';
import { industryUrl, newsUrl, reportUrl } from '@/lib/websiteUrl';

/** Newest reports shown in the "Latest Reports" card. */
const LATEST_COUNT = 5;

/**
 * Totals, the trending report, the latest reports and the news for the Industry Reports dashboard, from
 * `GET /api/v1/user-panel/mrr-dashboard`. The API has no separate "trending" report, so the newest one is featured.
 */
export async function getMrrOverview(): Promise<MrrOverview> {
  const data = await getApiData('/api/v1/user-panel/mrr-dashboard', 'Unable to load the industry reports right now.');

  const reports = records(data.ReportsList).map((report) => {
    const category = records(report.Categories)[0];
    return {
      id: text(report, 'ReportId'),
      title: text(report, 'ShortTitle'),
      publishedAt: parseApiDay(report.CreatedDate),
      categoryId: Number(category?.CategoryId) || 0,
      categoryName: category ? text(category, 'CategoryName') : '',
      categoryHref: category ? industryUrl(text(category, 'Url')) : undefined,
      href: reportUrl(text(report, 'Url')),
    };
  });
  if (reports.length === 0) throw new Error('Unable to load the industry reports right now.');

  return {
    totals: {
      totalReports: Number(data.TotalReports) || 0,
      purchasedReports: Number(data.PurchasedReports) || 0,
      bookmarkedReports: Number(data.BookmarkedReportCount) || 0,
    },
    trending: reports[0],
    latestReports: reports.slice(0, LATEST_COUNT).map(({ id, title, publishedAt, href }) => ({ id, title, publishedAt, href })),
    news: records(data.NewsArticles).map((article) => {
      const image = text(article, 'CardImage');
      return {
        id: text(article, 'ArticleID'),
        title: text(article, 'Title'),
        publishedAt: parseApiDay(article.CreatedDate),
        imageUrl: assetUrl(image),
        href: newsUrl(text(article, 'Url')),
      };
    }),
  };
}
