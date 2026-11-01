import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

function AuthShell({ children, eyebrow, title, description, variant = "student" }) {
  return (
    <section className={`auth-layout auth-layout--${variant}`}>
      <div className="auth-sidebar">
        <Link className="auth-back" to="/">
          <ArrowLeft aria-hidden="true" size={16} /> Back to home
        </Link>
        <div className="auth-editorial">
          <span className="auth-editorial-mark" aria-hidden="true">“</span>
          <p>Research is how tomorrow gets made.</p>
          <span>A place for the people who want to find out.</span>
          <span className="auth-editorial-caption">OPPORTUNITY FINDER · NC STATE</span>
        </div>
        <div aria-hidden="true" className="auth-art">
          <span className="auth-art-orbit auth-art-orbit--one" />
          <span className="auth-art-orbit auth-art-orbit--two" />
          <span className="auth-art-core">OF</span>
        </div>
        <Link className="auth-sidebar-link" to="/opportunities">
          See what’s being explored <ArrowUpRight aria-hidden="true" size={16} />
        </Link>
      </div>
      <div className="auth-panel">
        <div className="auth-panel-inner">
          <div className="auth-heading">
            <span className="section-eyebrow"><span className="eyebrow-line" />{eyebrow}</span>
            <h1>{title}</h1>
            <p>{description}</p>
          </div>
          {children}
        </div>
      </div>
    </section>
  );
}

export default AuthShell;
