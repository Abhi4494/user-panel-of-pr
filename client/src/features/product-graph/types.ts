/* ---------- API contracts (what the backend returns; see docs/architecture.md) ---------- */

/** One observation of the price series. `date` is an ISO day (`YYYY-MM-DD`, UTC). */
export interface PricePoint {
  date: string;
  value: number;
  /** True for projected values; drawn as a dashed continuation of the last actual point. */
  forecast?: boolean;
}

export type ChangePeriod = 'W-o-W' | 'M-o-M' | 'Q-o-Q' | 'Y-o-Y';

/** Change versus an earlier period. `null` renders as "N/A" (no data for that period). */
export interface PriceChange {
  period: ChangePeriod;
  /** Percentage change, e.g. 28.94 for +28.94 %. */
  percent: number | null;
  /** The price it is compared against, e.g. 660 for the price three months ago. */
  previousPrice: number | null;
}

/** What the "Filter Chart" dialog changes: where the price is for, the currency and the unit (`unitId` is the API's id; empty = its default). */
export interface ChartFilters {
  /** `CountryShortName`, e.g. `China`. */
  location: string;
  /** Currency code, e.g. `USD`. */
  currency: string;
  unitId: string;
}

/** The choices the dialog offers for a product. */
export interface ProductFilterOptions {
  locations: Array<{ value: string; label: string }>;
  currencies: string[];
  units: Array<{ id: string; name: string }>;
}

/** The price series, latest price and changes of one product in one place. */
export interface ProductGraph {
  slug: string;
  name: string;
  /** Subtitle parts, shown joined by " | " (e.g. "Green Electricity", "USD/mWh", "Germany"). */
  subtitle: string[];
  /** Legend text under the chart. */
  seriesLabel: string;
  /** Latest price box. */
  latest: { price: number; unit: string; region: string };
  changes: PriceChange[];
  /** Full history (oldest first) including forecast points at the end. */
  series: PricePoint[];
  /** What the graph is showing now, so the filter dialog opens on it (`unitName` is for display, e.g. `MT`). */
  filters: ChartFilters & { unitName: string };
}

export type InsightTabId = 'drivers' | 'supply' | 'top-players' | 'applications' | 'insights' | 'production-cost-reports';

/** A link in a tab's list (an article, a production cost report): title, optional short text and picture, and where it opens. */
export interface InsightLink {
  title: string;
  description?: string;
  /** Card picture (articles). */
  imageUrl?: string;
  href: string;
}

/** One tab of the insights card. */
export interface InsightTab {
  id: InsightTabId;
  label: string;
  /** Bullet paragraphs; empty = nothing published for this tab yet. */
  bullets: string[];
  /** Linked items (the Insights tab lists articles, the Production Cost Reports tab lists reports); shown instead of the bullets. */
  links?: InsightLink[];
}

export interface ProductInsights {
  tabs: InsightTab[];
}

/** One row of the "Product Details" table in the chart info (`html` is already safe to render). */
export interface ProductInfoRow {
  label: string;
  html: string;
}

/** What the "Chart Info" dialog shows. `before` / `after` are the description's safe HTML around the spot where the details table goes. */
export interface ProductInfo {
  /** API ids of the product and the location shown (what a price alert is stored against). */
  productId: string;
  locationId: string;
  name: string;
  price: number;
  unit: string;
  category: string;
  subCategory: string;
  description: string;
  before: string;
  after: string;
  details: ProductInfoRow[];
}

/** POST /api/v1/user-panel/price-trend-product-data: the graph and the narrative tabs under it. */
export interface ProductData {
  graph: ProductGraph;
  insights: ProductInsights;
  info: ProductInfo;
}
