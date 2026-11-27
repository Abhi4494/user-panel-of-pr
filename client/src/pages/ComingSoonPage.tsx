import { Heading } from '@/components/ui/Heading';
import { Link } from '@/components/ui/Link';

/** Placeholder for dashboard sections that are linked from the sidebar but not migrated yet. */
export function ComingSoonPage() {
  return (
    <div className="rounded-3xl border border-dash-line bg-dash-surface p-8 text-center">
      <Heading level={2} size="headline" className="text-dash-text">
        Coming soon
      </Heading>
      <p className="mt-2 text-sm text-dash-muted">This section has not been migrated yet.</p>
      <Link href="/dashboard/index" className="mt-4 inline-block text-sm font-semibold text-dash-accent hover:underline focus-visible:outline-2 focus-visible:outline-dash-accent">
        Back to dashboard
      </Link>
    </div>
  );
}
