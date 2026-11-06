import { ArrowRight, Eye, EyeOff, LockKeyhole } from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthShell from "../components/AuthShell.jsx";
import Button from "../components/Button.jsx";
import FormField from "../components/FormField.jsx";
import { useAuth } from "../context/AuthContext.jsx";

function LoginPage() {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const { login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setBusy(true);
    setMessage("");
    try {
      const user = await login(formData.get("email"), formData.get("password"));
      const destination = user.role === "Professor"
        ? location.state?.from || "/professor/dashboard"
        : "/opportunities";
      navigate(destination, { replace: true });
    } catch (error) {
      console.error("Demo sign-in failed.", error);
      setMessage(error.message || "Sign-in failed. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell
      description="Log in to pick up where your curiosity left off."
      eyebrow="WELCOME BACK"
      title="Good to have you back."
      variant="login"
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        <FormField
          autoComplete="email"
          hint="Sign in with the @ncsu.edu address you used to register."
          id="email"
          label="NC State email"
          name="email"
          placeholder="you@ncsu.edu"
          required
          title="Please enter your @ncsu.edu email address."
          type="email"
        />
        <div className="password-label-row">
          <label htmlFor="password">Password</label>
          <a href="mailto:opportunityfinder@ncsu.edu?subject=Password%20help">Forgot password?</a>
        </div>
        <FormField autoComplete="current-password" id="password" label="" name="password" required>
          <div className="password-input-wrap">
            <LockKeyhole aria-hidden="true" size={17} />
            <input
              autoComplete="current-password"
              id="password"
              minLength="8"
              name="password"
              placeholder="Your password"
              required
              type={passwordVisible ? "text" : "password"}
            />
            <button
              aria-label={passwordVisible ? "Hide password" : "Show password"}
              className="password-toggle"
              onClick={() => setPasswordVisible(!passwordVisible)}
              type="button"
            >
              {passwordVisible ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
        </FormField>
        <Button className="auth-submit" disabled={busy} type="submit">
          Sign in <ArrowRight aria-hidden="true" size={17} />
        </Button>
        {message && <p aria-live="polite" className="form-status">{message}</p>}
      </form>
      {location.state?.message && <p className="form-status">{location.state.message}</p>}
      {import.meta.env.DEV && <p className="auth-note">Development demo: student@ncsu.edu or professor@ncsu.edu, password DemoPass123!. These accounts are not production authentication.</p>}
      <div className="auth-divider"><span />NEW TO THE COMMUNITY?<span /></div>
      <p className="auth-switch">
        <Link to="/register">Create an account <ArrowRight aria-hidden="true" size={15} /></Link>
      </p>
      <p className="auth-note">
        <LockKeyhole aria-hidden="true" size={14} />
        Demo only: accounts and sign-in are local to this browser and are not secure authentication.
      </p>
    </AuthShell>
  );
}

export default LoginPage;
