import { ArrowRight, Eye, EyeOff, LockKeyhole } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import AuthShell from "../components/AuthShell.jsx";
import Button from "../components/Button.jsx";
import FormField from "../components/FormField.jsx";

function LoginPage() {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [message, setMessage] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    setMessage("Sign-in is coming soon. This preview doesn't send or store your credentials.");
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
          pattern="[^@\s]+@ncsu\.edu"
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
        <Button className="auth-submit" type="submit">
          Sign in <ArrowRight aria-hidden="true" size={17} />
        </Button>
        {message && <p aria-live="polite" className="form-status">{message}</p>}
      </form>
      <div className="auth-divider"><span />NEW TO THE COMMUNITY?<span /></div>
      <p className="auth-switch">
        <Link to="/register">Create an account <ArrowRight aria-hidden="true" size={15} /></Link>
      </p>
      <p className="auth-note">
        <LockKeyhole aria-hidden="true" size={14} />
        NC State email helps us keep this community connected.
      </p>
    </AuthShell>
  );
}

export default LoginPage;
