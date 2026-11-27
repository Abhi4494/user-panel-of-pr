import { ChevronLeft, Search } from 'lucide-react';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import type { SearchPreset } from '@/features/product-search/ProductSearchContext';
import { SearchColumns } from '@/features/product-search/components/SearchColumns';

interface ProductSearchPanelProps {
  open: boolean;
  onClose: () => void;
  /** Search text, shared with the header search field (owned by the layout). */
  text: string;
  onTextChange: (text: string) => void;
  /** An industry to have chosen when opened from elsewhere (see `ProductSearchContext`). */
  preset?: SearchPreset;
}

/**
 * "Search Products" (the rail's Search item): a white panel sliding in from the left over a dimmed page. Its width follows the
 * number of visible columns (animated), capped so a strip of the page stays visible; below sm it is full width with stacked
 * columns. Always mounted so it can animate; the lists mount (and fetch) on first open. Closes on Esc, the chevron, the dimmed
 * area, or navigation (the layout closes it when the path changes).
 */
export function ProductSearchPanel({ open, onClose, text, onTextChange, preset }: ProductSearchPanelProps) {
  const [everOpened, setEverOpened] = useState(open);
  const [columns, setColumns] = useState(1);
  const input = useRef<HTMLInputElement>(null);
  if (open && !everOpened) setEverOpened(true);

  useEffect(() => {
    if (!open) return;
    // Opened by typing in the header search? Then the caret stays there.
    if (document.activeElement?.id !== 'dashboard-search') input.current?.focus({ preventScroll: true });
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  return (
    <>
      <div
        aria-hidden
        onClick={onClose}
        className={`fixed inset-0 z-50 bg-ink/70 transition-opacity duration-300 motion-reduce:transition-none ${open ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
      />
      <aside
        role="dialog"
        aria-label="Search products"
        aria-hidden={!open}
        style={{ '--cols': columns } as CSSProperties}
        className={`fixed inset-y-0 left-0 z-50 flex w-[min(calc(100vw-6.9rem),calc(2.5rem+var(--cols)*15.3125rem))] flex-col overflow-x-hidden overflow-y-auto bg-dash-surface transition-[width,translate,visibility] duration-300 ease-in-out motion-reduce:transition-none max-sm:w-full ${
          open ? 'visible translate-x-0' : 'invisible -translate-x-full'
        }`}
      >
        <header className="relative flex h-19 shrink-0 items-center justify-between px-5">
          <img src="/fav.svg" alt="" className="size-9" />
          <p className="absolute inset-x-0 text-center text-lg font-medium text-dash-subtle">Search Products</p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close search"
            className="relative inline-flex size-8 items-center justify-center rounded text-dash-subtle transition-colors hover:text-dash-strong focus-visible:outline-2 focus-visible:outline-dash-accent"
          >
            <ChevronLeft size={22} aria-hidden />
          </button>
        </header>

        <div className="relative mx-5 mb-5 shrink-0">
          <label htmlFor="product-search-input" className="sr-only">
            Search products
          </label>
          <Search size={18} aria-hidden className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-dash-placeholder" />
          <input
            ref={input}
            id="product-search-input"
            type="search"
            value={text}
            onChange={(event) => onTextChange(event.target.value)}
            placeholder="Search..."
            autoComplete="off"
            className="h-9.5 w-full rounded-sm border border-dash-input-border bg-dash-surface pr-3 pl-10 text-sm text-dash-ink placeholder:text-dash-placeholder focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-dash-accent"
          />
        </div>

        {everOpened && <SearchColumns text={text} onColumnCount={setColumns} preset={preset} />}
      </aside>
    </>
  );
}
