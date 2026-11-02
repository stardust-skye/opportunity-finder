import { X } from "lucide-react";

function ActiveFilters({
  activeCategory,
  activeSkills,
  activeTypes,
  onClear,
  onRemoveCategory,
  onRemoveSearch,
  onRemoveSkill,
  onRemoveType,
  search,
}) {
  const hasFilters =
    search || activeCategory || activeSkills.length > 0 || activeTypes.length > 0;

  if (!hasFilters) {
    return null;
  }

  return (
    <div aria-label="Active filters" className="active-filters">
      <span>Showing matches for your curiosity</span>
      {search && (
        <button className="active-filter-tag" onClick={onRemoveSearch} type="button">
          Search: “{search}” <X aria-hidden="true" size={12} />
        </button>
      )}
      {activeCategory && (
        <button className="active-filter-tag" onClick={onRemoveCategory} type="button">
          {activeCategory} <X aria-hidden="true" size={12} />
        </button>
      )}
      {activeSkills.map((skill) => (
        <button className="active-filter-tag" key={skill} onClick={() => onRemoveSkill(skill)} type="button">
          {skill} <X aria-hidden="true" size={12} />
        </button>
      ))}
      {activeTypes.map((type) => (
        <button className="active-filter-tag" key={type} onClick={() => onRemoveType(type)} type="button">
          {type} <X aria-hidden="true" size={12} />
        </button>
      ))}
      <button className="clear-filters-button" onClick={onClear} type="button">
        Clear all filters
      </button>
    </div>
  );
}

export default ActiveFilters;
