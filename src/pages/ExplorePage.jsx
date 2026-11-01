import { ArrowUpRight, Compass, SlidersHorizontal, X } from "lucide-react";
import { useMemo, useState } from "react";
import CategoryFilter from "../components/CategoryFilter.jsx";
import OpportunityCard from "../components/OpportunityCard.jsx";
import SearchBar from "../components/SearchBar.jsx";
import { categories, opportunities, skillOptions } from "../data/opportunities.js";

function ExplorePage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("");
  const [activeSkills, setActiveSkills] = useState([]);
  const [skillsOpen, setSkillsOpen] = useState(false);

  const filteredOpportunities = useMemo(() => {
    const normalizedQuery = search.trim().toLowerCase();

    return opportunities.filter((opportunity) => {
      const searchableFields = [
        opportunity.title,
        opportunity.professor,
        opportunity.category,
        opportunity.eyebrow,
        ...opportunity.skills,
      ];
      const matchesSearch =
        !normalizedQuery ||
        searchableFields.some((value) => value.toLowerCase().includes(normalizedQuery));
      const matchesCategory =
        !activeCategory || opportunity.category === activeCategory;
      const matchesSkills = activeSkills.every((skill) =>
        opportunity.skills.includes(skill),
      );

      return matchesSearch && matchesCategory && matchesSkills;
    });
  }, [activeCategory, activeSkills, search]);

  function toggleSkill(skill) {
    setActiveSkills((current) =>
      current.includes(skill)
        ? current.filter((value) => value !== skill)
        : [...current, skill],
    );
  }

  function clearFilters() {
    setSearch("");
    setActiveCategory("");
    setActiveSkills([]);
  }

  const hasFilters = search || activeCategory || activeSkills.length > 0;

  return (
    <div className="explore-page">
      <section className="explore-hero">
        <div className="content-width explore-hero-inner">
          <div className="explore-heading">
            <span className="section-eyebrow"><span className="eyebrow-line" />THE OPEN NOTEBOOK</span>
            <h1>Research that<br /><span>starts with a why.</span></h1>
            <p>Real questions. Real researchers. Plenty of room to learn as you go.</p>
          </div>
          <div aria-hidden="true" className="explore-illustration">
            <span className="explore-illustration-ring explore-illustration-ring--outer" />
            <span className="explore-illustration-ring explore-illustration-ring--inner" />
            <Compass className="explore-compass" size={70} strokeWidth={1.1} />
            <span className="explore-cross explore-cross--one">+</span>
            <span className="explore-cross explore-cross--two">·</span>
            <span className="explore-illustration-label">KEEP LOOKING<br />CLOSER</span>
          </div>
        </div>
        <div className="explore-ribbon">
          <div className="content-width explore-ribbon-inner">
            <span><span className="status-pulse" /> OPEN TO NC STATE STUDENTS</span>
            <span>YOUR NEXT BIG QUESTION STARTS SOMEWHERE.</span>
            <span>OPEN TO NC STATE STUDENTS <ArrowUpRight aria-hidden="true" size={15} /></span>
          </div>
        </div>
      </section>

      <section aria-label="Browse research opportunities" className="explore-results content-width">
        <div className="browse-toolbar">
          <SearchBar onChange={setSearch} value={search} />
          <button
            aria-expanded={skillsOpen}
            aria-controls="skills-filters"
            className={`skills-toggle${activeSkills.length ? " has-selection" : ""}`}
            onClick={() => setSkillsOpen(!skillsOpen)}
            type="button"
          >
            <SlidersHorizontal aria-hidden="true" size={17} />
            Skills
            {activeSkills.length > 0 && <span className="selection-count">{activeSkills.length}</span>}
          </button>
        </div>
        <div className="filter-section">
          <span className="filter-label">RESEARCH AREAS</span>
          <CategoryFilter
            activeCategory={activeCategory}
            categories={categories}
            onSelect={setActiveCategory}
          />
        </div>
        {skillsOpen && (
          <div className="skills-panel" id="skills-filters">
            <div>
              <strong>Skills to explore</strong>
              <span>Choose one or more. We’ll find projects that match every pick.</span>
            </div>
            <div aria-label="Filter by skills" className="skill-filters">
              {skillOptions.map((skill) => (
                <button
                  aria-pressed={activeSkills.includes(skill)}
                  className={`filter-chip${activeSkills.includes(skill) ? " is-active" : ""}`}
                  key={skill}
                  onClick={() => toggleSkill(skill)}
                  type="button"
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="results-heading">
          <div>
            <span className="section-eyebrow"><span className="eyebrow-line" />A FEW OPEN DOORS</span>
            <h2>Room to <span>figure it out.</span></h2>
          </div>
          <span className="results-count">
            {filteredOpportunities.length} {filteredOpportunities.length === 1 ? "opportunity" : "opportunities"}
          </span>
        </div>
        {hasFilters && (
          <div className="active-filters">
            <span>Showing matches for your curiosity</span>
            {search && <span className="active-filter-tag">“{search}”</span>}
            {activeCategory && <span className="active-filter-tag">{activeCategory}</span>}
            {activeSkills.map((skill) => <span className="active-filter-tag" key={skill}>{skill}</span>)}
            <button onClick={clearFilters} type="button">Clear all <X aria-hidden="true" size={14} /></button>
          </div>
        )}
        {filteredOpportunities.length > 0 ? (
          <div className="opportunity-grid">
            {filteredOpportunities.map((opportunity) => (
              <OpportunityCard key={opportunity.id} opportunity={opportunity} />
            ))}
          </div>
        ) : (
          <div className="empty-results">
            <span aria-hidden="true" className="empty-results-mark">?</span>
            <h3>No projects in this corner. Yet.</h3>
            <p>Try a different search or open up your filters. Sometimes the unexpected is where it gets good.</p>
            <button className="text-link" onClick={clearFilters} type="button">
              Start fresh <ArrowUpRight aria-hidden="true" size={16} />
            </button>
          </div>
        )}
        <p className="explore-footnote">
          <span className="status-pulse" />
          Listings are provided by research teams. Faculty publishing access is verified separately.
        </p>
      </section>
    </div>
  );
}

export default ExplorePage;
