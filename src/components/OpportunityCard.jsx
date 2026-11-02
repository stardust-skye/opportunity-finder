import { ArrowUpRight, CalendarDays, Clock3, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

function OpportunityCard({ opportunity, featured = false }) {
  const cardClass = `opportunity-card${featured ? " opportunity-card--featured" : ""}`;

  return (
    <article className={cardClass}>
      <div className={`card-art card-art--${opportunity.color}`} aria-hidden="true">
        <span className="art-orbit art-orbit--one" />
        <span className="art-orbit art-orbit--two" />
        <span className="art-center">{opportunity.initials}</span>
        <span className="art-spark art-spark--one" />
        <span className="art-spark art-spark--two" />
      </div>
      <div className="opportunity-card-body">
        <div className="card-kicker">
          <span className="category-badge">{opportunity.category}</span>
          <span className="card-dot" aria-hidden="true" />
          <span>{opportunity.eyebrow}</span>
        </div>
        <span className="card-opportunity-type">{opportunity.type}</span>
        <h3>{opportunity.title}</h3>
        <p className="card-description">{opportunity.description}</p>
        <div className="professor-row">
          <span aria-hidden="true" className={`professor-avatar professor-avatar--${opportunity.color}`}>
            {opportunity.initials}
          </span>
          <span>
            <strong>{opportunity.professor}</strong>
            <span className="professor-role">{opportunity.role}</span>
          </span>
        </div>
        <div className="card-meta">
          <span><MapPin aria-hidden="true" size={15} />{opportunity.location}</span>
          <span><Clock3 aria-hidden="true" size={15} />{opportunity.commitment}</span>
        </div>
        <div className="card-skills">
          {opportunity.skills.map((skill) => (
            <span className="skill-tag" key={skill}>{skill}</span>
          ))}
        </div>
        <div className="card-bottom">
          <div className="deadline">
            <CalendarDays aria-hidden="true" size={16} />
            <span>Apply by <strong>{opportunity.deadlineLabel}</strong></span>
          </div>
          <Link className="card-link" to={`/opportunities/${opportunity.id}`}>
            View details <ArrowUpRight aria-hidden="true" size={16} />
          </Link>
        </div>
      </div>
    </article>
  );
}

export default OpportunityCard;
