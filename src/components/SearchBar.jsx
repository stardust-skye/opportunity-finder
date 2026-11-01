import { Search, X } from "lucide-react";
import { useEffect, useRef } from "react";

function SearchBar({ onChange, value }) {
  const searchInputRef = useRef(null);

  useEffect(() => {
    function handleSearchShortcut(event) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
    }

    window.addEventListener("keydown", handleSearchShortcut);
    return () => window.removeEventListener("keydown", handleSearchShortcut);
  }, []);

  return (
    <div className="search-field">
      <Search aria-hidden="true" size={19} strokeWidth={1.8} />
      <label className="sr-only" htmlFor="opportunity-search">
        Search opportunities, professors, or skills
      </label>
      <input
        autoComplete="off"
        id="opportunity-search"
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search opportunities, professors, or skills"
        ref={searchInputRef}
        type="search"
        value={value}
      />
      {value && (
        <button
          aria-label="Clear search"
          className="search-clear"
          onClick={() => onChange("")}
          type="button"
        >
          <X size={16} />
        </button>
      )}
      {!value && <kbd aria-hidden="true">⌘ K</kbd>}
    </div>
  );
}

export default SearchBar;
