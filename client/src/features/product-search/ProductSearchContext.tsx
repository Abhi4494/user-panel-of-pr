import { createContext, useContext } from 'react';

/** Lets any dashboard screen open the "Search Products" panel (owned by `DashboardLayout`). */
export interface ProductSearchControls {
  /** Opens the panel with this industry (a category id) already chosen, so its sub categories are listed. */
  openWithIndustry: (industryId: string) => void;
}

export const ProductSearchContext = createContext<ProductSearchControls>({ openWithIndustry: () => undefined });

export const useProductSearch = () => useContext(ProductSearchContext);

/** An industry to have chosen when the panel opens; a new `nonce` means "apply it again" (even for the same industry). */
export interface SearchPreset {
  industryId: string;
  nonce: number;
}
