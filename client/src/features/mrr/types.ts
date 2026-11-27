/* ---------- API contracts (what the backend returns; see docs/architecture.md) ---------- */

/** The report featured in the peach "Trending Reports" card. */
export interface TrendingReport {
  id: string;
  title: string;
  /** Publication day, ISO `YYYY-MM-DD`. */
  publishedAt: string;
  categoryId: number;
  categoryName: string;
  /** The category's page on the website; when missing, the category is shown as plain text. */
  categoryHref?: string;
  /** Cover image; when missing, a neutral placeholder is drawn. */
  coverUrl?: string;
  /** Internal path of the report's own screen. */
  href: string;
}

/** One card in the "News Articles" panel. */
export interface NewsArticle {
  id: string;
  title: string;
  /** Publication day, ISO `YYYY-MM-DD`. */
  publishedAt: string;
  imageUrl: string;
  href: string;
}

/** One row of the "Latest Reports" card: just a title and a date. */
export interface LatestReport {
  id: string;
  title: string;
  /** Publication day, ISO `YYYY-MM-DD` (shown as "Nov 12"). */
  publishedAt: string;
  href: string;
}

/** GET /api/mrr/overview (the category tiles come from the shared `GET /api/categories`; the full list is `GET /api/mrr/reports`). */
export interface MrrOverview {
  totals: { totalReports: number; purchasedReports: number; bookmarkedReports: number };
  trending: TrendingReport;
  /** The newest reports, newest first (the reference shows 5). */
  latestReports: LatestReport[];
  news: NewsArticle[];
}
