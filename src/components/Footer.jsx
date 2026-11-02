import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-top">
          <div className="footer-brand">
            <Link aria-label="Opportunity Finder home" className="brand" to="/">
              <span aria-hidden="true" className="brand-mark">
                <span />
                <span />
                <span />
              </span>
              <span className="brand-name">
                opportunity<span>finder</span>
              </span>
            </Link>
            <p>A starting point for the work that moves us forward.</p>
            <span className="footer-affiliation">Made for the NC State community</span>
          </div>
          <div className="footer-links">
            <div>
              <span className="footer-heading">Discover</span>
              <Link to="/opportunities">Browse opportunities</Link>
              <a href="/#research-areas">Browse opportunity categories</a>
            </div>
            <div>
              <span className="footer-heading">Get started</span>
              <Link to="/register">Join the community</Link>
              <a href="/#how-it-works">How it works</a>
              <Link to="/login">Log in</Link>
            </div>
          </div>
          <Link className="footer-explore" to="/opportunities">
            Find your next question <ArrowUpRight aria-hidden="true" size={17} />
          </Link>
        </div>
        <div className="footer-bottom">
          <span>Opportunity Finder <span aria-hidden="true">·</span> Built by the Tech Committee at ACM NCSU</span>
          <span>For the curious minds of NC State, Raleigh, NC</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
