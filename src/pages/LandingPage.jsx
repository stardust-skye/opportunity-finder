import { ArrowDown, ArrowRight, ArrowUpRight, FlaskConical, Microscope, ScanLine } from "lucide-react";
import { Link } from "react-router-dom";
import Button from "../components/Button.jsx";
import OpportunityCard from "../components/OpportunityCard.jsx";
import { categories, opportunities } from "../data/opportunities.js";

const featuredOpportunities = opportunities.slice(0, 3);

function LandingPage() {
  return (
    <>
      <section className="hero-section">
        <div className="hero-inner content-width">
          <div className="hero-copy">
            <div className="hero-eyebrow">
              <span className="status-pulse" />
              A research community at NC State
            </div>
            <h1>
              Big questions
              <br />
              deserve <span>curious</span>
              <br />
              minds.
            </h1>
            <p className="hero-description">
              The best place to begin your research journey? With the people already asking what’s next.
            </p>
            <div className="hero-actions">
              <Button to="/opportunities">
                Explore opportunities <ArrowRight aria-hidden="true" size={17} />
              </Button>
              <Button to="/register" variant="text">
                Join the community <ArrowUpRight aria-hidden="true" size={16} />
              </Button>
            </div>
            <div className="hero-footnote">
              <div aria-hidden="true" className="avatar-stack">
                <span>MC</span><span>AW</span><span>PN</span><span>+</span>
              </div>
              <p><strong>A community that asks more.</strong><br />For NC State students and professors.</p>
            </div>
          </div>

          <div className="hero-visual" aria-label="Illustration of connected ideas and research">
            <div className="visual-topline">
              <span>FIELD NOTES / 001</span>
              <span>35° 46' 13.8" N</span>
            </div>
            <div className="visual-grid" aria-hidden="true" />
            <div className="orbit orbit--outer" aria-hidden="true" />
            <div className="orbit orbit--middle" aria-hidden="true" />
            <div className="orbit orbit--inner" aria-hidden="true" />
            <div className="orbit-node orbit-node--one" aria-hidden="true"><Microscope size={22} /></div>
            <div className="orbit-node orbit-node--two" aria-hidden="true"><ScanLine size={20} /></div>
            <div className="orbit-node orbit-node--three" aria-hidden="true"><FlaskConical size={20} /></div>
            <div className="hero-orb" aria-hidden="true">
              <div className="hero-orb-light" />
              <span>stay<br />curious</span>
            </div>
            <div className="visual-label visual-label--one">
              <span>01 — NOTICE</span>
              <strong>Ask a better question</strong>
            </div>
            <div className="visual-label visual-label--two">
              <span>FIELD / OPEN</span>
              <strong>Room to explore</strong>
            </div>
            <div className="visual-coordinate" aria-hidden="true">CURIOUS BY NATURE · EST. 2025</div>
          </div>
        </div>
        <a className="scroll-cue" href="#featured">
          <span>Find where to begin</span><ArrowDown aria-hidden="true" size={15} />
        </a>
        <span aria-hidden="true" className="hero-side-note">A LITTLE CURIOSITY GOES A LONG WAY</span>
      </section>

      <section className="featured-section section-pad" id="featured">
        <div className="content-width">
          <div className="section-heading-row">
            <div>
              <span className="section-eyebrow"><span className="eyebrow-line" />A place to start</span>
              <h2>Work worth <span>getting curious about.</span></h2>
            </div>
            <Link className="text-link section-all-link" to="/opportunities">
              All opportunities <ArrowUpRight aria-hidden="true" size={17} />
            </Link>
          </div>
          <div className="opportunity-grid opportunity-grid--featured">
            {featuredOpportunities.map((opportunity) => (
              <OpportunityCard featured key={opportunity.id} opportunity={opportunity} />
            ))}
          </div>
        </div>
      </section>

      <section className="how-section section-pad" id="how-it-works">
        <div className="content-width how-layout">
          <div className="how-intro">
            <span className="section-eyebrow"><span className="eyebrow-line" />A little less guesswork</span>
            <h2>Finding your<br />first step <span>shouldn’t<br />be the hard part.</span></h2>
            <p>Good work starts with a good question. We’ll help you find the people already exploring yours.</p>
            <span className="handwritten-note">the beginning is a big deal <ArrowDown aria-hidden="true" size={17} /></span>
          </div>
          <div className="how-steps">
            <article className="how-step">
              <span className="step-number">01</span>
              <div>
                <span className="step-audience">FOR STUDENTS</span>
                <h3>Find a question that feels like yours.</h3>
                <p>Explore real faculty-led projects by topic, interest, or the skills you’d love to learn.</p>
                <Link to="/opportunities">Explore the open questions <ArrowUpRight aria-hidden="true" size={15} /></Link>
              </div>
              <span aria-hidden="true" className="step-spark">✳</span>
            </article>
            <article className="how-step">
              <span className="step-number">02</span>
              <div>
                <span className="step-audience">FOR RESEARCHERS</span>
                <h3>Meet the students ready to dig in.</h3>
                <p>Introduce your work to a curious campus community and invite the right people to reach out.</p>
                <Link to="/register">Join the community <ArrowUpRight aria-hidden="true" size={15} /></Link>
              </div>
              <span aria-hidden="true" className="step-spark">⌘</span>
            </article>
            <p className="how-disclaimer">University email connects you to our community. Research and publishing permissions are verified separately.</p>
          </div>
        </div>
      </section>

      <section className="areas-section section-pad" id="research-areas">
        <div className="content-width">
          <div className="section-heading-row">
            <div>
              <span className="section-eyebrow"><span className="eyebrow-line" />More ways in</span>
              <h2>Start with what <span>makes you wonder.</span></h2>
            </div>
            <p className="section-aside">Interdisciplinary? Still figuring it out?<br />That’s a great place to start.</p>
          </div>
          <div className="research-areas">
            {categories.map((category, index) => (
              <Link className="research-area" key={category} to="/opportunities">
                <span className="area-number">0{index + 1}</span>
                <span>{category}</span>
                <ArrowUpRight aria-hidden="true" size={18} />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="closing-cta">
        <div className="closing-cta-inner content-width">
          <span className="section-eyebrow"><span className="eyebrow-line" />You don’t need all the answers</span>
          <h2>Just one good<br /><span>question.</span></h2>
          <p>Take a look around. The work—and the people—are waiting.</p>
          <Button to="/opportunities">
            See what’s being explored <ArrowUpRight aria-hidden="true" size={17} />
          </Button>
          <span aria-hidden="true" className="closing-asterisk">✳</span>
        </div>
      </section>
    </>
  );
}

export default LandingPage;
