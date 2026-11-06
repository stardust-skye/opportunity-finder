import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  BriefcaseBusiness,
  CalendarDays,
  CircleAlert,
  CircleCheck,
  CircleX,
  Clock3,
  ExternalLink,
  Pencil,
  Plus,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Button from "../components/Button.jsx";
import { useOpportunities } from "../context/OpportunityContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";

function ProfessorDashboardPage() {
  const { professorOpportunities, storageError, deleteOpportunity, setOpportunityStatus } =
    useOpportunities();
  const { user, setDemoVerification } = useAuth();
  const isVerified = user.verified;
  const initials = user.name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
  const [pendingDelete, setPendingDelete] = useState(null);
  const [actionError, setActionError] = useState("");
  const location = useLocation();

  const openCount = professorOpportunities.filter((item) => item.status !== "closed").length;
  const closedCount = professorOpportunities.length - openCount;

  function changeStatus(opportunity) {
    if (!isVerified) {
      setActionError("Professor verification is required to manage your listings.");
      return;
    }

    try {
      const updated = setOpportunityStatus(
        opportunity.id,
        opportunity.status === "closed" ? "open" : "closed",
      );
      if (!updated) throw new Error("This opportunity is no longer available to manage.");
      setActionError("");
    } catch (error) {
      setActionError(error.message);
    }
  }

  function confirmDelete() {
    if (!isVerified || !pendingDelete) {
      setActionError("Professor verification is required to manage your listings.");
      return;
    }

    try {
      if (!deleteOpportunity(pendingDelete.id)) {
        throw new Error("This opportunity is no longer available to delete.");
      }
      setPendingDelete(null);
      setActionError("");
    } catch (error) {
      setActionError(error.message);
    }
  }

  function toggleVerification() {
    try {
      setDemoVerification(!isVerified);
      setActionError("");
    } catch (error) {
      setActionError(error.message);
    }
  }

  return (
    <div className="professor-page">
      <header className="professor-hero">
        <div className="content-width professor-hero-inner">
          <div className="professor-welcome">
            <span className="section-eyebrow"><span className="eyebrow-line" />FACULTY WORKSPACE</span>
            <h1>Good to see you,<br /><span>{user.name}.</span></h1>
            <p>Make room for the next curious mind to find your work.</p>
            <div className="professor-profile">
              <span aria-hidden="true" className="professor-profile-avatar">{initials}</span>
              <span>
                <strong>{user.name}</strong>
                <span>{user.email}</span>
              </span>
            </div>
          </div>
          <div aria-label="Opportunity publishing verification" className={`verification-card${isVerified ? " is-verified" : ""}`}>
            <div className="verification-icon">
              {isVerified ? <BadgeCheck aria-hidden="true" size={21} /> : <Clock3 aria-hidden="true" size={20} />}
            </div>
            <span className="verification-label">PUBLISHING ACCESS</span>
            <strong>{isVerified ? "Professor verified" : "Verification needed"}</strong>
            <p>
              {isVerified
                ? "You can publish and manage research opportunities."
                : "Your dashboard is ready. Publishing opens after your professor status is verified."}
            </p>
            {import.meta.env.DEV && <div aria-label="Mock verification preview controls" className="verification-preview">
              <span>DEVELOPMENT TEST ONLY · NOT UNIVERSITY VERIFICATION</span>
              <button onClick={toggleVerification} type="button">
                {isVerified ? "Reset to unverified" : "Preview verified access"}
              </button>
            </div>}
          </div>
        </div>
      </header>

      <div className="professor-content content-width">
        {location.state?.message && (
          <div aria-live="polite" className="professor-success">
            <CircleCheck aria-hidden="true" size={18} />
            {location.state.message}
          </div>
        )}
        {(storageError || actionError) && (
          <div aria-live="assertive" className="professor-alert">
            <CircleAlert aria-hidden="true" size={17} />
            {actionError || storageError}
          </div>
        )}

        <section aria-label="Opportunity statistics" className="professor-stats">
          <article className="professor-stat">
            <span className="professor-stat-icon"><BriefcaseBusiness aria-hidden="true" size={17} /></span>
            <span className="professor-stat-label">TOTAL POSTED</span>
            <strong>{professorOpportunities.length}</strong>
            <span className="professor-stat-note">Your research listings</span>
          </article>
          <article className="professor-stat">
            <span className="professor-stat-icon professor-stat-icon--open"><CircleCheck aria-hidden="true" size={17} /></span>
            <span className="professor-stat-label">ACTIVE</span>
            <strong>{openCount}</strong>
            <span className="professor-stat-note">Open to applicants</span>
          </article>
          <article className="professor-stat">
            <span className="professor-stat-icon professor-stat-icon--closed"><CircleX aria-hidden="true" size={17} /></span>
            <span className="professor-stat-label">CLOSED</span>
            <strong>{closedCount}</strong>
            <span className="professor-stat-note">No longer accepting</span>
          </article>
        </section>

        <section aria-labelledby="manage-heading" className="manage-section">
          <div className="manage-heading-row">
            <div>
              <span className="section-eyebrow"><span className="eyebrow-line" />YOUR RESEARCH</span>
              <h2 id="manage-heading">Manage opportunities</h2>
              <p>Keep your listings current and find the students who are ready to explore.</p>
            </div>
            {isVerified ? (
              <Button to="/professor/opportunities/new">
                <Plus aria-hidden="true" size={17} /> Create opportunity
              </Button>
            ) : (
              <button className="button button--primary manage-create-disabled" disabled type="button">
                <Plus aria-hidden="true" size={17} /> Create opportunity
              </button>
            )}
          </div>

          {!isVerified && (
            <div className="publishing-notice">
              <CircleAlert aria-hidden="true" size={17} />
              <p>
                You can view this dashboard while verification is pending. Publishing and listing management are available after professor status is verified.
              </p>
              <a href="mailto:opportunityfinder@ncsu.edu?subject=Professor%20verification">
                Learn about verification <ArrowUpRight aria-hidden="true" size={15} />
              </a>
            </div>
          )}

          {professorOpportunities.length === 0 ? (
            <div className="manage-empty">
              <span className="manage-empty-icon"><BriefcaseBusiness aria-hidden="true" size={21} /></span>
              <h3>Your next opportunity starts here.</h3>
              <p>
                {isVerified
                  ? "Share a research question and invite NC State students to explore it with you."
                  : "Once your professor status is verified, you can share a research question with students."}
              </p>
              {isVerified ? (
                <Link className="text-link" to="/professor/opportunities/new">
                  Create your first opportunity <ArrowRight aria-hidden="true" size={15} />
                </Link>
              ) : (
                <span className="manage-empty-waiting"><Clock3 aria-hidden="true" size={14} /> Awaiting verification</span>
              )}
            </div>
          ) : (
            <div className="managed-list">
              {professorOpportunities.map((opportunity) => (
                <article className="managed-opportunity" key={opportunity.id}>
                  <div className="managed-opportunity-main">
                    <div className="managed-opportunity-kicker">
                      <span className={`listing-status listing-status--${opportunity.status}`}>
                        <span /> {opportunity.status === "closed" ? "Closed" : "Open"}
                      </span>
                      <span className="managed-category">{opportunity.category}</span>
                    </div>
                    <h3>{opportunity.title}</h3>
                    <p>{opportunity.department}</p>
                    <div className="managed-meta">
                      <span><CalendarDays aria-hidden="true" size={14} /> Deadline {opportunity.deadlineLabel}</span>
                      <span><BriefcaseBusiness aria-hidden="true" size={14} /> {opportunity.type}</span>
                    </div>
                  </div>
                  <div className="managed-actions">
                    {isVerified && (
                      <Link aria-label={`Edit ${opportunity.title}`} className="icon-action" to={`/professor/opportunities/${opportunity.id}/edit`} title="Edit opportunity">
                        <Pencil aria-hidden="true" size={16} /><span>Edit</span>
                      </Link>
                    )}
                    <Link aria-label={`View ${opportunity.title}`} className="icon-action" to={`/opportunities/${opportunity.id}`} title="View public listing">
                      <ExternalLink aria-hidden="true" size={16} /><span>Preview</span>
                    </Link>
                    {isVerified ? (
                      <>
                        <button className="icon-action" onClick={() => changeStatus(opportunity)} type="button">
                          {opportunity.status === "closed"
                            ? <RotateCcw aria-hidden="true" size={16} />
                            : <CircleX aria-hidden="true" size={16} />}
                          <span>{opportunity.status === "closed" ? "Reopen" : "Close"}</span>
                        </button>
                        <button
                          aria-label={`Delete ${opportunity.title}`}
                          className="icon-action icon-action--danger"
                          onClick={() => setPendingDelete(opportunity)}
                          type="button"
                        >
                          <Trash2 aria-hidden="true" size={16} /><span>Delete</span>
                        </button>
                      </>
                    ) : (
                      <span className="manage-empty-waiting">Management requires verification</span>
                    )}
                  </div>
                  {isVerified && pendingDelete?.id === opportunity.id && (
                    <div aria-label={`Confirm deleting ${opportunity.title}`} className="delete-confirmation" role="alertdialog">
                      <span>Delete this opportunity? This can’t be undone.</span>
                      <button className="delete-confirmation-cancel" onClick={() => setPendingDelete(null)} type="button">Keep it</button>
                      <button className="delete-confirmation-accept" onClick={confirmDelete} type="button">Delete opportunity</button>
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
          <p className="managed-disclaimer">
            <span className="status-pulse" />
            Only opportunities published by this demo professor account can be managed here.
          </p>
        </section>
      </div>
    </div>
  );
}

export default ProfessorDashboardPage;
