import type { AnchorHTMLAttributes, MouseEvent } from 'react';
import { navigate } from '@/router';

/** Internal link: navigates without a page reload. Modified clicks (new tab, etc.) and absolute `http(s)` URLs behave as normal links. */
export function Link({ href, onClick, target, ...props }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    onClick?.(event);
    const plainLeftClick = event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
    if (event.defaultPrevented || /^https?:\/\//.test(href) || !plainLeftClick || (target && target !== '_self')) return;
    event.preventDefault();
    navigate(href);
  }

  return <a href={href} target={target} onClick={handleClick} {...props} />;
}
