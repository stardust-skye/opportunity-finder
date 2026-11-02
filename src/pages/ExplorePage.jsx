import { ArrowUpRight, Compass, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import ActiveFilters from "../components/ActiveFilters.jsx";
import CategoryFilter from "../components/CategoryFilter.jsx";
import EmptyState from "../components/EmptyState.jsx";
import OpportunityCard from "../components/OpportunityCard.jsx";
import OpportunityTypeFilter from "../components/OpportunityTypeFilter.jsx";
import SearchBar from "../components/SearchBar.jsx";
import SkillsFilter from "../components/SkillsFilter.jsx";
import SortDropdown from "../components/SortDropdown.jsx";
import {
  categories,
  opportunities,
  opportunityTypes,
  skillOptions,
} from "../data/opportunities.js";

function toggleValue(values, value) {
  return values.includes(value)
    ? values.filter((current) => current !== value)
    : [...values, value];
}

function ExplorePage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("");
  const [activeSkills, setActiveSkills] = useState([]);
  const [activeTypes, setActiveTypes] = useState([]);
  const [skillsOpen, setSkillsOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState("newest");

  const filteredOpportunities = useMemo(() => {
    const normalizedQuery = search.trim().toLowerCase();
    const filtered = opportunities.filter((opportunity) => {
      const searchableFields = [
        opportunity.title,
        opportunity.description,
        opportunity.professor,
        opportunity.department,
        opportunity.category,
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
      const matchesType =
        activeTypes.length === 0 || activeTypes.includes(opportunity.type);

      return matchesSearch && matchesCategory && matchesSkills && matchesType;
    });

    return filtered.sort((first, second) => {
      if (sortOrder === "deadline-soonest") {
        return first.deadline.localeCompare(second.deadline);
      }
      if (sortOrder === "deadline-latest") {
        return second.deadline.localeCompare(first.deadline);
      }
      return second.postedAt.localeCompare(first.postedAt);
    });
  }, [activeCategory, activeSkills, activeTypes, search, sortOrder]);

  function clearFilters() {
    setSearch("");
    setActiveCategory("");
    setActiveSkills([]);
    setActiveTypes([]);
  }

  return (
    <div className="explore-page">
      <section className="explore-hero">
        <div className="content-width explore-hero-inner">
          <div className="explore-heading">
            <span className="section-eyebrow"><span className="eyebrow-line" />THE OPEN NOTEBOOK</span>
            <h1>Research that<br /><span>starts with a why.</span></h1>
            <p>Find a question worth asking, a professor to learn from, and room to grow.</p>
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
            <span>FACULTY-LED RESEARCH <ArrowUpRight aria-hidden="true" size={15} /></span>
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
          <span className="filter-label">RESEARCH CATEGORIES</span>
          <CategoryFilter
            activeCategory={activeCategory}
            categories={categories}
            onSelect={setActiveCategory}
          />
        </div>
        {skillsOpen && (
          <div className="skills-panel" id="skills-filters">
            <div>
              <strong>Required skills</strong>
              <span>Choose multiple skills to find opportunities that match all of them.</span>
            </div>
            <SkillsFilter
              activeSkills={activeSkills}
              onToggle={(skill) => setActiveSkills((current) => toggleValue(current, skill))}
              skills={skillOptions}
            />
          </div>
        )}
        <div className="type-filter-section">
          <span className="filter-label">OPPORTUNITY TYPE</span>
          <OpportunityTypeFilter
            activeTypes={activeTypes}
            onToggle={(type) => setActiveTypes((current) => toggleValue(current, type))}
            types={opportunityTypes}
          />
        </div>
        <div className="results-heading">
          <div>
            <span className="section-eyebrow"><span className="eyebrow-line" />A FEW OPEN DOORS</span>
            <h2>Room to <span>figure it out.</span></h2>
          </div>
          <div className="results-controls">
            <span aria-live="polite" className="results-count">
              {filteredOpportunities.length} {filteredOpportunities.length === 1 ? "opportunity" : "opportunities"}
            </span>
            <SortDropdown onChange={setSortOrder} value={sortOrder} />
          </div>
        </div>
        <ActiveFilters
          activeCategory={activeCategory}
          activeSkills={activeSkills}
          activeTypes={activeTypes}
          onClear={clearFilters}
          onRemoveCategory={() => setActiveCategory("")}
          onRemoveSearch={() => setSearch("")}
          onRemoveSkill={(skill) => setActiveSkills((current) => current.filter((value) => value !== skill))}
          onRemoveType={(type) => setActiveTypes((current) => current.filter((value) => value !== type))}
          search={search}
        />
        {filteredOpportunities.length > 0 ? (
          <div className="opportunity-grid">
            {filteredOpportunities.map((opportunity) => (
              <OpportunityCard key={opportunity.id} opportunity={opportunity} />
            ))}
          </div>
        ) : (
          <EmptyState onClear={clearFilters} />
        )}
        <p className="explore-footnote">
          <span className="status-pulse" />
          Listings are provided by research teams. Professor publishing access is verified separately.
        </p>
      </section>
    </div>
  );
}

export default ExplorePage;
