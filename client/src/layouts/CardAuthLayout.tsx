import type { ReactNode } from 'react';
import { Link } from '@/components/ui/Link';
import logoUrl from '@/assets/pr-claight-logo.avif';
import { ParticleField } from '@/components/ui/ParticleField';

interface CardAuthLayoutProps {
  /** White card content (form side). */
  children: ReactNode;
  /** Gradient panel content. */
  aside: ReactNode;
  /** Put the panel on the left at lg+ (default: right). */
  asideFirst?: boolean;
}

/**
 * Modern auth shell (owns the logo, so it is identical on every page): soft gradient page, rounded white form card and rounded gradient panel.
 * ≥1024px: side by side, fitted to one viewport (no page scroll). Below: card only, panel hidden.
 */
export function CardAuthLayout({ children, aside, asideFirst = false }: CardAuthLayoutProps) {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-linear-to-br from-page-start to-page-end p-4 sm:p-6 lg:h-dvh lg:overflow-hidden lg:p-6 xl:p-8">
      <div className={`grid w-full max-w-6xl gap-6 lg:h-full lg:max-h-(--density-max-h) ${asideFirst ? 'lg:grid-cols-[1fr_1.15fr]' : 'lg:grid-cols-[1.15fr_1fr]'}`}>
        <main className="relative isolate overflow-hidden rounded-3xl bg-white shadow-card">
          {/* Minimal decorative tint, kept faint so forms stay clean */}
          <span aria-hidden className="absolute -top-24 -right-24 -z-10 size-60 rounded-full bg-accent/5" />
          <span aria-hidden className="absolute -bottom-20 -left-16 -z-10 size-44 rounded-full bg-accent/5" />
          <div className="flex h-full flex-col p-6 sm:p-10 scrollbar-none lg:overflow-x-hidden lg:overflow-y-auto lg:px-10 lg:py-(--density-card-py) xl:px-12">
            {/* Logo is pinned top-left on every auth page; the form is centred in the space below it (symmetric padding keeps a minimum gap). */}
            <Link href="/account/login" className="self-start">
              <img src={logoUrl} alt="Procurement Resource | Claight" className="h-8 w-auto" />
            </Link>
            <div className="my-auto flex flex-col py-(--density-section)">{children}</div>
          </div>
        </main>
        <aside className={`relative isolate hidden flex-col gap-5 overflow-hidden rounded-3xl bg-linear-to-br from-panel-start to-panel-end p-10 text-white lg:flex xl:p-12 ${asideFirst ? 'lg:order-first' : ''}`}>
          <ParticleField />
          {aside}
        </aside>
      </div>
    </div>
  );
}
