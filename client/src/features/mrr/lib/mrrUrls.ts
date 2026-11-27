import { listUrl } from '@/features/report-list/lib/listUrl';

/**
 * The Industry Reports list (opened by every category tile and by "Latest Reports" -> "View All").
 * The path is guessed from the PCR naming (`loadallpcrreport`), as production's own URL was not available.
 */
export const ALL_MRR_REPORTS_PATH = '/dashboard/loadallmrrreport';

/** `mrrReportsUrl({ categoryId: 2 })` -> `.../loadallmrrreport?categoryId=2`; `mrrReportsUrl({ search: 'whey' })` -> `...?search=whey`. */
export const mrrReportsUrl = (filters: { categoryId?: number | null; search?: string } = {}) => listUrl(ALL_MRR_REPORTS_PATH, filters);

/** The news list ("View All" in the News Articles panel). */
export const NEWS_ARTICLES_PATH = '/dashboard/newsarticles';
