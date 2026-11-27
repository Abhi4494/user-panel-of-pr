import type { HTMLAttributes } from 'react';

/**
 * Fades its content in. Give it a `key` that changes per screen so it re-plays on navigation.
 * Opacity only (no transform) so absolutely-positioned decorations inside never shift during the fade.
 */
export function FadeIn({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`motion-safe:animate-fade-in ${className ?? ''}`} {...props} />;
}
