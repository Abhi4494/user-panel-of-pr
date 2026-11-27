import { useRef, useState, type KeyboardEvent } from 'react';
import { Award, ChartPie, FastForward, Rss, SquareCheckBig, Truck, type LucideIcon } from 'lucide-react';
import { Link } from '@/components/ui/Link';
import type { InsightTab, InsightTabId } from '@/features/product-graph/types';

/** Icons are presentation, so they live here, not in the API (an unknown tab id just gets no icon). */
const TAB_ICONS: Record<InsightTabId, LucideIcon> = {
  drivers: FastForward,
  supply: SquareCheckBig,
  'top-players': Award,
  applications: ChartPie,
  insights: Rss,
  'production-cost-reports': Truck,
};

/**
 * Tabs card under the chart: Drivers, Supply, Top Players, ... Follows the WAI-ARIA tabs pattern (roving tabindex,
 * Left/Right/Home/End). The active tab is navy with a 2px underline; inactive tabs are the reference's pale grey.
 */
export function InsightsTabs({ tabs }: { tabs: InsightTab[] }) {
  const [activeId, setActiveId] = useState<string>(tabs[0]?.id ?? '');
  const refs = useRef<Array<HTMLButtonElement | null>>([]);
  const active = tabs.find((tab) => tab.id === activeId) ?? tabs[0];
  if (!active) return null;

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const last = tabs.length - 1;
    const next = { ArrowRight: index === last ? 0 : index + 1, ArrowLeft: index === 0 ? last : index - 1, Home: 0, End: last }[event.key];
    if (next === undefined) return;
    event.preventDefault();
    setActiveId(tabs[next].id);
    refs.current[next]?.focus();
  }

  return (
    <section aria-label="Product insights" className="rounded-xl bg-dash-surface px-5 pt-8 pb-10 shadow-dash-card sm:px-10 sm:pt-10 sm:pb-12">
      <div role="tablist" aria-label="Product insights" className="flex gap-x-4 overflow-x-auto border-b border-dash-control-border scrollbar-none sm:gap-x-7">
        {tabs.map((tab, index) => {
          const selected = tab.id === active.id;
          const Icon = TAB_ICONS[tab.id];
          return (
            <button
              key={tab.id}
              ref={(element) => {
                refs.current[index] = element;
              }}
              id={`insight-tab-${tab.id}`}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={`insight-panel-${tab.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActiveId(tab.id)}
              onKeyDown={(event) => onKeyDown(event, index)}
              className={`-mb-px flex shrink-0 items-center gap-1.5 border-b-2 px-3.5 py-3 text-sm whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-dash-accent ${
                selected ? 'border-dash-outline font-semibold text-dash-outline' : 'border-transparent font-medium text-dash-tab-idle hover:text-dash-subtle'
              }`}
            >
              {Icon && <Icon size={16} aria-hidden />}
              {tab.label}
            </button>
          );
        })}
      </div>

      <div id={`insight-panel-${active.id}`} role="tabpanel" aria-labelledby={`insight-tab-${active.id}`} tabIndex={0} className="mt-9 focus-visible:outline-2 focus-visible:outline-dash-accent">
        {active.links && active.links.length > 0 ? (
          <ul className="grid gap-6">
            {active.links.map((link) => (
              <li key={link.href} className="flex flex-col gap-4 sm:flex-row sm:items-start">
                {link.imageUrl && (
                  <Link href={link.href} tabIndex={-1} aria-hidden className="shrink-0 sm:w-56">
                    <img src={link.imageUrl} alt="" loading="lazy" className="aspect-video w-full rounded-lg object-cover" />
                  </Link>
                )}
                <div className="min-w-0">
                  <Link href={link.href} className="text-base leading-snug font-bold text-dash-outline hover:underline focus-visible:outline-2 focus-visible:outline-dash-accent">
                    {link.title}
                  </Link>
                  {link.description && <p className="mt-1.5 text-sm leading-normal text-dash-subtle">{link.description}</p>}
                </div>
              </li>
            ))}
          </ul>
        ) : active.bullets.length > 0 ? (
          <ul className="list-disc space-y-0 pl-5 text-sm leading-normal text-dash-ink marker:text-dash-ink">
            {active.bullets.map((text) => (
              <li key={text}>{text}</li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-dash-subtle">Nothing has been published for this section yet.</p>
        )}
      </div>
    </section>
  );
}
