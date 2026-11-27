import { House } from 'lucide-react';
import { toolbarActive, toolbarButton, toolbarIdle } from '@/components/ui/controlButtonStyles';
import type { RangeId } from '@/features/product-graph/lib/priceWindow';

interface RangeButtonsProps {
  /** The range matching the current window, or null once the user has zoomed/dragged to a custom one. */
  active: RangeId | null;
  onSelect: (range: RangeId) => void;
}

const RANGES: RangeId[] = ['1Y', '2Y', '5Y', '10Y', 'All'];

/** Home (reset to the default view) + 1Y/2Y/5Y/10Y/All, like the reference's range selector. */
export function RangeButtons({ active, onSelect }: RangeButtonsProps) {
  return (
    <div role="group" aria-label="Time range" className="flex items-center gap-0.75">
      <button
        type="button"
        onClick={() => onSelect('home')}
        aria-label="Reset to default range"
        aria-pressed={active === 'home'}
        title="Reset to default range"
        className={`${toolbarButton} mr-1 ${active === 'home' ? toolbarActive : toolbarIdle}`}
      >
        <House size={16} aria-hidden />
      </button>
      {RANGES.map((range) => (
        <button
          key={range}
          type="button"
          onClick={() => onSelect(range)}
          aria-pressed={active === range}
          className={`${toolbarButton} ${active === range ? toolbarActive : toolbarIdle}`}
        >
          {range}
        </button>
      ))}
    </div>
  );
}
