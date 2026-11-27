import { ApiError, getApiData, records, text } from '@/lib/apiData';
import type { ChangePeriod, ChartFilters, InsightLink, InsightTab, PriceChange, PricePoint, ProductData } from '@/features/product-graph/types';
import { assetUrl } from '@/lib/api';
import { newsUrl, pcrUrl } from '@/lib/websiteUrl';
import { toProductInfo } from '@/features/product-graph/api/toProductInfo';

const ERROR = 'Unable to load this product right now.';

/**
 * The product (and location, when the URL named one that exists) the user has no access to, so the screen can offer
 * "Request Subscription". Without a location the request is for the product only.
 */
export interface SubscriptionTarget {
  productId: number;
  productName: string;
  locationId?: number;
  locationName?: string;
}

/**
 * The user's subscription does not cover this product (the page then shows the "Data Not Available" screen).
 * `target` is set when the product exists: the screen then reads "You do not have access to ..." with a
 * Request Subscription button (for the product and location, or the product alone).
 */
export class NotSubscribedError extends Error {
  constructor(message: string, readonly target?: SubscriptionTarget) {
    super(message);
  }
}

function toSubscriptionTarget(data: Record<string, unknown> | undefined): SubscriptionTarget | undefined {
  if (!data) return undefined;
  const productId = Number(data.productId);
  const locationId = Number(data.locationId);
  const productName = typeof data.productName === 'string' ? data.productName : '';
  const locationName = typeof data.locationName === 'string' ? data.locationName : '';
  if (!(productId > 0) || !productName) return undefined;
  return locationId > 0 && locationName ? { productId, productName, locationId, locationName } : { productId, productName };
}

const asRecord = (value: unknown): Record<string, unknown> => (typeof value === 'object' && value !== null && !Array.isArray(value) ? (value as Record<string, unknown>) : {});
const asText = (value: unknown) => (typeof value === 'string' || typeof value === 'number' ? String(value).trim() : '');

