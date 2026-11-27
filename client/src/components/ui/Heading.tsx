import type { HTMLAttributes } from 'react';

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

/** Visual size is independent of the semantic level. Sizes come from `@theme` tokens. */
const sizes = {
  display: 'text-display leading-tight font-semibold',
  headline: 'text-headline leading-tight font-semibold',
  title: 'text-title leading-tight font-semibold',
  /** Small section heading inside a page (e.g. "Categories"); standard 1rem. */
  section: 'text-base leading-tight font-semibold',
  /** Dashboard menu header (matches the live site's small title); token is `--text-menu-title`. */
  nav: 'text-menu-title leading-tight font-semibold',
} as const;

export type HeadingSize = keyof typeof sizes;

interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  /** Semantic level (h1–h6). Never write raw h1–h6 tags in pages/components; use this. */
  level: HeadingLevel;
  size?: HeadingSize;
}

export function Heading({ level, size = 'title', className, ...props }: HeadingProps) {
  const Tag = `h${level}` as const;
  return <Tag className={`${sizes[size]} ${className ?? ''}`} {...props} />;
}
