import { useCallback, useEffect, useState } from 'react';
import { getCategories } from '@/features/catalog/api/getCategories';
import { getLocationsByProduct, getProductsBySubCategory, getSubCategories, searchGlobal } from '@/features/product-search/api/searchApi';
import { LocationList } from '@/features/product-search/components/LocationList';
import { PickItem } from '@/features/product-search/components/PickItem';
import { SearchColumn } from '@/features/product-search/components/SearchColumn';
import type { SearchPreset } from '@/features/product-search/ProductSearchContext';
import type { GlobalSearchResult, SearchItem } from '@/features/product-search/types';
import { useAsync } from '@/hooks/useAsync';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';

interface SearchColumnsProps {
  /** The text typed in the panel's search field. */
  text: string;
  /** Reports how many columns are visible (the panel grows/shrinks to fit). */
  onColumnCount: (count: number) => void;
  /** An industry to choose (e.g. from a category chip on the Price Trends page). */
  preset?: SearchPreset;
}

/** Typed text shorter than this does not search (and does not open the panel from the header); the lists just browse. */
export const MIN_SEARCH_LENGTH = 3;

const note = 'pr-1 pt-2 text-sm text-dash-subtle';
const NO_ITEMS: Promise<never[]> = Promise.resolve([]);

/** Loads `fetchList(id)` once `id` is chosen (an empty list until then); `isLoading` is true while a chosen id's list is on its way. */
function useList<T>(id: string | undefined, fetchList: (id: string) => Promise<T[]>) {
  const load = useCallback(() => (id === undefined ? NO_ITEMS : fetchList(id)), [id, fetchList]);
  const { data, error, isLoading } = useAsync(load, { pageLoader: false });
  return {
    items: id === undefined || isLoading ? [] : (data ?? []),
    error,
    isLoading: id !== undefined && isLoading,
  };
}

/**
 * The cascading lists: Industries always; Sub Categories and Products once an industry is chosen (or while searching);
 * Location once a product is chosen. Choosing an industry loads its sub categories, a sub category its products, a product its
 * locations. From 3 typed letters the first three lists show what matches (`search/global`); choosing in them still drills down.
 */
export function SearchColumns({ text, onColumnCount, preset }: SearchColumnsProps) {
  const debounced = useDebouncedValue(text.trim(), 250);
  const query = text.trim() === '' ? '' : debounced; // clearing the field switches back to browsing at once
  const searching = query.length >= MIN_SEARCH_LENGTH;
  const searchKey = searching ? query : '';

  // A choice belongs to one search text: when the text changes the choices silently reset (no extra render pass).
  const [choice, setChoice] = useState<{
    key: string;
    industryId?: string;
    subId?: string;
    productId?: string;
  }>({ key: searchKey });
  // (Typed on purpose: destructuring straight from the conditional made TypeScript reject the extra `key` field.)
  const active: { industryId?: string; subId?: string; productId?: string } = choice.key === searchKey ? choice : {};
  const { industryId, subId, productId } = active;

  // A preset (new `nonce`) chooses its industry, once.
  const [appliedNonce, setAppliedNonce] = useState(preset?.nonce);
  if (preset && preset.nonce !== appliedNonce) {
    setAppliedNonce(preset.nonce);
    setChoice({ key: searchKey, industryId: preset.industryId });
  }

  const categories = useAsync(getCategories, { pageLoader: false });
  const search = useAsync<GlobalSearchResult | undefined>(
    useCallback(() => (searching ? searchGlobal(query) : Promise.resolve(undefined)), [searching, query]),
    { pageLoader: false },
  );
  const subsOfIndustry = useList(industryId, getSubCategories);
  const productsOfSub = useList(subId, getProductsBySubCategory);
  const locations = useList(productId, getLocationsByProduct);

  const result = searching && !search.isLoading ? search.data : undefined;
  const industries: SearchItem[] = searching
    ? (result?.industries ?? [])
    : (categories.data ?? []).map(({ id, name }) => ({
        id: String(id),
        name,
        slug: '',
      }));
  const subCategories = industryId ? subsOfIndustry.items : (result?.subCategories ?? []);
  const products = subId ? productsOfSub.items : (result?.products ?? []);
  const product = products.find((item) => item.id === productId);

  // Search results show their first industry and sub category as chosen (highlight only: the lists keep showing what matched).
  const shownIndustryId = industryId ?? (searching ? industries[0]?.id : undefined);
  const shownSubId = subId ?? (searching && !industryId ? subCategories[0]?.id : undefined);

  const showSubCategories = !!industryId || searching;
  const showProducts = !!subId || searching; // browsing: Products appear only once a sub category is chosen
  const columnCount = 1 + (showSubCategories ? 1 : 0) + (showProducts ? 1 : 0) + (product ? 1 : 0);
  useEffect(() => onColumnCount(columnCount), [columnCount, onColumnCount]);

  const pick = (next: { industryId?: string; subId?: string; productId?: string }) => setChoice({ key: searchKey, ...next });
  const loadingNote = (
    <p aria-busy="true" className={note}>
      Loading…
    </p>
  );
  const industriesError = searching ? search.error : categories.error;
  const industriesLoading = searching ? search.isLoading : !categories.data;
  const middleLoading = searching && !industryId && search.isLoading;

  return (
    <div className="scrollbar-none flex gap-5 overflow-x-auto px-7.5 pb-8 max-sm:flex-col max-sm:px-5">
      <SearchColumn title="Industries" tint="peach">
        {industriesError ? (
          <p role="alert" className={note}>
            We couldn&apos;t load the industries right now.
          </p>
        ) : industriesLoading ? (
          loadingNote
        ) : industries.length ? (
          industries.map((item) => (
            <PickItem key={item.id} tone="industry" label={item.name} selected={item.id === shownIndustryId} onPick={() => pick({ industryId: item.id })} />
          ))
        ) : (
          <p className={note}>No matching industries.</p>
        )}
      </SearchColumn>

      {showSubCategories && (
        <SearchColumn title="Sub Categories" tint="rose">
          {(industryId && subsOfIndustry.isLoading) || middleLoading ? (
            loadingNote
          ) : subCategories.length ? (
            subCategories.map((item) => (
              <PickItem
                key={item.id}
                tone={searching && !industryId ? 'match' : 'industry'}
                label={item.name}
                selected={item.id === shownSubId}
                onPick={() => pick({ industryId, subId: item.id })}
              />
            ))
          ) : (
            <p className={note}>{subsOfIndustry.error ? 'We couldn’t load the sub categories.' : 'No matching sub categories.'}</p>
          )}
        </SearchColumn>
      )}

      {showProducts && (
        <SearchColumn title="Products" tint="mint">
          {(subId && productsOfSub.isLoading) || middleLoading
            ? loadingNote
            : products.length
              ? products.map((item) => (
                  <PickItem
                    key={item.id}
                    tone="product"
                    label={item.name}
                    selected={item.id === productId}
                    onPick={() => pick({ industryId, subId, productId: item.id })}
                  />
                ))
              : (searching || subId) && <p className={note}>{productsOfSub.error ? 'We couldn’t load the products.' : 'No matching products.'}</p>}
        </SearchColumn>
      )}

      {product && (
        <SearchColumn title="Location" tint="sky">
          {locations.isLoading ? loadingNote : <LocationList productSlug={product.slug} locations={locations.items} />}
        </SearchColumn>
      )}
    </div>
  );
}
