interface HeroCurveProps {
  /** `compact` (16rem) for short pages such as the dashboard home; `tall` (22rem) for content-heavy ones such as Price Trends. */
  size?: 'compact' | 'tall';
}

/**
 * Navy header shape behind the dashboard top bar. Shape measured from the reference dashboard: the left edge sweeps
 * down in a long, round arc to its lowest point ~17% in from the left, then the bottom edge rises gently to the right.
 * It is an SVG stretched to the column width and the chosen height (`preserveAspectRatio="none"`), so the proportions
 * hold at every width. Fill is the `--dash-hero` token. Decorative only.
 */
export function HeroCurve({ size = 'compact' }: HeroCurveProps) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 1000 260"
      preserveAspectRatio="none"
      className={`absolute inset-x-0 top-0 -z-10 w-full fill-dash-hero ${size === 'tall' ? 'h-88' : 'h-64'}`}
    >
      <path d="M0 0H1000V175L170 254C60 254 0 150 0 60Z" />
    </svg>
  );
}
