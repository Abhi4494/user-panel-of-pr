/** The user's cost model list (production: `/dashboard/costModels`). */
export const COST_MODELS_PATH = '/dashboard/costmodels';

/**
 * Production serves the model screens outside `/dashboard`: "Add Raw Material" opens `/CostModel/UpdateCostModel/<id>` (confirmed by the
 * user). The other paths below are GUESSES following that naming, to be replaced when the real ones are known.
 */
export const updateCostModelPath = (id: string) => `/costmodel/updatecostmodel/${id}`;
export const createCostModelPath = () => '/costmodel/createcostmodel'; // TODO(backend): confirm
export const editCostModelPath = (id: string) => `/costmodel/editcostmodel/${id}`; // TODO(backend): confirm
export const costModelDetailPath = (id: string) => `/costmodel/costmodeldetail/${id}`; // TODO(backend): confirm
export const addRawMaterialPath = (id: string) => `/costmodel/addrawmaterial/${id}`; // TODO(backend): confirm

/** The list filter lives in the URL: `/dashboard/costmodels?search=wheat`. */
export const costModelsUrl = (search: string) => (search ? `${COST_MODELS_PATH}?search=${encodeURIComponent(search)}` : COST_MODELS_PATH);
