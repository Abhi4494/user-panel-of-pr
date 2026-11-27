import { Link } from '@/components/ui/Link';
import { costModelDetailPath, editCostModelPath, updateCostModelPath } from '@/features/cost-models/lib/costModelUrls';
import type { CostModelSummary } from '@/features/cost-models/types';

const chip =
  'inline-flex items-center px-3.5 py-2.5 text-eyebrow font-semibold whitespace-nowrap transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-dash-accent';

interface CostModelRowProps {
  model: CostModelSummary;
  onDelete: (model: CostModelSummary) => void;
  deleting: boolean;
}

/** Name + period on the left, the four tinted actions (Add Raw Material, Edit, Detail, Delete) joined together on the right. */
export function CostModelRow({ model, onDelete, deleting }: CostModelRowProps) {
  return (
    <li className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 py-4">
      <div className="min-w-0">
        <p className="truncate text-base font-semibold text-dash-ink">{model.name}</p>
        <p className="mt-0.5 text-caption text-dash-subtle">{model.period}</p>
      </div>
      <div className="flex flex-wrap overflow-hidden rounded-sm">
        <Link href={updateCostModelPath(model.id)} className={`${chip} bg-dash-act-add-bg text-dash-act-add`}>
          Add Raw Material
        </Link>
        <Link href={editCostModelPath(model.id)} className={`${chip} bg-dash-act-edit-bg text-dash-act-edit`}>
          Edit
        </Link>
        <Link href={costModelDetailPath(model.id)} className={`${chip} bg-dash-act-detail-bg text-dash-act-detail`}>
          Detail
        </Link>
        <button type="button" onClick={() => onDelete(model)} disabled={deleting} aria-label={`Delete ${model.name}`} className={`${chip} bg-dash-act-delete-bg text-dash-act-delete disabled:opacity-50`}>
          Delete
        </button>
      </div>
    </li>
  );
}
