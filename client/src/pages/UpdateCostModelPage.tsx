import { useCallback } from 'react';
import { Link } from '@/components/ui/Link';
import { getCostModel } from '@/features/cost-models/api/getCostModel';
import { CostModelTabs } from '@/features/cost-models/components/CostModelTabs';
import { ModelProperties } from '@/features/cost-models/components/ModelProperties';
import { COST_MODELS_PATH } from '@/features/cost-models/lib/costModelUrls';
import { useAsync } from '@/hooks/useAsync';
import type { RouteParams } from '@/routes/routeTypes';

const skeleton = 'animate-pulse rounded-md bg-dash-surface motion-reduce:animate-none';

/**
 * Add Cost Models (`/CostModel/UpdateCostModel/:id` on production, opened by "Add Raw Material" in the cost model list):
 * the model's properties card and, below, its Raw Materials / Utilities / Labour / Co-Products tabs.
 */
export function UpdateCostModelPage({ params }: { params: RouteParams }) {
  const id = params.id ?? '';
  const load = useCallback(() => getCostModel(id), [id]);
  const { data, error } = useAsync(load);

  if (error) {
    return (
      <div role="alert" className="mx-auto max-w-285 rounded-md bg-dash-surface p-8 text-center shadow-dash-card">
        <p className="text-sm text-dash-ink">We couldn&apos;t find this cost model.</p>
        <Link href={COST_MODELS_PATH} className="mt-3 inline-block text-sm font-semibold text-dash-outline hover:underline focus-visible:outline-2 focus-visible:outline-dash-accent">
          Back to My Cost Models
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-285 flex-col gap-4">
      {data ? (
        <>
          <ModelProperties model={data} />
          <CostModelTabs modelId={data.id} />
        </>
      ) : (
        <div aria-busy="true" aria-label="Loading cost model" className="flex flex-col gap-4">
          <div className={`h-96 ${skeleton}`} />
          <div className={`h-56 ${skeleton}`} />
        </div>
      )}
    </div>
  );
}
