import { listUrl } from '@/features/report-list/lib/listUrl';

/** The all-reports screen (the live site's `/dashboard/loadallpcrreport`). Every "View All" and category chip points here. */
export const ALL_REPORTS_PATH = '/dashboard/loadallpcrreport';

/** Link to the all-reports list, optionally pre-filtered: `reportsUrl({ categoryId: 1 })` -> `.../loadallpcrreport?categoryId=1`. */
export const reportsUrl = (filters: { categoryId?: number | null; search?: string } = {}) => listUrl(ALL_REPORTS_PATH, filters);
