import { ArrowUpRight, Menu, X } from "lucide-react";
import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import Button from "./Button.jsx";
import ThemeToggle from "./ThemeToggle.jsx";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <header className="site-header">
      <div className="nav-container">
        <Link aria-label="Opportunity Finder home" className="brand" onClick={closeMenu} to="/">
          <span aria-hidden="true" className="brand-mark">
            <span />
            <span />
            <span />
          </span>
          <span className="brand-name">
            opportunity<span>finder</span>
          </span>
        </Link>

        <button
          aria-expanded={menuOpen}
          aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          className="menu-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          type="button"
        >
          {menuOpen ? <X size={21} /> : <Menu size={21} />}
        </button>

        <nav aria-label="Main navigation" className={`main-nav${menuOpen ? " is-open" : ""}`}>
          <div className="nav-links">
            <NavLink end onClick={closeMenu} to="/">
              Home
            </NavLink>
            <NavLink onClick={closeMenu} to="/opportunities">
              Explore
            </NavLink>
            <NavLink onClick={closeMenu} to="/professor/dashboard">
              For professors
            </NavLink>
            <a href="/#how-it-works" onClick={closeMenu}>
              About
            </a>
          </div>
          <div className="nav-actions">
            <ThemeToggle />
            <Link className="nav-login" onClick={closeMenu} to="/login">
              Log in
            </Link>
            <Button className="nav-cta" onClick={closeMenu} size="small" to="/register">
              Join the community <ArrowUpRight aria-hidden="true" size={15} />
            </Button>
          </div>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
