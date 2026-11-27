/* ---------- API contracts (see docs/architecture.md) ---------- */

/** One row of "Cost Model List". */
export interface CostModelSummary {
  id: string;
  name: string;
  /** Month the model was created/updated, shown as "Jul / 2024". */
  period: string;
}

/** The properties card of the Update Cost Model screen (numbers are plain numbers; the screen formats them). */
export interface CostModel {
  id: string;
  name: string;
  code: string;
  region: string;
  currency: string;
  unit: string;
  capacityPerYear: number;
  throughputPercent: number;
  /** Currency -> USD, e.g. 1.01 for EUR/USD. */
  exchangeRate: number;
  operationDays: number;
  advanceCapitalMonths: number;
  capexUsdMillion: number;
  offsitesPercent: number;
  depreciatedPlant: boolean;
  status: string;
  active: boolean;
  specifications: string;
}
