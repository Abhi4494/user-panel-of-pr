import { useState } from 'react';
import { Heading } from '@/components/ui/Heading';
import { Link } from '@/components/ui/Link';
import { addRawMaterialPath } from '@/features/cost-models/lib/costModelUrls';

const TABS = [
  { id: 'raw-materials', label: 'Raw Materials' },
  { id: 'utilities', label: 'Utilities' },
  { id: 'labour', label: 'Labour' },
  { id: 'co-products', label: 'Co-Products' },
] as const;

/**
 * Raw Materials / Utilities / Labour / Co-Products tabs of the model. Only the Raw Materials panel is known from production (its heading
 * and the "Add Raw Material" button); the others are empty panels for now.
 * TODO(backend): list each tab's rows from `GET /api/cost-models/:id/raw-materials` etc.
 */
export function CostModelTabs({ modelId }: { modelId: string }) {
  const [active, setActive] = useState<(typeof TABS)[number]['id']>('raw-materials');
  const current = TABS.find((tab) => tab.id === active) ?? TABS[0];

  return (
    <section aria-label="Model contents" className="rounded-md bg-dash-surface px-6 pt-7 pb-8 shadow-dash-card @min-[38rem]:px-7">
      <div role="tablist" aria-label="Model contents" className="flex max-w-full overflow-x-auto border-b border-dash-hairline scrollbar-none">
        {TABS.map((tab) => {
          const selected = tab.id === active;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              id={`tab-${tab.id}`}
              aria-selected={selected}
              aria-controls={`panel-${tab.id}`}
              onClick={() => setActive(tab.id)}
              className={`-mb-px shrink-0 border-b-2 px-4 py-3 text-sm whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-dash-accent ${
                selected ? 'border-dash-outline font-medium text-dash-nav-active' : 'border-transparent text-dash-nav-idle hover:text-dash-nav-active'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div role="tabpanel" id={`panel-${current.id}`} aria-labelledby={`tab-${current.id}`} className="pt-9">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Heading level={2} size="title" className="text-dash-ink">
            {current.label}
          </Heading>
          {current.id === 'raw-materials' && (
            <Link
              href={addRawMaterialPath(modelId)}
              className="inline-flex h-8.5 items-center rounded-sm bg-dash-hero px-4 text-eyebrow font-semibold text-white transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dash-accent"
            >
              Add Raw Material
            </Link>
          )}
        </div>
        <p className="mt-6 text-sm text-dash-subtle">Nothing added yet.</p>
      </div>
    </section>
  );
}
