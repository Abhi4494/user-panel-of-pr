import { ChevronLeft, Search } from 'lucide-react';
import { createPortal } from 'react-dom';
import { useCallback, useEffect, useRef, useState } from 'react';
import { getSubscribedProductsForGraph } from '@/features/product-graph/api/getSubscribedProductsForGraph';
import { getProductLocationsForGraph } from '@/features/product-graph/api/getProductLocationsForGraph';
import { useAsync } from '@/hooks/useAsync';

export interface AddSeriesEntry {
  slug: string;
  locationShortName: string;
  productName: string;
  locationName: string;
  productId: string | number;
  locationId: string | number;
}

interface AddSeriesDialogProps {
  unitId: string;
  currency: string;
  onClose: () => void;
  /** Called with each confirmed (product, location) pair. Locations are subscription-verified by the backend. */
  onAdd: (entries: AddSeriesEntry[]) => void;
}

const ICON_COLORS = ['#F97316', '#F59E0B', '#EF4444', '#10B981', '#6366F1', '#EC4899', '#14B8A6'];
const iconColor = (index: number) => ICON_COLORS[index % ICON_COLORS.length];

const searchInput =
  'w-full rounded-md border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm text-gray-700 placeholder:text-gray-400 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-orange-400';

export function AddSeriesDialog({ unitId, currency: _currency, onClose, onAdd }: AddSeriesDialogProps) {
  const loadProducts = useCallback(() => getSubscribedProductsForGraph(unitId), [unitId]);
  const productsAsync = useAsync(loadProducts, { pageLoader: false });

  const [productSearch, setProductSearch] = useState('');
  const [locationSearch, setLocationSearch] = useState('');
  const [selectedSlug, setSelectedSlug] = useState('');
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [error, setError] = useState('');
  const productSearchRef = useRef<HTMLInputElement>(null);

  const loadLocations = useCallback(
    () => (selectedSlug ? getProductLocationsForGraph(selectedSlug) : Promise.resolve([])),
    [selectedSlug],
  );
  const locationsAsync = useAsync(loadLocations, { pageLoader: false });

  useEffect(() => {
    setSelectedLocations([]);
    setLocationSearch('');
  }, [selectedSlug]);

  useEffect(() => {
    productSearchRef.current?.focus({ preventScroll: true });
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const allProducts = productsAsync.data ?? [];
  const filteredProducts = productSearch.trim()
    ? allProducts.filter((p) => p.name.toLowerCase().includes(productSearch.trim().toLowerCase()))
    : allProducts;

  const locationOptions = locationsAsync.data ?? [];
  const filteredLocations = locationSearch.trim()
    ? locationOptions.filter((l) => l.label.toLowerCase().includes(locationSearch.trim().toLowerCase()))
    : locationOptions;

  const selectedProduct = allProducts.find((p) => p.slug === selectedSlug);

  function toggleLocation(value: string) {
    setSelectedLocations((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]));
  }

  function handleUpdate() {
    if (!selectedSlug || selectedLocations.length === 0) {
      setError('Select a product and at least one location.');
      return;
    }
    if (!selectedProduct) {
      setError('Could not resolve the product. Please try again.');
      return;
    }
    setError('');
    const entries: AddSeriesEntry[] = selectedLocations.map((locShortName) => {
      const locOpt = locationOptions.find((l) => l.value === locShortName);
      return {
        slug: selectedSlug,
        locationShortName: locShortName,
        productName: selectedProduct.name,
        locationName: locOpt?.label ?? locShortName,
        productId: selectedProduct.id,
        locationId: locOpt?.id ?? locShortName,
      };
    });
    onAdd(entries);
  }

  return createPortal(
    <div
      className="fixed inset-0 z-60 flex"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Add Series"
        className="relative flex h-full w-full max-w-[520px] flex-col bg-white shadow-2xl"
        style={{ background: 'linear-gradient(to right, #fff9f5 50%, #fff5f7 50%)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 bg-white px-5 py-4">
          <span className="text-base font-semibold text-gray-800">Add Series</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="inline-flex size-8 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-orange-400"
          >
            <ChevronLeft size={20} aria-hidden />
          </button>
        </div>

        {/* Two-column body */}
        <div className="flex min-h-0 flex-1 overflow-hidden">
          {/* Products column */}
          <div className="flex w-1/2 flex-col overflow-hidden border-r border-gray-100 bg-[#fff9f5] px-4 py-4">
            <p className="mb-1 text-xs font-bold uppercase tracking-wider text-gray-500">Products</p>
            <p className="mb-3 text-xs text-gray-400">Please select the product.</p>
            <label className="relative mb-3 block">
              <span className="sr-only">Search products</span>
              <Search size={14} aria-hidden className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-gray-400" />
              <input
                ref={productSearchRef}
                type="search"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder="Search..."
                className={searchInput}
              />
            </label>
            <ul className="flex-1 overflow-y-auto space-y-0.5">
              {productsAsync.data == null ? (
                <li className="py-2 text-xs text-gray-400 animate-pulse">Loading…</li>
              ) : filteredProducts.length === 0 ? (
                <li className="py-2 text-xs text-gray-400">No subscribed products found.</li>
              ) : (
                filteredProducts.map((product, idx) => {
                  const active = product.slug === selectedSlug;
                  return (
                    <li key={product.id}>
                      <button
                        type="button"
                        onClick={() => setSelectedSlug(product.slug)}
                        className={`flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-left text-sm transition-colors hover:bg-orange-50 focus-visible:outline-2 focus-visible:outline-orange-400 ${active ? 'bg-orange-50 font-semibold text-gray-900' : 'text-gray-700'}`}
                      >
                        <span
                          className="inline-flex size-5 flex-shrink-0 rounded-sm"
                          style={{ background: iconColor(idx) }}
                          aria-hidden
                        />
                        <span className="truncate">{product.name}</span>
                      </button>
                    </li>
                  );
                })
              )}
            </ul>
          </div>

          {/* Location column */}
          <div className="flex w-1/2 flex-col overflow-hidden bg-[#fff5f7] px-4 py-4">
            <p className="mb-1 text-xs font-bold uppercase tracking-wider text-gray-500">Location</p>
            <p className="mb-3 text-xs text-gray-400 leading-snug">
              {selectedSlug
                ? 'Select one or more locations.'
                : 'Select a product first.'}
            </p>
            <label className="relative mb-3 block">
              <span className="sr-only">Search locations</span>
              <Search size={14} aria-hidden className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-gray-400" />
              <input
                type="search"
                value={locationSearch}
                onChange={(e) => setLocationSearch(e.target.value)}
                placeholder="Search..."
                disabled={!selectedSlug}
                className={`${searchInput} disabled:cursor-not-allowed disabled:opacity-50`}
              />
            </label>
            <ul className="flex-1 overflow-y-auto space-y-0.5">
              {!selectedSlug ? null : locationsAsync.data == null ? (
                <li className="py-2 text-xs text-gray-400 animate-pulse">Loading…</li>
              ) : filteredLocations.length === 0 ? (
                <li className="py-2 text-xs text-gray-400">No locations found.</li>
              ) : (
                filteredLocations.map((opt) => {
                  const checked = selectedLocations.includes(opt.value);
                  return (
                    <li key={opt.value}>
                      <label className="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-2 text-sm text-gray-700 hover:bg-pink-50 transition-colors">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleLocation(opt.value)}
                          className="size-4 cursor-pointer rounded border-gray-300 accent-orange-500 focus-visible:outline-orange-400"
                        />
                        <span className="truncate">{opt.label}</span>
                      </label>
                    </li>
                  );
                })
              )}
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col items-center gap-2 border-t border-gray-200 bg-white px-5 py-4">
          {error && <p role="alert" className="text-xs text-red-500">{error}</p>}
          <button
            type="button"
            onClick={handleUpdate}
            disabled={!selectedSlug || selectedLocations.length === 0}
            className="rounded-full bg-gray-900 px-10 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-80 disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
          >
            Update
          </button>
        </div>
      </div>

      {/* Transparent click-away area so the graph remains visible */}
      <div className="flex-1" aria-hidden />
    </div>,
    document.body,
  );
}
