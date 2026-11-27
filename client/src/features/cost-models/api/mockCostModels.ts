import type { CostModel } from '@/features/cost-models/types';

/** MOCK DATA ONLY: the one model in the reference screenshots. */
export const MOCK_COST_MODELS: Array<CostModel & { period: string }> = [
  {
    id: '33',
    name: 'Wheat',
    period: 'Jul / 2024',
    code: 'wheat_PRCM01',
    region: 'India',
    currency: 'EUR',
    unit: '100 kg',
    capacityPerYear: 100000,
    throughputPercent: 0.04,
    exchangeRate: 1.01,
    operationDays: 300,
    advanceCapitalMonths: 10000,
    capexUsdMillion: 10890,
    offsitesPercent: 0.04,
    depreciatedPlant: true,
    status: 'Draft',
    active: true,
    specifications: '',
  },
];
