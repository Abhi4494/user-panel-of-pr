import { Search, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Heading } from '@/components/ui/Heading';
import { showToast } from '@/components/ui/Toaster';
import { requestSubscription } from '@/features/product-graph/api/requestSubscription';
import {
  getLocationsToRequest,
  searchProductsToRequest,
  type LocationOption,
  type ProductOption,
} from '@/features/subscription/api/manageSubscription';
import { useAsync } from '@/hooks/useAsync';

const MIN_SEARCH_LENGTH = 3;
const LOCATION_FILTER_FROM = 8; // show the location filter box when there are more locations than this

const focus = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dash-accent';
const field =
  'h-11 w-full rounded-lg border border-dash-control-border bg-dash-surface pr-3 pl-10 text-sm text-dash-ink placeholder:text-dash-placeholder focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-dash-accent';
const optionBase = 'flex w-full items-center justify-between gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors';
const optionIdle = 'text-dash-ink hover:bg-dash-hover';
const optionOn = 'bg-accent text-white';

/**
 * "Request a product" dialog: search a product by name (3+ letters), pick it, then optionally pick one location.
 * Without a location the request is for the product only (the team chooses the locations when approving).
 * `onRaised` runs after the request was saved; the dialog then closes itself.
 */
export function RequestProductDialog({ onClose, onRaised }: { onClose: () => void; onRaised: () => void }) {
  const searchBox = useRef<HTMLInputElement>(null);
  const [typed, setTyped] = useState('');
  const [query, setQuery] = useState('');
  const [product, setProduct] = useState<ProductOption | null>(null);
  const [location, setLocation] = useState<LocationOption | null>(null);
  const [locationFilter, setLocationFilter] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    searchBox.current?.focus({ preventScroll: true });
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  // Ask the API a moment after the user stops typing.
  useEffect(() => {
    const timer = setTimeout(() => setQuery(typed.trim()), 300);
    return () => clearTimeout(timer);
  }, [typed]);

  const loadProducts = useCallback(
    () => (query.length >= MIN_SEARCH_LENGTH ? searchProductsToRequest(query) : Promise.resolve([] as ProductOption[])),
    [query],
  );
  const products = useAsync(loadProducts, { pageLoader: false });

  const productId = product?.id;
  const loadLocations = useCallback(
    () => (productId ? getLocationsToRequest(productId) : Promise.resolve([] as LocationOption[])),
    [productId],
  );
  const locations = useAsync(loadLocations, { pageLoader: false });

  function chooseProduct(next: ProductOption) {
    setProduct(next);
    setLocation(null);
    setLocationFilter('');
    setError('');
  }

  async function handleSend() {
    if (!product) return;
    setSending(true);
    setError('');
    try {
      showToast('success', await requestSubscription(product.id, location?.id));
      onRaised();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'We could not send your request right now. Please try again.');
      setSending(false);
    }
  }

  const shownLocations = (locations.data ?? []).filter((item) => item.name.toLowerCase().includes(locationFilter.trim().toLowerCase()));
  const tooShort = typed.trim().length > 0 && typed.trim().length < MIN_SEARCH_LENGTH;
  const button = `h-11 rounded-full px-8 text-sm ${focus}`;

  // Portalled to <body> so the page's container-query wrapper cannot clip or misplace the fixed overlay.
  return createPortal(
    <div className="fixed inset-0 z-60 flex items-start justify-center overflow-y-auto bg-ink/60 p-4 sm:items-center" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" aria-labelledby="request-product-title" className="w-full max-w-162.5 rounded-lg bg-dash-surface shadow-dash-card">
        <header className="flex items-center justify-between border-b border-dash-hairline px-6 py-5">
          <Heading id="request-product-title" level={2} size="section" className="text-dash-ink">
            Request a product
          </Heading>
          <button type="button" onClick={onClose} aria-label="Close" className={`inline-flex size-8 items-center justify-center rounded text-dash-subtle hover:text-dash-ink ${focus}`}>
            <X size={20} aria-hidden />
          </button>
        </header>

        <div className="grid gap-6 px-6 py-6 sm:grid-cols-2">
          {/* 1. Product */}
          <section aria-label="Product">
            <h3 className="text-sm font-semibold text-dash-ink">1. Product</h3>
            <label className="relative mt-3 block">
              <span className="sr-only">Search product</span>
              <Search size={16} aria-hidden className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-dash-placeholder" />
              <input
                ref={searchBox}
                type="search"
                value={typed}
                onChange={(event) => setTyped(event.target.value)}
                placeholder="Search product (3+ letters)"
                className={field}
              />
            </label>
            <div className="mt-2 max-h-60 overflow-y-auto" aria-busy={products.isLoading}>
              {tooShort ? (
                <p className="px-1 py-3 text-xs text-dash-subtle">Type at least {MIN_SEARCH_LENGTH} letters to search.</p>
              ) : products.error ? (
                <p role="alert" className="px-1 py-3 text-xs text-alert">We couldn&apos;t search right now. Please try again.</p>
              ) : query.length < MIN_SEARCH_LENGTH ? (
                <p className="px-1 py-3 text-xs text-dash-subtle">Start typing the name of the product you need.</p>
              ) : !products.data ? (
                <p className="px-1 py-3 text-xs text-dash-subtle">Searching…</p>
              ) : products.data.length === 0 ? (
                <p className="px-1 py-3 text-xs text-dash-subtle">No products found for &ldquo;{query}&rdquo;.</p>
              ) : (
                <ul>
                  {products.data.map((item) => (
                    <li key={item.id}>
                      <button type="button" aria-pressed={product?.id === item.id} onClick={() => chooseProduct(item)} className={`${optionBase} ${product?.id === item.id ? optionOn : optionIdle} ${focus}`}>
                        {item.name}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          {/* 2. Location (optional) */}
          <section aria-label="Location">
            <h3 className="text-sm font-semibold text-dash-ink">
              2. Location <span className="font-normal text-dash-subtle">(optional)</span>
            </h3>
            {!product ? (
              <p className="mt-3 text-xs text-dash-subtle">Pick a product first. You can also leave the location empty.</p>
            ) : locations.error ? (
              <p role="alert" className="mt-3 text-xs text-alert">We couldn&apos;t load the locations. You can still send the request without one.</p>
            ) : !locations.data ? (
              <p className="mt-3 text-xs text-dash-subtle">Loading locations…</p>
            ) : locations.data.length === 0 ? (
              <p className="mt-3 text-xs text-dash-subtle">No locations are listed for this product. The request will be for the product only.</p>
            ) : (
              <>
                {locations.data.length > LOCATION_FILTER_FROM && (
                  <label className="relative mt-3 block">
                    <span className="sr-only">Filter locations</span>
                    <Search size={16} aria-hidden className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-dash-placeholder" />
                    <input type="search" value={locationFilter} onChange={(event) => setLocationFilter(event.target.value)} placeholder="Filter locations" className={field} />
                  </label>
                )}
                <ul className="mt-2 max-h-60 overflow-y-auto">
                  {shownLocations.map((item) => (
                    <li key={item.id}>
                      <button
                        type="button"
                        aria-pressed={location?.id === item.id}
                        onClick={() => setLocation(location?.id === item.id ? null : item)} // click again to clear
                        className={`${optionBase} ${location?.id === item.id ? optionOn : optionIdle} ${focus}`}
                      >
                        {item.name}
                      </button>
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-xs text-dash-subtle">Click the selected location again to clear it.</p>
              </>
            )}
          </section>
        </div>

        {product && (
          <p className="px-6 pb-2 text-sm text-dash-ink" aria-live="polite">
            Requesting <strong>{product.name}</strong>
            {location ? <> for <strong>{location.name}</strong></> : ' (no location chosen)'}.
          </p>
        )}
        {error && (
          <p role="alert" className="px-6 pb-2 text-sm text-alert">
            {error}
          </p>
        )}

        <footer className="flex justify-end gap-3 border-t border-dash-hairline px-6 py-5">
          <button type="button" onClick={onClose} className={`${button} border border-dash-control-border font-medium text-dash-ink hover:bg-dash-hover`}>
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSend}
            disabled={!product || sending}
            className={`${button} bg-accent font-semibold text-white transition-colors hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-60`}
          >
            {sending ? 'Sending…' : 'Send Request'}
          </button>
        </footer>
      </div>
    </div>,
    document.body,
  );
}
