import { ArrowUpRight, Menu, X } from "lucide-react";
import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import Button from "./Button.jsx";
import ThemeToggle from "./ThemeToggle.jsx";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [logoutError, setLogoutError] = useState("");
  const { user, loading, logout, authError, restore } = useAuth();
  const navigate = useNavigate();

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
            {user?.role === "PROFESSOR" && <NavLink onClick={closeMenu} to="/professor/dashboard">
              For professors
            </NavLink>}
          </div>
          <div className="nav-actions">
            <ThemeToggle />
            {loading ? <span className="nav-account" role="status">Checking session...</span> : user ? <>
              <span className="nav-account">{user.role === "PROFESSOR" ? "Professor" : "Student"}: {user.fullName}</span>
              <button className="nav-login nav-logout" onClick={async () => {
                try {
                  await logout();
                  setLogoutError("");
                  closeMenu();
                  navigate("/");
                } catch (error) {
                  setLogoutError(error.message);
                }
              }} type="button">Logout</button>
            </> : <>
            <Link className="nav-login" onClick={closeMenu} to="/login">
              Log in
            </Link>
            <Button className="nav-cta" onClick={closeMenu} size="small" to="/register">
              Sign up <ArrowUpRight aria-hidden="true" size={15} />
            </Button>
            </>}
            {(authError || logoutError) && <span role="alert" className="nav-account">{authError || logoutError}</span>}
            {authError && <button className="nav-login nav-logout" onClick={restore} type="button">Retry session</button>}
          </div>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
