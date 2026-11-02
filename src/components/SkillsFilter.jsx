function SkillsFilter({ activeSkills, onToggle, skills }) {
  return (
    <div aria-label="Filter by required skills" className="skill-filters" role="group">
      {skills.map((skill) => (
        <button
          aria-pressed={activeSkills.includes(skill)}
          className={`filter-chip${activeSkills.includes(skill) ? " is-active" : ""}`}
          key={skill}
          onClick={() => onToggle(skill)}
          type="button"
        >
          {skill}
        </button>
      ))}
    </div>
  );
}

export default SkillsFilter;
