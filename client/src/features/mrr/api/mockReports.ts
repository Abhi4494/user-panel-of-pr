import { MOCK_CATEGORIES } from '@/features/catalog/api/mockCategories';
import { MOCK_PRODUCTS_BY_CATEGORY } from '@/features/catalog/api/mockProducts';
import type { ReportSummary } from '@/features/report-list/types';

/**
 * MOCK DATA ONLY (the real data comes from the backend, see `getMrrReports.ts` / `getMrrOverview.ts`).
 * The first five reports are the "Latest Reports" rows of the reference screenshot (titles and dates); the rest of the 3,159 are generated
 * deterministically, newest first, so the list, paging, search and category filter have something realistic to work on.
 */

/** Total number of reports (the dashboard shows this as "Total Reports"). */
export const MOCK_MRR_TOTAL = 3159;

const TITLE_SUFFIX = 'Manufacturing Plant Project Report 2025: Cost Analysis, ROI, and Feasibility Insights';
const reportHref = (id: string) => `/dashboard/mrrreport/${id}`;
const DAY_MS = 24 * 3600 * 1000;
const iso = (ms: number) => new Date(ms).toISOString().slice(0, 10);
const slug = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/** [product, categoryId, day] from the reference screenshot (category ids per the shared catalog). */
const FROM_SCREENSHOT: Array<[string, number, string]> = [
  ['Transforming Growth Factor Alpha (TGF-a)', 9, '2025-11-12'],
  ['Soybean Hulls', 3, '2025-11-11'],
  ['Sorbitol Corn', 4, '2025-11-11'],
  ['Laminaria', 3, '2025-11-11'],
  ['Frozen Vegetables', 4, '2025-11-11'],
];

function build(product: string, categoryId: number, publishedAt: string): ReportSummary {
  const id = slug(product);
  const category = MOCK_CATEGORIES.find((candidate) => candidate.id === categoryId) ?? MOCK_CATEGORIES[0];
  return {
    id,
    title: `${product} ${TITLE_SUFFIX}`,
    description: `This report provides a comprehensive project report on setting up a ${product} manufacturing plant, covering the process flow, machinery, raw materials, utilities, capital investment and profitability.`,
    categoryId: category.id,
    categoryName: category.name,
    publishedAt,
    href: reportHref(id),
  };
}

function generated(index: number): ReportSummary {
  const position = index % MOCK_CATEGORIES.length;
  const product = `${MOCK_PRODUCTS_BY_CATEGORY[position][Math.floor(index / 10) % 6]} ${['Grade A', 'Grade B', 'Premium', 'Industrial', 'Refined'][index % 5]}`;
  const day = iso(Date.UTC(2025, 10, 10) - Math.floor((index - FROM_SCREENSHOT.length) * 0.85) * DAY_MS);
  const report = build(`${product} ${index + 1}`, MOCK_CATEGORIES[position].id, day);
  return report;
}

/** All reports, newest first. */
export const MOCK_MRR_REPORTS: ReportSummary[] = Array.from({ length: MOCK_MRR_TOTAL }, (_, index) =>
  index < FROM_SCREENSHOT.length ? build(...FROM_SCREENSHOT[index]) : generated(index),
);
