import type { ButtonHTMLAttributes } from 'react';

/** Modern primary action button (registration). Tinted while disabled, solid accent when enabled. */
export function SoftButton({ className, type = 'button', ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type={type}
      className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-accent h-(--density-control-h) px-5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-accent-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:bg-accent-soft disabled:hover:bg-accent-soft ${className ?? ''}`}
      {...props}
    />
  );
}
