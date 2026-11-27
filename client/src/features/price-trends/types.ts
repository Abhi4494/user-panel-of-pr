/* ---------- API contracts (what the backend returns; see docs/architecture.md) ---------- */

/** A category chip of the filter. `id` is the category's name, which is what the product rows carry. */
export interface ProductCategory {
  id: string;
  name: string;
}

/** One row of the product list (right-hand card). */
export interface SubscribedProduct {
  id: string;
  name: string;
  categoryName: string;
  /** Whether the user is subscribed to this product ("Subscribed" / "Not Subscribed"). */
  subscribed: boolean;
  /** Internal path of the product's price-trend screen. */
  href: string;
}

/** GET /api/v1/user-panel/price-trend-dashboard (the number of industries comes from the shared categories list). */
export interface PriceTrendsDashboard {
  /** Platform-wide totals shown in the top card (rendered as "79+", "1158+"). */
  totals: {
    locations: number;
    products: number;
  };
  subscription: {
    /** How many products the user is subscribed to. */
    count: number;
    /** Products shown as chips (links) in the summary card; the rest are behind "click here". */
    highlighted: Array<Pick<SubscribedProduct, 'id' | 'name' | 'href'>>;
  };
  products: SubscribedProduct[];
}
