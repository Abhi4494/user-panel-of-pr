import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Heading } from '@/components/ui/Heading';
import { Link } from '@/components/ui/Link';
import { CostModelList } from '@/features/cost-models/components/CostModelList';
import { costModelsUrl, createCostModelPath } from '@/features/cost-models/lib/costModelUrls';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { replace } from '@/router';
import type { RouteProps } from '@/routes/routeTypes';

/**
 * Cost Models (`/dashboard/costmodels`): "My Cost Models" + "Create New Model" on the navy header, a search field, then the list card.
 * The search text lives in the URL (`?search=`), like the other filtered screens.
 */
export function CostModelsPage({ query }: RouteProps) {
  const search = query.get('search') ?? '';
  const [text, setText] = useState(search);
  const debounced = useDebouncedValue(text, 300);

  useEffect(() => {
    if (debounced !== search) replace(costModelsUrl(debounced));
    // `search` is deliberately not a dependency: the URL follows the (debounced) field, never the other way round.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  return (
    <div className="mx-auto max-w-285">
      <div className="flex items-center justify-between gap-4 pt-2">
        <Heading level={2} size="title" className="text-white">
          My Cost Models
        </Heading>
        <Link href={createCostModelPath()} className="text-sm font-semibold whitespace-nowrap text-white hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
          Create New Model
        </Link>
      </div>

      <form role="search" onSubmit={(event) => event.preventDefault()} className="relative mt-8">
        <label htmlFor="cost-model-search" className="sr-only">
          Search cost models
        </label>
        <Search size={18} aria-hidden className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-dash-placeholder" />
        <input
          id="cost-model-search"
          type="search"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Search..."
          autoComplete="off"
          className="h-9.5 w-full rounded-md bg-dash-surface pr-4 pl-11 text-sm text-dash-ink placeholder:text-dash-placeholder focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        />
      </form>

      <div className="mt-2.5">
        <CostModelList search={search} />
      </div>
    </div>
  );
}
