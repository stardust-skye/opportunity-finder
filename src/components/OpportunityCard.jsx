import { ArrowUpRight, CircleDollarSign, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { formatHourlyPay } from "../utils/formatHourlyPay.js";

function OpportunityCard({ opportunity, featured = false }) {
  return (
    <article className={`opportunity-card${featured ? " opportunity-card--featured" : ""}`}>
      <Link className="opportunity-card-link" to={`/opportunities/${opportunity.id}`}>
        <div className={`card-art card-art--${opportunity.color}`} aria-hidden="true">
          <span className="art-orbit art-orbit--one" />
          <span className="art-orbit art-orbit--two" />
          <span className="art-center">{opportunity.initials}</span>
          <span className="art-spark art-spark--one" />
          <span className="art-spark art-spark--two" />
        </div>
        <div className="opportunity-card-body">
          <div className="opportunity-card-heading">
            <h3>{opportunity.title}</h3>
            <ArrowUpRight aria-hidden="true" size={20} />
          </div>
          <div className="professor-row">
            <span aria-hidden="true" className={`professor-avatar professor-avatar--${opportunity.color}`}>
              {opportunity.initials}
            </span>
            <strong>{opportunity.professor}</strong>
          </div>
          <div className="opportunity-card-meta">
            <span><MapPin aria-hidden="true" size={17} />{opportunity.location}</span>
            <span><CircleDollarSign aria-hidden="true" size={17} />{formatHourlyPay(opportunity.hourlyPayCents)}</span>
          </div>
        </div>
      </Link>
    </article>
  );
}

export default OpportunityCard;
