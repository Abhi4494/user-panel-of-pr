import { Check, X } from 'lucide-react';
import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { FieldError, FieldLabel, inlineErrorId } from '@/components/ui/TextField';
import { getProducts } from '@/features/catalog/api/getProducts';
import type { ProductOption } from '@/features/catalog/types';

const SEARCH_DELAY_MS = 250;
const MAX_VISIBLE_OPTIONS = 100;

interface ProductSelectProps {
  id: string;
  label: string;
  /** Called with the ids of every selected product whenever the selection changes. */
  onChange: (productIds: string[]) => void;
  onBlur: () => void;
  error?: string;
  wrapperClassName?: string;
}

/** Type-ahead multi-select backed by the product-list API. Selected products show as removable chips inside the field. */
export function ProductSelect({ id, label, onChange, onBlur, error, wrapperClassName }: ProductSelectProps) {
  const [text, setText] = useState('');
  const [selected, setSelected] = useState<ProductOption[]>([]);
  const [options, setOptions] = useState<ProductOption[]>([]);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = `${id}-options`;
  const errorId = `${id}-error`;

  // Fetch while the list is open; debounced, and a newer keystroke cancels the previous request.
  useEffect(() => {
    if (!isOpen) return;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      setStatus('loading');
      getProducts(text.trim(), controller.signal)
        .then((products) => {
          setOptions(products.slice(0, MAX_VISIBLE_OPTIONS));
          setActiveIndex(-1);
          setStatus('idle');
        })
        .catch((reason: unknown) => {
          if (reason instanceof DOMException && reason.name === 'AbortError') return;
          setOptions([]);
          setStatus('error');
        });
    }, SEARCH_DELAY_MS);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [text, isOpen]);

  function update(next: ProductOption[]) {
    setSelected(next);
    onChange(next.map((product) => product.id));
  }

  function toggle(option: ProductOption) {
    update(selected.some((product) => product.id === option.id) ? selected.filter((product) => product.id !== option.id) : [...selected, option]);
  }

  function close() {
    setIsOpen(false);
    setText('');
    onBlur();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setIsOpen(true);
      setActiveIndex((index) => Math.min(index + 1, options.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
    } else if (event.key === 'Enter' && isOpen && options[activeIndex]) {
      event.preventDefault();
      toggle(options[activeIndex]);
    } else if (event.key === 'Backspace' && text === '' && selected.length > 0) {
      update(selected.slice(0, -1));
    } else if (event.key === 'Escape') {
      setIsOpen(false);
    }
  }

  const message =
    status === 'loading' ? 'Searching…' : status === 'error' ? 'Unable to load products.' : options.length === 0 ? 'No products found.' : null;
  const boxState = error ? 'border-invalid-border bg-invalid-bg' : 'border-soft-border bg-soft-field';

  return (
    <div
      ref={containerRef}
      className={`group relative ${wrapperClassName ?? ''}`}
      onBlur={(event) => {
        if (!containerRef.current?.contains(event.relatedTarget)) close();
      }}
    >
      <FieldLabel htmlFor={id} error={error}>
        {label}
      </FieldLabel>
      {/* The chips live inside the field box, in front of the search input, and the box grows with them. */}
      <div
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) {
            event.preventDefault();
            inputRef.current?.focus();
          }
        }}
        className={`flex min-h-(--density-control-h) flex-wrap items-center gap-1.5 rounded-lg border px-2 py-1.5 transition-colors duration-150 focus-within:border-accent focus-within:ring-3 focus-within:ring-accent/20 ${boxState}`}
      >
        {selected.map((product) => (
          <span
            key={product.id}
            className="inline-flex items-center gap-1 rounded-md bg-accent/10 py-0.5 pr-1 pl-2 text-caption font-medium text-accent"
          >
            {product.name}
            <button
              type="button"
              aria-label={`Remove ${product.name}`}
              onClick={() => update(selected.filter((item) => item.id !== product.id))}
              className="inline-flex size-4 items-center justify-center rounded hover:bg-accent/15 focus-visible:outline-2 focus-visible:outline-accent"
            >
              <X size={12} aria-hidden />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          id={id}
          name={id}
          value={text}
          placeholder={selected.length > 0 ? '' : 'Search products...'}
          autoComplete="off"
          required
          role="combobox"
          aria-expanded={isOpen}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          aria-activedescendant={activeIndex >= 0 ? `${id}-option-${activeIndex}` : undefined}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          onChange={(event) => {
            setText(event.target.value);
            setIsOpen(true);
          }}
          className="min-w-24 flex-1 bg-transparent px-1 py-1 text-sm text-ink-strong outline-none placeholder:text-soft-placeholder"
        />
      </div>
      {isOpen && (
        <ul
          id={listId}
          role="listbox"
          aria-multiselectable
          className="absolute top-full z-20 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-soft-border bg-white py-1 text-sm shadow-card"
        >
          {message && <li className="px-3 py-2 text-muted">{message}</li>}
          {!message &&
            options.map((option, index) => {
              const isSelected = selected.some((product) => product.id === option.id);
              return (
                <li
                  key={option.id}
                  id={`${id}-option-${index}`}
                  role="option"
                  aria-selected={isSelected}
                  // mousedown (not click) so the input blur does not close the list first.
                  onMouseDown={(event) => {
                    event.preventDefault();
                    toggle(option);
                  }}
                  className={`flex cursor-pointer items-center justify-between gap-2 px-3 py-2 text-ink-strong ${index === activeIndex ? 'bg-soft-field' : 'hover:bg-soft-field'}`}
                >
                  {option.name}
                  {isSelected && <Check size={16} aria-hidden className="shrink-0 text-accent" />}
                </li>
              );
            })}
        </ul>
      )}
      <FieldError id={errorId} inlineId={inlineErrorId(id)}>
        {error}
      </FieldError>
    </div>
  );
}
