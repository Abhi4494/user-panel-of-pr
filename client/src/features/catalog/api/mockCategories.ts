import agriculture from '@/features/catalog/assets/categories/agriculture-farming-and-commodity.webp';
import chemicals from '@/features/catalog/assets/categories/chemicals.webp';
import energy from '@/features/catalog/assets/categories/energy-metals-and-minerals.webp';
import flavours from '@/features/catalog/assets/categories/flavours-and-fragrances.webp';
import food from '@/features/catalog/assets/categories/food-and-beverages.webp';
import healthcare from '@/features/catalog/assets/categories/healthcare.webp';
import machinery from '@/features/catalog/assets/categories/machinery-electronics-and-durables.webp';
import operating from '@/features/catalog/assets/categories/operating-costs-logistics-and-utilities.webp';
import packaging from '@/features/catalog/assets/categories/packaging.webp';
import type { Category } from '@/features/catalog/types';

/**
 * MOCK DATA ONLY (the real list comes from the backend, see `getCategories.ts`).
 * Order = the live dashboard's order. Ids 1-9 are the real CategoryIds (read from the public site's own category data);
 * "Other" exists only in the dashboard (it has no photo there either) and its id 10 is an assumption.
 * The tile photos are cut from a screenshot of the live dashboard (112x54), standing in for the original files.
 */
export const MOCK_CATEGORIES: Category[] = [
  { id: 1, name: 'Operating Costs, Logistics and Utilities', imageUrl: operating },
  { id: 2, name: 'Chemicals', imageUrl: chemicals },
  { id: 3, name: 'Agriculture, Farming and Commodity', imageUrl: agriculture },
  { id: 4, name: 'Food and Beverages', imageUrl: food },
  { id: 5, name: 'Flavours and Fragrances', imageUrl: flavours },
  { id: 6, name: 'Packaging', imageUrl: packaging },
  { id: 7, name: 'Machinery, Electronics and Durables', imageUrl: machinery },
  { id: 10, name: 'Other' },
  { id: 8, name: 'Energy, Metals and Minerals', imageUrl: energy },
  { id: 9, name: 'Healthcare', imageUrl: healthcare },
];
