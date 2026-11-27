import 'flag-icons/css/flag-icons.min.css';
import { ChevronDown } from 'lucide-react';
import { useRef, useState, type InputHTMLAttributes, type KeyboardEvent } from 'react';
import { FieldError, FieldLabel, inlineErrorId, softInputClass } from './TextField';

export interface DialCode {
  /** ISO 3166-1 alpha-2 country code; also picks the flag. */
  country: string;
  dial: string;
}

interface PhoneFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'id' | 'name'> {
  id: string;
  name: string;
  label: string;
  dialCodes: readonly DialCode[];
  dialCountry: string;
  onDialCountryChange: (country: string) => void;
  error?: string;
  wrapperClassName?: string;
}

/** Flag image (flag-icons SVG, so it shows on Windows too, where flag emoji render as letters). */
function Flag({ country }: { country: string }) {
  return <span aria-hidden className={`fi fi-${country.toLowerCase()} shrink-0 rounded-xs`} />;
}

/** Contact number: dial-code picker (flag + code) joined to a number input. */
export function PhoneField({
  id,
  name,
  label,
  dialCodes,
  dialCountry,
  onDialCountryChange,
  error,
  wrapperClassName,
  ...inputProps
}: PhoneFieldProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);
  const errorId = `${id}-error`;
  const listId = `${id}-dial-codes`;
  const borderState = error ? 'border-invalid-border' : 'border-soft-border';
  const current = dialCodes.find((code) => code.country === dialCountry) ?? dialCodes[0];

  function choose(country: string) {
    onDialCountryChange(country);
    setIsOpen(false);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    const index = dialCodes.findIndex((code) => code.country === dialCountry);
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const next = Math.min(Math.max(index + (event.key === 'ArrowDown' ? 1 : -1), 0), dialCodes.length - 1);
      onDialCountryChange(dialCodes[next].country);
      setIsOpen(true);
    } else if (event.key === 'Escape') {
      setIsOpen(false);
    }
  }

  return (
    <div className={`group relative ${wrapperClassName ?? ''}`}>
      <FieldLabel htmlFor={id} error={error}>
        {label}
      </FieldLabel>
      <div
        className={`flex rounded-lg border bg-soft-field transition-shadow focus-within:border-accent focus-within:ring-3 focus-within:ring-accent/20 ${borderState}`}
      >
        <div
          ref={pickerRef}
          className="relative"
          onBlur={(event) => {
            if (!pickerRef.current?.contains(event.relatedTarget)) setIsOpen(false);
          }}
        >
          <button
            type="button"
            aria-label={`Country dial code, ${current.country} ${current.dial}`}
            aria-haspopup="listbox"
            aria-expanded={isOpen}
            aria-controls={listId}
            onClick={() => setIsOpen((open) => !open)}
            onKeyDown={handleKeyDown}
            className="flex h-full cursor-pointer items-center gap-2 rounded-l-lg border-r border-soft-border bg-soft-border/60 pr-2 pl-3 text-sm whitespace-nowrap text-ink-strong outline-none"
          >
            <Flag country={current.country} />
            {current.dial}
            <ChevronDown size={14} aria-hidden className="text-soft-placeholder" />
          </button>
          {isOpen && (
            <ul
              id={listId}
              role="listbox"
              aria-label="Country dial code"
              className="absolute top-full left-0 z-20 mt-1 max-h-60 w-max overflow-auto rounded-lg border border-soft-border bg-white py-1 text-sm shadow-card"
            >
              {dialCodes.map((code) => (
                <li
                  key={code.country}
                  role="option"
                  aria-selected={code.country === dialCountry}
                  // mousedown (not click) so the button blur does not close the list first.
                  onMouseDown={(event) => {
                    event.preventDefault();
                    choose(code.country);
                  }}
                  className={`flex cursor-pointer items-center gap-2 px-3 py-2 text-ink-strong hover:bg-soft-field ${code.country === dialCountry ? 'bg-soft-field' : ''}`}
                >
                  <Flag country={code.country} />
                  <span className="w-8 text-muted">{code.country}</span>
                  {code.dial}
                </li>
              ))}
            </ul>
          )}
        </div>
        <input
          id={id}
          name={name}
          type="tel"
          inputMode="tel"
          className={`${softInputClass} min-w-0 flex-1 rounded-none border-0 bg-transparent focus:ring-0`}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          {...inputProps}
        />
      </div>
      <FieldError id={errorId} inlineId={inlineErrorId(id)}>
        {error}
      </FieldError>
    </div>
  );
}
