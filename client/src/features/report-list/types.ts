/* ---------- Shapes shared by every "All ... Reports" screen (Production Cost Reports, Industry Reports) ---------- */

/** One report as a list row/card shows it. Each report type's api maps its own report shape to this. */
export interface ReportSummary {
  id: string;
  title: string;
  description: string;
  categoryId: number;
  categoryName: string;
  /** Publication day, ISO `YYYY-MM-DD`. */
  publishedAt: string;
  /** Internal path of the report's own screen. */
  href: string;
  /** Small grey facts under the description, e.g. `["Q1 2025", "Germany"]`. Omit for none. */
  facts?: string[];
}

/** What a list screen asks the backend for (server-side filtering and paging, like a DataTables list). */
export interface ReportListQuery {
  categoryId: number | null;
  search: string;
  /** 1-based. */
  page: number;
  pageSize: number;
}

/** One page of results. */
export interface ReportListResult {
  items: ReportSummary[];
  /** Number of reports matching the filters (not just this page). */
  total: number;
}
