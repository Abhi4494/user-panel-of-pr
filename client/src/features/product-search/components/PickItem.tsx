const tones = {
  industry: 'bg-dash-pick-industry',
  product: 'bg-dash-pick-product',
  /** Sub categories while a search text is active (pink, like the live panel). */
  match: 'bg-dash-forum-tag',
} as const;

interface PickItemProps {
  label: string;
  selected: boolean;
  tone: keyof typeof tones;
  onPick: () => void;
}

/** A choosable row: coloured square (white dot when chosen) + name. Behaves like a radio inside its column. */
export function PickItem({ label, selected, tone, onPick }: PickItemProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onPick}
      className="group flex w-full items-start gap-2.5 py-2 text-left text-menu-link leading-snug text-dash-ink transition-colors hover:text-dash-outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-dash-accent"
    >
      <span aria-hidden className={`mt-px grid size-4.5 shrink-0 place-items-center rounded-sm ${tones[tone]}`}>
        <span className={`size-1.5 rounded-full bg-white transition-opacity ${selected ? 'opacity-100' : 'opacity-0'}`} />
      </span>
      <span className="min-w-0">{label}</span>
    </button>
  );
}
