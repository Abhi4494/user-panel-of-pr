/* ---------- API contract (what the backend returns; see docs/architecture.md) ---------- */

/**
 * An industry category (Chemicals, Packaging, ...). Shared by the Industry Reports and Production Cost Report screens: the
 * `id` is what goes into `?categoryId=` URLs on the live site.
 */
export interface Category {
  id: number;
  name: string;
  /** Photo shown on the Industry Reports carousel tile (112x54). A category without one gets a neutral tile. */
  imageUrl?: string;
}

/** A product offered in a search/select field (registration). */
export interface ProductOption {
  id: string;
  name: string;
}
