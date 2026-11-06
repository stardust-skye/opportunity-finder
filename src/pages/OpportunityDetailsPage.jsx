import { ArrowLeft, ArrowUpRight, CalendarDays, Clock3, MapPin } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import Button from "../components/Button.jsx";
import { useOpportunities } from "../context/OpportunityContext.jsx";

function OpportunityDetailsPage() {
  const { id } = useParams();
  const { opportunities } = useOpportunities();
  const opportunity = opportunities.find((item) => item.id === id);

  if (!opportunity) {
    return (
      <section className="opportunity-not-found content-width">
        <span className="section-eyebrow"><span className="eyebrow-line" />OPPORTUNITY NOT FOUND</span>
        <h1>This opportunity may have moved.</h1>
        <p>Browse current openings to find another question worth exploring.</p>
        <Button to="/opportunities">
          <ArrowLeft aria-hidden="true" size={16} /> Back to opportunities
        </Button>
      </section>
    );
  }

  const isEmailLink = opportunity.applicationHref.startsWith("mailto:");

  return (
    <article className="opportunity-details-page">
      <header className="details-hero">
        <div className="content-width details-hero-inner">
          <Link className="details-back-link" to="/opportunities">
            <ArrowLeft aria-hidden="true" size={15} /> All opportunities
          </Link>
          <div className="details-category-row">
            <span className="category-badge">{opportunity.category}</span>
            <span className="details-type">{opportunity.type}</span>
          </div>
          <h1>{opportunity.title}</h1>
          <div className="details-professor">
            <span aria-hidden="true" className={`professor-avatar professor-avatar--${opportunity.color}`}>
              {opportunity.initials}
            </span>
            <span>
              <strong>{opportunity.professor}</strong>
              <span>{opportunity.role}</span>
            </span>
          </div>
          <div className="details-meta">
            <span><MapPin aria-hidden="true" size={16} />{opportunity.location}</span>
            <span><Clock3 aria-hidden="true" size={16} />{opportunity.commitment}</span>
            <span><CalendarDays aria-hidden="true" size={16} />Apply by {opportunity.deadlineLabel}</span>
          </div>
        </div>
      </header>

      <div className="content-width details-layout">
        <div className="details-content">
          <section className="details-section">
            <span className="section-eyebrow"><span className="eyebrow-line" />ABOUT THE OPPORTUNITY</span>
            <h2>Explore the question.</h2>
            <p>{opportunity.description}</p>
            <p className="details-department">{opportunity.department}</p>
          </section>
          {opportunity.objectives?.length > 0 && (
            <section className="details-section">
              <h2>Research objectives</h2>
              <ul>{opportunity.objectives.map((objective) => <li key={objective}>{objective}</li>)}</ul>
            </section>
          )}
          <section className="details-section">
            <h2>What you’ll do</h2>
            <ul>{opportunity.responsibilities.map((responsibility) => <li key={responsibility}>{responsibility}</li>)}</ul>
          </section>
          <section className="details-section">
            <h2>Required qualifications</h2>
            <ul>{opportunity.qualifications.map((qualification) => <li key={qualification}>{qualification}</li>)}</ul>
          </section>
        </div>

        <aside aria-label="Application information" className="details-sidebar">
          <div className="details-apply-card">
            <span className="section-eyebrow"><span className="eyebrow-line" />TAKE THE NEXT STEP</span>
            <h2>Interested in this work?</h2>
            <p>{opportunity.applicationInstructions}</p>
            {opportunity.status === "closed" ? (
              <p className="details-closed-note">This opportunity is closed and is no longer accepting applications.</p>
            ) : (
              <>
                <Button
                  className="details-apply-button"
                  href={opportunity.applicationHref}
                  rel={isEmailLink ? undefined : "noopener noreferrer"}
                  target={isEmailLink ? undefined : "_blank"}
                >
                  Apply now <ArrowUpRight aria-hidden="true" size={17} />
                </Button>
                <p className="details-contact-note">
                  Opens {isEmailLink ? "an email to the professor" : "the application page"}.
                </p>
              </>
            )}
            {opportunity.contactEmail && (
              <p className="details-contact-note">Questions? <a href={`mailto:${opportunity.contactEmail}`}>{opportunity.contactEmail}</a></p>
            )}
          </div>
          <div className="details-skills">
            <h2>Required skills</h2>
            <div className="card-skills">
              {opportunity.skills.map((skill) => <span className="skill-tag" key={skill}>{skill}</span>)}
            </div>
          </div>
        </aside>
      </div>
    </article>
  );
}

export default OpportunityDetailsPage;
