import { useState, type FormEvent } from 'react';
import { Search } from 'lucide-react';

interface SearchBoxProps {
  /** Unique id (also used for the input), e.g. "pcr-search". */
  id: string;
  /** Accessible name of the field (there is no visible label). */
  label: string;
  placeholder?: string;
  /** Called with the typed text when the form is submitted (Enter or the button). */
  onSearch: (text: string) => void;
}

/** White card with a soft search field and a navy button (right column of the dashboard screens). Navigation is up to the caller. */
export function SearchBox({ id, label, placeholder = 'Search...', onSearch }: SearchBoxProps) {
  const [text, setText] = useState('');

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSearch(text);
  }

  return (
    <form role="search" onSubmit={submit} className="flex rounded-2xl bg-dash-surface p-5 shadow-dash-card">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <input
        id={id}
        type="search"
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder={placeholder}
        className="h-10.5 min-w-0 flex-1 rounded-l-lg bg-dash-panel-soft px-4 text-sm text-dash-ink placeholder:text-dash-placeholder focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-dash-accent"
      />
      <button
        type="submit"
        aria-label="Search"
        className="inline-flex size-10.5 shrink-0 items-center justify-center rounded-r-lg bg-dash-hero text-white transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dash-accent"
      >
        <Search size={18} aria-hidden />
      </button>
    </form>
  );
}
