function OpportunityTypeFilter({ activeTypes, onToggle, types }) {
  return (
    <div aria-label="Filter by opportunity type" className="type-filters" role="group">
      {types.map((type) => (
        <button
          aria-pressed={activeTypes.includes(type)}
          className={`filter-chip${activeTypes.includes(type) ? " is-active" : ""}`}
          key={type}
          onClick={() => onToggle(type)}
          type="button"
        >
          {type}
        </button>
      ))}
    </div>
  );
}

export default OpportunityTypeFilter;
