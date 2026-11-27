import { DollarSign, Globe, Package, X, type LucideIcon } from 'lucide-react';
import { createPortal } from 'react-dom';
import { useEffect, useRef, useState } from 'react';
import { Heading } from '@/components/ui/Heading';
import { getProductFilters } from '@/features/product-graph/api/getProductFilters';
import { formatPrice } from '@/features/product-graph/lib/format';
import type { ChartFilters, ProductGraph } from '@/features/product-graph/types';
import { useAsync } from '@/hooks/useAsync';

interface ChartFilterDialogProps {
  graph: ProductGraph;
  onApply: (filters: ChartFilters) => void;
  onClose: () => void;
}

interface Option {
  value: string;
  label: string;
}

const selectClass =
  'h-11 w-full appearance-none rounded-lg border border-dash-control-border bg-dash-surface pr-9 pl-11 text-sm text-dash-ink focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-dash-accent';

/** One labelled `<select>` with its small icon on the left. */
function FilterSelect({ label, icon: Icon, value, options, onChange, selectRef }: { label: string; icon: LucideIcon; value: string; options: Option[]; onChange: (value: string) => void; selectRef?: React.Ref<HTMLSelectElement> }) {
  return (
    <label className="relative block w-fit min-w-44 max-w-full">
      <span className="sr-only">{label}</span>
      <Icon size={18} aria-hidden className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-dash-placeholder" />
      <select ref={selectRef} value={value} onChange={(event) => onChange(event.target.value)} className={selectClass}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <svg aria-hidden viewBox="0 0 12 8" className="pointer-events-none absolute top-1/2 right-3.5 h-2 w-3 -translate-y-1/2 text-dash-placeholder">
        <path d="M1 1.5 6 6.5 11 1.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </label>
  );
}

/** Makes sure the chosen value is listed even if the API's list does not contain it. */
const withCurrent = (options: Option[], current: string): Option[] => (current && !options.some((option) => option.value === current) ? [{ value: current, label: current }, ...options] : options);

/**
 * "Filter Chart" dialog: the product, its current price, and three selects (location, currency, unit) that start on what the graph is
 * showing now. "Set" hands the choice back to the page, which reloads the graph; Cancel, the X, Esc and the dimmed area just close it.
 */
export function ChartFilterDialog({ graph, onApply, onClose }: ChartFilterDialogProps) {
  const options = useAsync(getProductFilters.bind(null, graph.slug), { pageLoader: false });
  const [choice, setChoice] = useState<ChartFilters>(graph.filters);
  const first = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    first.current?.focus({ preventScroll: true });
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const loaded = options.data;
  const locations = withCurrent(loaded?.locations ?? [], choice.location);
  const currencies = withCurrent((loaded?.currencies ?? []).map((currency) => ({ value: currency, label: currency })), choice.currency);
  const units = withCurrent((loaded?.units ?? []).map((unit) => ({ value: unit.id, label: unit.name })), choice.unitId);
  // The list names the current unit by id; show its name until the list has arrived.
  if (!loaded && graph.filters.unitName) units.splice(0, units.length, { value: graph.filters.unitId, label: graph.filters.unitName });

  // Portalled to <body>: inside the page's container-query wrapper a `fixed` box would be placed and clipped by that wrapper.
  return createPortal(
    <div className="fixed inset-0 z-60 flex items-start justify-center overflow-y-auto bg-ink/60 p-4 sm:items-center" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" aria-labelledby="chart-filter-title" className="w-full max-w-xl rounded-lg bg-dash-surface shadow-dash-card">
        <header className="flex items-center justify-between border-b border-dash-hairline px-6 py-5">
          <Heading id="chart-filter-title" level={2} size="section" className="text-dash-ink">
            Filter Chart
          </Heading>
          <button type="button" onClick={onClose} aria-label="Close" className="inline-flex size-8 items-center justify-center rounded text-dash-subtle hover:text-dash-ink focus-visible:outline-2 focus-visible:outline-dash-accent">
            <X size={20} aria-hidden />
          </button>
        </header>

        <div className="px-6 py-6">
          <p className="text-base text-dash-ink">{graph.name}</p>
          <p className="mt-1 text-base text-dash-subtle">
            Current Price : {formatPrice(graph.latest.price)} {graph.filters.unitName}
          </p>

          <div className="mt-6 flex flex-col gap-4">
            <FilterSelect label="Location" icon={Globe} value={choice.location} options={locations} onChange={(location) => setChoice({ ...choice, location })} selectRef={first} />
            <FilterSelect label="Currency" icon={DollarSign} value={choice.currency} options={currencies} onChange={(currency) => setChoice({ ...choice, currency })} />
            <FilterSelect label="Unit" icon={Package} value={choice.unitId} options={units} onChange={(unitId) => setChoice({ ...choice, unitId })} />
          </div>
          {options.error && (
            <p role="alert" className="mt-4 text-sm text-alert">
              We couldn&apos;t load all the choices right now.
            </p>
          )}
        </div>

        <footer className="flex justify-end gap-3 border-t border-dash-hairline px-6 py-5">
          <button type="button" onClick={onClose} className="h-11 rounded-full border border-dash-control-border px-9 text-sm font-medium text-dash-ink hover:bg-dash-hover focus-visible:outline-2 focus-visible:outline-dash-accent">
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onApply(choice)}
            className="h-11 rounded-full bg-dash-outline px-10 text-sm font-semibold text-dash-surface transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dash-accent"
          >
            Set
          </button>
        </footer>
      </div>
    </div>,
    document.body,
  );
}
