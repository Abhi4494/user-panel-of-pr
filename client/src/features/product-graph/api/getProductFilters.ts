import { getApiData, records, text } from '@/lib/apiData';
import type { ProductFilterOptions } from '@/features/product-graph/types';

/**
 * The choices of the "Filter Chart" dialog for one product, from `POST /api/v1/user-panel/product-filter-data` (`{ productURL }`):
 * the places it is tracked in (`Locations`), the currencies (`Currency`) and the units (`Units`).
 */
export async function getProductFilters(slug: string): Promise<ProductFilterOptions> {
  const data = await getApiData('/api/v1/user-panel/product-filter-data', 'Unable to load the filters right now.', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productURL: slug }),
  });

  return {
    locations: records(data.Locations)
      .map((row) => ({ value: text(row, 'CountryShortName') || text(row, 'CountryName'), label: text(row, 'CountryName') || text(row, 'CountryShortName') }))
      .filter((option) => option.value),
    currencies: records(data.Currency)
      .map((row) => text(row, 'currencyName'))
      .filter(Boolean),
    units: records(data.Units)
      .map((row) => ({ id: String(row.UnitId ?? ''), name: text(row, 'Name') }))
      .filter((unit) => unit.id && unit.name),
  };
}
