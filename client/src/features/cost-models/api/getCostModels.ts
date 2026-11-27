import { MOCK_COST_MODELS } from '@/features/cost-models/api/mockCostModels';
import type { CostModelSummary } from '@/features/cost-models/types';

/** Removed ids (mock only: lets Delete work until the backend exists). */
const deleted = new Set<string>();

/**
 * The signed-in user's cost models, filtered by `search` (name contains).
 *
 * TODO(backend): replace the mock with `GET /api/cost-models?search=` -> `CostModelSummary[]`. Keep the signature.
 */
export async function getCostModels(search: string): Promise<CostModelSummary[]> {
  await new Promise((resolve) => setTimeout(resolve, 250));
  const needle = search.trim().toLowerCase();
  return MOCK_COST_MODELS.filter((model) => !deleted.has(model.id) && model.name.toLowerCase().includes(needle)).map(({ id, name, period }) => ({ id, name, period }));
}

/** TODO(backend): `DELETE /api/cost-models/:id`. */
export async function deleteCostModel(id: string): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 200));
  deleted.add(id);
}
