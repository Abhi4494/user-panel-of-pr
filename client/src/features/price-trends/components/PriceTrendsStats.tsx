import { Hourglass, MapPin, ScanSearch } from 'lucide-react';
import { StatStrip } from '@/components/ui/StatStrip';
import type { PriceTrendsDashboard } from '@/features/price-trends/types';

/** The three platform totals ("79+", "10+", "1158+") in the shared stat card. */
export function PriceTrendsStats({ totals, industries }: { totals: PriceTrendsDashboard['totals']; industries: number }) {
  return (
    <StatStrip
      ariaLabel="Price trends coverage"
      items={[
        { icon: MapPin, value: `${totals.locations}+`, label: 'Locations' },
        { icon: ScanSearch, value: `${industries}+`, label: 'Industries' },
        { icon: Hourglass, value: `${totals.products}+`, label: 'Products' },
      ]}
    />
  );
}
