function CategoryFilter({ activeCategory, categories, onSelect }) {
  return (
    <div aria-label="Filter by research area" className="category-filter">
      {["All areas", ...categories].map((category) => {
        const selected =
          category === "All areas" ? activeCategory === "" : activeCategory === category;

        return (
          <button
            aria-pressed={selected}
            className={`filter-chip${selected ? " is-active" : ""}`}
            key={category}
            onClick={() => onSelect(category === "All areas" ? "" : category)}
            type="button"
          >
            {category}
          </button>
        );
      })}
    </div>
  );
}

export default CategoryFilter;
