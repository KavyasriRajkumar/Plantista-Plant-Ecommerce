import { useState } from 'react';
import { FiSearch } from 'react-icons/fi';

/**
 * SearchBar — controlled or uncontrolled text search input.
 * Calls onSearch(value) on submit (Enter or icon click), not on every
 * keystroke, so callers control debouncing/filtering timing themselves.
 */
export default function SearchBar({ placeholder = 'Search for plants…', onSearch, className = '' }) {
  const [value, setValue] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch?.(value.trim());
  };

  return (
    <form onSubmit={handleSubmit} className={`relative w-full ${className}`} role="search">
      <label htmlFor="site-search" className="sr-only">
        Search plants
      </label>
      <input
        id="site-search"
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-full border border-ink/10 bg-paper py-3 pl-5 pr-12 text-sm text-ink placeholder:text-ink/40 focus:border-fern focus:outline-none"
      />
      <button
        type="submit"
        aria-label="Search"
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-fern p-2 text-paper transition-colors hover:bg-moss"
      >
        <FiSearch size={16} />
      </button>
    </form>
  );
}
