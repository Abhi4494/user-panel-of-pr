import { Eye, EyeOff } from 'lucide-react';
import { useLayoutEffect, useState, type InputHTMLAttributes, type ReactNode } from 'react';

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  /** Validation message; when set the field renders in its error state. */
  error?: string;
  /** Renders the "validated OK" state (legacy Parsley success styling). */
  isValid?: boolean;
  /** Decorative icon shown inside the field's left edge. */
  startIcon?: ReactNode;
  /** Wrapper class, e.g. grid column spans. */
  wrapperClassName?: string;
}

const inputClass =
  'h-(--density-control-h) rounded-lg border px-3 text-sm placeholder:text-soft-placeholder focus:border-accent focus:ring-3 focus:ring-accent/20';
const states = {
  idle: 'border-soft-border bg-soft-field text-ink-strong',
  valid: 'border-valid-border bg-soft-field text-ink-strong',
  invalid: 'border-invalid-border bg-invalid-bg text-ink-strong',
};

/** Shared with other soft-variant controls (phone field) so they stay visually identical. */
export const softInputClass = `block w-full outline-none transition-colors duration-150 ${inputClass}`;

export function TextField({
  id,
  label,
  error,
  isValid = false,
  className,
  startIcon,
  wrapperClassName,
  type,
  ...inputProps
}: TextFieldProps) {
  const [isRevealed, setIsRevealed] = useState(false);
  const state = error ? 'invalid' : isValid ? 'valid' : 'idle';
  const errorId = `${id}-error`;
  // Every password field gets a show/hide toggle.
  const isPassword = type === 'password';
  const EyeIcon = isRevealed ? EyeOff : Eye;

  return (
    <div className={`group relative ${wrapperClassName ?? ''}`}>
      <FieldLabel htmlFor={id} error={error}>
        {label}
      </FieldLabel>
      <div className="relative">
        {startIcon && (
          <span aria-hidden className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-soft-placeholder">
            {startIcon}
          </span>
        )}
        <input
          id={id}
          type={isPassword && isRevealed ? 'text' : type}
          className={`block w-full outline-none transition-colors duration-150 ${inputClass} ${states[state]} ${startIcon ? 'pl-10' : ''} ${isPassword ? 'pr-10' : ''} ${className ?? ''}`}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          {...inputProps}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setIsRevealed((revealed) => !revealed)}
            aria-label={isRevealed ? 'Hide password' : 'Show password'}
            aria-pressed={isRevealed}
            className="absolute inset-y-0 right-0 flex w-10 cursor-pointer items-center justify-center rounded-r-lg text-soft-placeholder transition-colors hover:text-ink-strong focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent"
          >
            <EyeIcon size={16} aria-hidden />
          </button>
        )}
      </div>
      <FieldError id={errorId} inlineId={inlineErrorId(id)}>
        {error}
      </FieldError>
    </div>
  );
}

interface FieldLabelProps {
  htmlFor: string;
  /** Validation message, shown on the label line so an error never changes the form's height. */
  error?: string;
  children: ReactNode;
}

/** DOM id of the short error on a field's label line; `FieldError` measures it to know if the text is clipped. */
export const inlineErrorId = (fieldId: string) => `${fieldId}-inline-error`;

/**
 * Label row: field name on the left, short error on the right. The label never wraps (that would change the form's
 * height and misalign columns); only the error shrinks, with an ellipsis (full text: tooltip, and the popover on focus).
 */
export function FieldLabel({ htmlFor, error, children }: FieldLabelProps) {
  return (
    <div className="mb-1 flex min-w-0 items-baseline justify-between gap-2">
      <label htmlFor={htmlFor} className="block shrink-0 text-caption font-medium whitespace-nowrap text-ink-strong">
        {children}
      </label>
      {error && (
        <span id={inlineErrorId(htmlFor)} aria-hidden className="min-w-0 flex-1 truncate text-right text-caption text-invalid-text">
          {error}
        </span>
      )}
    </div>
  );
}

interface FieldErrorProps {
  id: string;
  /** Which side of the control the popover opens on (use `above` near the bottom of a card). */
  placement?: 'below' | 'above';
  /**
   * Id of the inline label-line message (`inlineErrorId`). When given, the popover is only used if that message is
   * clipped, so short errors are not shown twice. Omit for controls with no inline message (checkbox, captcha).
   */
  inlineId?: string;
  children?: ReactNode;
}

/**
 * Full error text as a floating popover, visible while the field (the parent `group relative`) has focus.
 * Absolutely positioned, so it never affects layout. Always in the DOM for `aria-describedby`.
 */
export function FieldError({ id, placement = 'below', inlineId, children }: FieldErrorProps) {
  const [inlineClipped, setInlineClipped] = useState(true);

  useLayoutEffect(() => {
    const inline = inlineId ? document.getElementById(inlineId) : null;
    if (!inline) {
      setInlineClipped(true);
      return;
    }
    const measure = () => {
      const clipped = inline.scrollWidth > inline.clientWidth;
      setInlineClipped(clipped);
      // A clipped message is shown in full under the control, so hide the label-line copy (it stays laid out for measuring).
      inline.style.visibility = clipped ? 'hidden' : '';
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(inline);
    return () => observer.disconnect();
  }, [inlineId, children]);

  if (!children) return null;
  // A label-line message that does not fit is shown in full under the control, so it can always be read.
  if (inlineId && inlineClipped) {
    return (
      <p id={id} className="mt-1 text-caption leading-snug text-invalid-text">
        {children}
      </p>
    );
  }
  const side = placement === 'below' ? 'top-full mt-1' : 'bottom-full mb-1';
  return (
    <p
      id={id}
      className={`pointer-events-none absolute left-0 z-10 hidden max-w-full rounded-md bg-ink-strong px-2 py-1 text-caption leading-snug text-white shadow-card ${inlineClipped ? 'group-focus-within:block' : ''} ${side}`}
    >
      {children}
    </p>
  );
}
