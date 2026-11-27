import { Heading } from '@/components/ui/Heading';
import { ViewAllLink } from '@/components/ui/ViewAllLink';
import { ModelCard } from '@/features/pcr/components/ModelCard';
import { reportsUrl } from '@/features/pcr/lib/reportsUrl';
import type { PcrReport } from '@/features/pcr/types';

/** Soft grey panel with the latest cost models; "View All" opens the full reports list. */
export function RecentModels({ models }: { models: PcrReport[] }) {
  return (
    <section aria-labelledby="pcr-recent-models" className="rounded-2xl bg-dash-panel-soft p-6 @3xl:p-7.5">
      <div className="flex items-center justify-between gap-3">
        <Heading id="pcr-recent-models" level={2} size="section" className="text-dash-ink">
          Recent Cost Models
        </Heading>
        <ViewAllLink href={reportsUrl()} />
      </div>
      <ul className="mt-5 grid gap-4">
        {models.map((report) => (
          <ModelCard key={report.id} report={report} />
        ))}
      </ul>
    </section>
  );
}
