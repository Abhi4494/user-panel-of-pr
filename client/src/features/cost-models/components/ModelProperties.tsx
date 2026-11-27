import { useState } from 'react';
import { Heading } from '@/components/ui/Heading';
import { Link } from '@/components/ui/Link';
import { showToast } from '@/components/ui/Toaster';
import { saveCostModel } from '@/features/cost-models/api/getCostModel';
import { COST_MODELS_PATH, costModelDetailPath } from '@/features/cost-models/lib/costModelUrls';
import type { CostModel } from '@/features/cost-models/types';

const button =
  'inline-flex h-10.5 items-center justify-center rounded-sm px-6 text-sm font-semibold text-white transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dash-accent disabled:opacity-60';

const fixed2 = (value: number) => value.toFixed(2);
const yesNo = (value: boolean) => (value ? 'Yes' : 'No');

function Field({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="min-w-0">
      <dt className="text-caption text-dash-nav-idle">{label}</dt>
      <dd className="mt-1 text-sm break-words text-dash-ink">{value}</dd>
    </div>
  );
}

/** "Model Properties" card: the model's values (read-only, as on production) with Back / View Detail / Save on top. */
export function ModelProperties({ model }: { model: CostModel }) {
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      await saveCostModel(model);
      showToast('success', 'Cost model saved.');
    } catch {
      showToast('error', 'We couldn’t save this cost model. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <section aria-labelledby="model-properties" className="@container rounded-md bg-dash-surface p-6 shadow-dash-card @min-[38rem]:p-7">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <Heading id="model-properties" level={2} size="title" className="font-normal text-dash-ink">
          Model Properties
        </Heading>
        <div className="flex flex-wrap gap-2">
          <Link href={COST_MODELS_PATH} className={`${button} bg-dash-chip`}>
            Back
          </Link>
          <Link href={costModelDetailPath(model.id)} className={`${button} bg-dash-hero`}>
            View Detail
          </Link>
          <button type="button" onClick={handleSave} disabled={saving} aria-busy={saving} className={`${button} bg-dash-hero`}>
            Save
          </button>
        </div>
      </div>

      <dl className="mt-8 grid grid-cols-1 gap-x-6 gap-y-6 @min-[34rem]:grid-cols-2 @min-[56rem]:grid-cols-4">
        <Field label="Name" value={model.name} />
        <Field label="Code" value={model.code} />
        <Field label="Region" value={model.region} />
        <Field label="Currency" value={model.currency} />
        <Field label="Unit" value={model.unit} />
        <Field label="Capacity Per Year" value={fixed2(model.capacityPerYear)} />
        <Field label="ThroughPut(%)" value={fixed2(model.throughputPercent)} />
        <Field label={`Exchange Rate (${model.currency}/USD)`} value={fixed2(model.exchangeRate)} />
        <Field label="Number Of Operation Days" value={model.operationDays} />
        <Field label="Advance Capital (Months)" value={model.advanceCapitalMonths} />
        <Field label="Capex In USD Million" value={fixed2(model.capexUsdMillion)} />
        <Field label="Off sites(%)" value={fixed2(model.offsitesPercent)} />
      </dl>

      <p className="mt-6 grid grid-cols-1 gap-x-6 gap-y-3 text-sm text-dash-ink @min-[34rem]:grid-cols-2 @min-[56rem]:grid-cols-4">
        <span>Depreciated Plant : {yesNo(model.depreciatedPlant)}</span>
        <span>Status : {model.status}</span>
        <span>Active : {yesNo(model.active)}</span>
      </p>

      <div className="mt-6">
        <p className="text-caption text-dash-nav-idle">Specifications</p>
        {model.specifications && <p className="mt-1 text-sm text-dash-ink">{model.specifications}</p>}
      </div>
    </section>
  );
}
