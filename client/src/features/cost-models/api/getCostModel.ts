import { MOCK_COST_MODELS } from '@/features/cost-models/api/mockCostModels';
import type { CostModel } from '@/features/cost-models/types';

/**
 * One cost model's properties.
 *
 * TODO(backend): replace the mock with `GET /api/cost-models/:id` -> `CostModel` (404 for an unknown id: throw, the screen shows its
 * "not found" state). Keep the signature.
 */
export async function getCostModel(id: string): Promise<CostModel> {
  await new Promise((resolve) => setTimeout(resolve, 250));
  const model = MOCK_COST_MODELS.find((item) => item.id === id);
  if (!model) throw new Error('Cost model not found');
  return model;
}

/** TODO(backend): `PUT /api/cost-models/:id` with the edited properties. */
export async function saveCostModel(model: CostModel): Promise<void> {
  void model;
  await new Promise((resolve) => setTimeout(resolve, 300));
}
