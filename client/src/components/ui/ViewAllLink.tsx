import { Link } from '@/components/ui/Link';

/** The small "View All" link on dashboard cards: navy, 12px, with a 1px dotted underline (as on the live site). */
export function ViewAllLink({ href }: { href: string }) {
  return (
    <Link
      href={href}
      className="border-b border-dotted border-dash-outline pb-0.5 text-caption font-semibold text-dash-outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dash-accent"
    >
      View All
    </Link>
  );
}
