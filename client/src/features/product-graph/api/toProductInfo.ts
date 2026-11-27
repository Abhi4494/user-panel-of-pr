import { records, text } from '@/lib/apiData';
import { escapeHtml, sanitizeHtml } from '@/lib/sanitizeHtml';
import type { ProductInfo, ProductInfoRow } from '@/features/product-graph/types';

const PLACEHOLDER = '{{PRICE_TREND_PRODUCT_DETAIL}}';
const MARKER = '@@PRODUCT_DETAILS@@';

const asRecord = (value: unknown): Record<string, unknown> => (typeof value === 'object' && value !== null && !Array.isArray(value) ? (value as Record<string, unknown>) : {});
const asText = (value: unknown) => (typeof value === 'string' || typeof value === 'number' ? String(value).trim() : '');

/** `[{ key, value }]` lists of the product detail -> one table row each (label = key). */
const pairs = (rows: unknown): ProductInfoRow[] =>
  records(rows)
    .map((row) => ({ label: text(row, 'key').trim(), html: escapeHtml(text(row, 'value').trim()) }))
    .filter((row) => row.label && row.html);

/**
 * The "Chart Info" popup of a product, from `price-trend-product-data`:
 *  - `product.OtherDescription` is the editor's HTML. It holds `{{PRICE_TREND_PRODUCT_DETAIL}}` where the "<product> Product Details" table goes,
 *    so the description is returned in two halves (`before` / `after` that spot).
 *  - The table comes from `product.price_trend_product_detail`; when that is null the placeholder is simply dropped.
 */
export function toProductInfo(data: Record<string, unknown>, name: string, price: number, unit: string): ProductInfo {
  const product = asRecord(data.product);
  const detail = asRecord(product.price_trend_product_detail);

  const rows: ProductInfoRow[] = [];
  const add = (label: string, html: string) => html && rows.push({ label, html });
  if (Object.keys(detail).length > 0) {
    add('Product Name', escapeHtml(name));
    add('HS CODE', escapeHtml(asText(detail.HSCode)));
    add('CAS Number', escapeHtml(asText(detail.CASNumber)));
    rows.push(...pairs(detail.product_other_info_one).slice(0, 1)); // Industrial Uses sits under CAS Number in the reference
    add('Chemical Formula', sanitizeHtml(asText(detail.ChemicalFormula)));
    rows.push(...pairs(detail.product_other_info_one).slice(1));
    add('Molecular Weight', escapeHtml(asText(detail.MolecularWeight)));
    const regions = records(detail.country_region)
      .map((row) => ({ key: text(row, 'key').trim(), value: text(row, 'value').trim() }))
      .filter((row) => row.key && row.value);
    add('Region/Countries Covered', regions.map((row) => `<strong>${escapeHtml(row.key)}:</strong> ${escapeHtml(row.value)}`).join('<br>'));
    rows.push(...pairs(detail.product_other_info_two));
  }

  const marked = asText(product.OtherDescription)
    .replace(new RegExp(`<(h\\d|p|div)\\b[^>]*>\\s*${PLACEHOLDER.replace(/[{}]/g, '\\$&')}\\s*</\\1>`, 'i'), `<p>${MARKER}</p>`)
    .replace(PLACEHOLDER, `<p>${MARKER}</p>`);
  const [before, after = ''] = sanitizeHtml(marked).split(`<p>${MARKER}</p>`);

  return {
    productId: asText(product.ProductID),
    locationId: asText(asRecord(data.country).CountryId),
    name,
    price,
    unit,
    category: asText(asRecord(data.category).CategoryName),
    subCategory: asText(asRecord(data.sub_category).CategoryName),
    description: asText(product.Description),
    before,
    after,
    details: rows,
  };
}
