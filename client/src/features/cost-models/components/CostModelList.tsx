import { useCallback, useState } from 'react';
import { Heading } from '@/components/ui/Heading';
import { showToast } from '@/components/ui/Toaster';
import { deleteCostModel, getCostModels } from '@/features/cost-models/api/getCostModels';
import { CostModelRow } from '@/features/cost-models/components/CostModelRow';
import type { CostModelSummary } from '@/features/cost-models/types';
import { useAsync } from '@/hooks/useAsync';

/** White "Cost Model List" card. `search` comes from the URL; deleting asks first and then reloads the list in place. */
export function CostModelList({ search }: { search: string }) {
  const [version, setVersion] = useState(0);
  const [deletingId, setDeletingId] = useState<string>();
  // `version` only gives `load` a new identity after a delete, so the list refetches (keeping the old rows meanwhile).
  const load = useCallback(() => getCostModels(search), [search, version]);
  const { data, error } = useAsync(load, { pageLoader: 'first' });

  async function handleDelete(model: CostModelSummary) {
    if (!window.confirm(`Delete the cost model "${model.name}"?`)) return;
    setDeletingId(model.id);
    try {
      await deleteCostModel(model.id);
      setVersion((current) => current + 1);
      showToast('success', 'Cost model deleted.');
    } catch {
      showToast('error', 'We couldn’t delete this cost model. Please try again.');
    } finally {
      setDeletingId(undefined);
    }
  }

  return (
    <section aria-labelledby="cost-model-list" className="rounded-md border border-dash-hairline bg-dash-surface px-5 py-6 shadow-dash-card sm:px-7">
      <Heading id="cost-model-list" level={2} size="section" className="text-dash-strong">
        Cost Model List
      </Heading>
      {error ? (
        <p role="alert" className="mt-4 text-sm text-alert">
          We couldn&apos;t load your cost models right now. Please try again later.
        </p>
      ) : !data ? (
        <div aria-busy="true" className="mt-4 h-16 animate-pulse rounded bg-dash-panel-soft motion-reduce:animate-none" />
      ) : data.length ? (
        <ul className="mt-2 grid grid-cols-1 divide-y divide-dash-hairline">
          {data.map((model) => (
            <CostModelRow key={model.id} model={model} onDelete={handleDelete} deleting={deletingId === model.id} />
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm text-dash-subtle">{search ? 'No cost models match your search.' : 'You have no cost models yet.'}</p>
      )}
    </section>
  );
}