/** One text of `PriceTrendsOtherInfo` (an HTML string from the editor) -> plain paragraphs, one per list item / paragraph. */
function toBullets(value: unknown): string[] {
  return asText(value)
    .replace(/<\/(p|li|div|h\d)>|<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&quot;/gi, '"')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

/** Rows of an API list -> links to the website (`titleKeys` / `ShortDescription` / `imageKey` are the row's field names). */
const toLinks = (rows: unknown, titleKeys: string[], href: (url: string) => string, imageKey?: string): InsightLink[] =>
  records(rows)
    .map((row) => ({
      title: titleKeys.map((key) => text(row, key)).find(Boolean) ?? '',
      description: text(row, 'ShortDescription') || undefined,
      imageUrl: imageKey && text(row, imageKey) ? assetUrl(text(row, imageKey)) : undefined,
      href: href(text(row, 'Url')),
    }))
    .filter((link) => link.title && link.href);

/**
 * `data.data[]` of the graph call (`{ date: 'YYYY-MM-DD', price, isForecast }`) -> chart points, oldest first. A point is a forecast
 * (dashed line) when its own `isForecast` is true; if the rows carry no such flag, the last `forecastCount` points are the forecasts.
 */
function toSeries(graph: Record<string, unknown>): PricePoint[] {
  const rows = records(graph.data);
  const flagged = rows.some((row) => 'isForecast' in row);
  const points = rows
    .map((row) => ({ date: text(row, 'date').slice(0, 10), value: Number(row.price), forecast: row.isForecast === true || row.isForecast === 1 || row.isForecast === '1' }))
    .filter((point) => /^\d{4}-\d{2}-\d{2}$/.test(point.date) && Number.isFinite(point.value))
    .sort((a, b) => a.date.localeCompare(b.date));
  const firstByCount = points.length - Math.max(0, Math.min(points.length, Number(graph.forecastCount) || 0));
  return points.map(({ date, value, forecast }, index) => (flagged ? forecast : index >= firstByCount) ? { date, value, forecast: true } : { date, value });
}

/** One period of `priceChangeCounter` (`<prefix>ChangeAvailable` / `Per` / `Price`); N/A when not available. */
function toChange(counter: Record<string, unknown>, prefix: string, period: ChangePeriod): PriceChange {
  const percent = Number(counter[`${prefix}ChangePer`]);
  const previousPrice = Number(counter[`${prefix}ChangePrice`]);
  if (counter[`${prefix}ChangeAvailable`] !== true || counter[`${prefix}ChangePer`] == null || !Number.isFinite(percent)) {
    return { period, percent: null, previousPrice: null };
  }
  return { period, percent, previousPrice: Number.isFinite(previousPrice) ? previousPrice : null };
}

/**
 * Everything the product graph screen shows, from two calls made together. Both are `POST` with
 * `{ productURL, countryShortName, unitId, currency }` (the "Filter Chart" choices; empty values make the API pick its defaults):
 *  - `price-trend-product-data`: header, latest price (`currentPrice`), the four changes (`priceChangeCounter`) and the narrative tabs
 *    (`PriceTrendsOtherInfo`: `Directs` = Drivers, `Facts` = Supply, `TopPlayers`, `Weather` = Applications; `article_list` = Insights,
 *    `pcr_report_list` = Production Cost Reports).
 *  - `price-trend-product-graph`: the price history (`data[]`, the last `forecastCount` points are forecasts) plus its `product` / `location` /
 *    `currency` / `unit` labels. If this call fails the page still loads, with a "not available" card in place of the chart.
 *
 * Throws `NotSubscribedError` when the API refuses with 403 or says the product is not subscribed (TODO(backend): confirm the exact signal).
 */
export async function getProductData(slug: string, { location, currency, unitId }: ChartFilters): Promise<ProductData> {
  const request: RequestInit = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productURL: slug, countryShortName: location, unitId, currency }),
  };
  const [data, graph] = await Promise.all([
    getApiData('/api/v1/user-panel/price-trend-product-data', ERROR, request).catch((error: unknown) => {
      if (error instanceof ApiError && (error.status === 403 || /subscri/i.test(error.apiMessage))) throw new NotSubscribedError(error.apiMessage, toSubscriptionTarget(error.data));
      throw error;
    }),
    getApiData('/api/v1/user-panel/price-trend-product-graph', ERROR, request).catch(() => ({}) as Record<string, unknown>),
  ]);

  const product = asRecord(data.product);
  const name = asText(product.Name);
  const price = Number(data.currentPrice);
  if (!name || !Number.isFinite(price)) throw new Error(ERROR);

  const country = asRecord(data.country);
  const region = asText(country.CountryShortName) || asText(country.CountryName) || asText(graph.location) || location;
  const unit = asText(graph.unit) || [asText(data.currency), asText(asRecord(data.unit_data).Name)].filter(Boolean).join('/');
  const spot = asText(asRecord(data.product_location_mappings).LocationData) || 'Spot';

  const info = asRecord(data.PriceTrendsOtherInfo);
  const tabs: InsightTab[] = [
    { id: 'drivers', label: 'Drivers', bullets: toBullets(info.Directs) },
    { id: 'supply', label: 'Supply', bullets: toBullets(info.Facts) },
    { id: 'top-players', label: 'Top Players', bullets: toBullets(info.TopPlayers) },
    { id: 'applications', label: 'Applications', bullets: toBullets(info.Weather) },
    { id: 'insights', label: 'Insights', bullets: [], links: toLinks(data.article_list, ['Title'], newsUrl, 'CardImage') },
    { id: 'production-cost-reports', label: 'Production Cost Reports', bullets: [], links: toLinks(data.pcr_report_list, ['ShortName', 'Name'], pcrUrl) },
  ];

  const counter = asRecord(data.priceChangeCounter);
  return {
    graph: {
      slug: asText(product.Url) || slug,
      name,
      subtitle: [name, unit, region].filter(Boolean),
      seriesLabel: `${name}(${[region, spot, unit].filter(Boolean).join(', ')})`,
      latest: { price, unit, region },
      changes: [toChange(counter, 'Week', 'W-o-W'), toChange(counter, 'Month', 'M-o-M'), toChange(counter, 'Quator', 'Q-o-Q'), toChange(counter, 'Yearly', 'Y-o-Y')],
      series: toSeries(graph),
      filters: {
        location: asText(country.CountryShortName) || location,
        currency: asText(data.currency) || currency,
        unitId: asText(asRecord(data.unit_data).UnitId) || unitId,
        unitName: asText(asRecord(data.unit_data).Name),
      },
    },
    insights: { tabs },
    info: toProductInfo(data, name, price, asText(asRecord(data.unit_data).Name)),
  };
}
