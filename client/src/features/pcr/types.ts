/* ---------- API contracts (what the backend returns; see docs/architecture.md) ---------- */

/** A production cost report as listed on the dashboard ("Recent Cost Models") and on the all-reports page. */
export interface PcrReport {
  id: string;
  title: string;
  description: string;
  categoryId: number;
  categoryName: string;
  country: string;
  /** The report's page on the website. */
  href: string;
}

/** One row of the dashboard's "Purchased Reports" card. */
export interface PurchasedReport {
  title: string;
  /** The report's page on the website. */
  href: string;
  /** Purchase day, ISO `YYYY-MM-DD`. */
  purchasedAt: string;
}

/** GET /api/v1/user-panel/pcr-dashboard */
export interface PcrOverview {
  totals: { totalReports: number; purchasedReports: number; bookmarkedReports: number };
  recentModels: PcrReport[];
  purchasedReports: PurchasedReport[];
}

/* The all-reports list (`GET /api/v1/user-panel/pcr-reports`) uses the shared `ReportListQuery` / `ReportListResult` of `features/report-list`. */
