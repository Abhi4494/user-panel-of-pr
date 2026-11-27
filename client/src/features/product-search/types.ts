/* ---------- API contracts (see docs/architecture.md) ---------- */

/** An industry, sub category or product in the search panel's lists. */
export interface SearchItem {
  id: string;
  name: string;
  /** The API's `Url` (a product's is used in `/price-trend-dashboard/<slug>/<location slug>`). */
  slug: string;
}

/** A place a product's price is tracked in (the last column of the search panel). */
export interface SearchLocation {
  /** The API's `CountryShortName`, used as it is in the graph URL (e.g. `USA`). */
  slug: string;
  name: string;
}

/** `GET /api/v1/user-panel/search/global?searchText=`: what matches the typed text, per column. */
export interface GlobalSearchResult {
  industries: SearchItem[];
  subCategories: SearchItem[];
  products: SearchItem[];
}
