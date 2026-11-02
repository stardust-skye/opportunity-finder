function SortDropdown({ onChange, value }) {
  return (
    <label className="sort-control">
      <span>Sort by</span>
      <select onChange={(event) => onChange(event.target.value)} value={value}>
        <option value="newest">Newest first</option>
        <option value="deadline-soonest">Deadline: soonest first</option>
        <option value="deadline-latest">Deadline: latest first</option>
      </select>
    </label>
  );
}

export default SortDropdown;
