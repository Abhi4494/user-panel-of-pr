import type { LucideIcon } from 'lucide-react';

export interface StatStripItem {
  icon: LucideIcon;
  value: string | number;
  label: string;
}

interface StatStripProps {
  items: StatStripItem[];
  ariaLabel: string;
  /** Label colour: Price Trends uses the pale caption grey, the PCR and Industry Reports dashboards the dark ink. */
  labelTone?: 'subtle' | 'ink';
  /** Card background: white (default) or the pale blue of the Industry Reports dashboard. */
  surface?: 'white' | 'sky';
}

/** Card with three icon + number + label columns separated by hairlines (top of the Price Trends and PCR dashboards, bottom of Industry Reports). */
export function StatStrip({ items, ariaLabel, labelTone = 'subtle', surface = 'white' }: StatStripProps) {
  return (
    <section
      aria-label={ariaLabel}
      className={`grid grid-cols-3 divide-x divide-dash-hairline rounded-xl border border-dash-hairline py-1 ${surface === 'sky' ? 'bg-dash-tint-sky' : 'bg-dash-surface'}`}
    >
      {items.map(({ icon: Icon, value, label }) => (
        <div key={label} className="flex flex-col items-center gap-1 px-2 py-6 text-center sm:px-4">
          <Icon size={24} strokeWidth={1.5} aria-hidden className="text-dash-outline" />
          <p className="mt-1 text-title leading-none font-semibold text-dash-ink tabular-nums">{value}</p>
          <p className={`text-sm ${labelTone === 'ink' ? 'text-dash-ink' : 'text-dash-subtle'}`}>{label}</p>
        </div>
      ))}
    </section>
  );
}
