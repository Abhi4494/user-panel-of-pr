import type { ReactNode } from 'react';

const tints = {
  peach: 'bg-dash-tint-peach',
  rose: 'bg-dash-tint-rose',
  mint: 'bg-dash-tint-mint',
  sky: 'bg-dash-tint-sky',
} as const;

interface SearchColumnProps {
  title: string;
  tint: keyof typeof tints;
  children: ReactNode;
}

/** One tinted card of the search panel: small caps title on top, the list below scrolls on its own (thin scrollbar). */
export function SearchColumn({ title, tint, children }: SearchColumnProps) {
  return (
    <section
      aria-label={title}
      className={`flex h-[min(28.125rem,calc(100dvh-13rem))] w-56.5 min-w-40 shrink flex-col rounded-sm pt-8 pl-5 shadow-dash-card max-sm:h-72 max-sm:w-full ${tints[tint]}`}
    >
      <p className="text-sm font-extrabold tracking-wide text-dash-strong uppercase">{title}</p>
      <div className="scrollbar-soft mt-3.5 min-h-0 flex-1 overflow-y-auto pr-4 pb-4">{children}</div>
    </section>
  );
}
