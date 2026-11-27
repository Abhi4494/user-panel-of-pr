import type { InputHTMLAttributes, ReactNode } from 'react';
import { FieldError } from './TextField';

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  id: string;
  /** Label content; may contain links. */
  children: ReactNode;
  error?: string;
}

export function Checkbox({ id, children, error, className, ...inputProps }: CheckboxProps) {
  const errorId = `${id}-error`;
  return (
    <div className={`group relative ${className ?? ''}`}>
      <div className="flex items-start gap-2.5">
        <input
          id={id}
          type="checkbox"
          className={`mt-0.5 size-5 shrink-0 cursor-pointer rounded-md border accent-accent ${error ? 'border-invalid-text' : 'border-muted'} focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent`}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          {...inputProps}
        />
        <label htmlFor={id} className={`cursor-pointer text-sm leading-snug ${error ? 'text-invalid-text' : 'text-ink-strong'}`}>
          {children}
        </label>
      </div>
      <FieldError id={errorId} placement="above">
        {error}
      </FieldError>
    </div>
  );
}
