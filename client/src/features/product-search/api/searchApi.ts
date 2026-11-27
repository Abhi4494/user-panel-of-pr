import { getApiData, records, text } from '@/lib/apiData';
import type { GlobalSearchResult, SearchItem, SearchLocation } from '@/features/product-search/types';

const BASE = '/api/v1/user-panel';
const ERROR = 'Unable to load the search results right now.';

/** Maps API rows to list items; `idKeys` / `nameKey` name the fields (the API is not consistent: `ProductId` vs `ProductID`). */
function toItems(value: unknown, idKeys: string[], nameKey: string): SearchItem[] {
  return records(value)
    .map((row) => ({ id: idKeys.map((key) => String(row[key] ?? '')).find(Boolean) ?? '', name: text(row, nameKey), slug: text(row, 'Url') }))
    .filter((item) => item.id && item.name);
}

/** Sub categories of an industry: `GET /sub-categories?categoryId=`. */
export async function getSubCategories(categoryId: string): Promise<SearchItem[]> {
  return toItems(await getApiData(`${BASE}/sub-categories?categoryId=${encodeURIComponent(categoryId)}`, ERROR), ['CategoryId'], 'CategoryName');
}

/** Products of a sub category: `GET /products-by-subcategory?subCategoryId=`. */
export async function getProductsBySubCategory(subCategoryId: string): Promise<SearchItem[]> {
  return toItems(await getApiData(`${BASE}/products-by-subcategory?subCategoryId=${encodeURIComponent(subCategoryId)}`, ERROR), ['ProductId', 'ProductID'], 'Name');
}

/** Places a product is tracked in: `GET /location-by-product?productId=`. */
export async function getLocationsByProduct(productId: string): Promise<SearchLocation[]> {
  const data = await getApiData(`${BASE}/location-by-product?productId=${encodeURIComponent(productId)}`, ERROR);
  return records(data)
    .map((row) => {
      const name = text(row, 'CountryName') || text(row, 'CountryShortName');
      return { slug: text(row, 'CountryShortName') || name, name };
    })
    .filter((location) => location.slug);
}

/** What matches the typed text in industries, sub categories and products: `GET /search/global?searchText=`. */
export async function searchGlobal(searchText: string): Promise<GlobalSearchResult> {
  const data = await getApiData(`${BASE}/search/global?searchText=${encodeURIComponent(searchText)}`, ERROR);
  return {
    industries: toItems(data.Category, ['CategoryId'], 'CategoryName'),
    subCategories: toItems(data.SubCategory, ['CategoryId'], 'CategoryName'),
    products: toItems(data.Products, ['ProductId', 'ProductID'], 'Name'),
  };
}
