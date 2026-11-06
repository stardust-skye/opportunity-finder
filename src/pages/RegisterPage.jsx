import { ArrowRight, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthShell from "../components/AuthShell.jsx";
import Button from "../components/Button.jsx";
import FormField from "../components/FormField.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const accountTypes = ["Student", "Professor"];

function RegisterPage() {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    if (formData.get("password") !== formData.get("confirmPassword")) {
      setMessage("Those passwords don’t match yet. Give them another look.");
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      await register({
        name: formData.get("fullName"),
        email: formData.get("email"),
        password: formData.get("password"),
        role: formData.get("accountType"),
      });
      navigate("/login", { state: { message: "Demo account created. Please sign in." } });
    } catch (error) {
      console.error("Demo registration failed.", error);
      setMessage(error.message || "Account creation failed. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell
      description="One thoughtful question can take you somewhere new."
      eyebrow="STEP INTO THE WORK"
      title="Curiosity looks good on you."
      variant="register"
    >
      <form className="auth-form registration-form" onSubmit={handleSubmit}>
        <FormField
          autoComplete="name"
          id="full-name"
          label="Your name"
          name="fullName"
          placeholder="First and last name"
          required
        />
        <FormField
          autoComplete="email"
          id="register-email"
          hint="Both students and professors must register with an @ncsu.edu address."
          label="NC State email"
          name="email"
          placeholder="you@ncsu.edu"
          required
          title="Please use your @ncsu.edu email address."
          type="email"
        />
        <div className="auth-form-row">
          <FormField
            autoComplete="new-password"
            id="register-password"
            label="Password"
            name="password"
            minLength="8"
            placeholder="At least 8 characters"
            required
            type={passwordVisible ? "text" : "password"}
          />
          <FormField
            autoComplete="new-password"
            id="confirm-password"
            label="Confirm password"
            name="confirmPassword"
            minLength="8"
            placeholder="Enter it again"
            required
            type={passwordVisible ? "text" : "password"}
          />
        </div>
        <button
          aria-pressed={passwordVisible}
          className="show-password-link"
          onClick={() => setPasswordVisible(!passwordVisible)}
          type="button"
        >
          {passwordVisible ? <EyeOff size={15} /> : <Eye size={15} />}
          {passwordVisible ? "Hide passwords" : "Show passwords"}
        </button>
        <fieldset className="account-type-field">
          <legend>How do you see yourself here?</legend>
          <div className="account-type-options">
            {accountTypes.map((type) => (
              <label className="account-type-option" key={type}>
                <input defaultChecked={type === "Student"} name="accountType" type="radio" value={type} />
                <span>{type}</span>
              </label>
            ))}
          </div>
          <span className="field-hint">
            Students can discover opportunities. Professor publishing access will require separate verification.
          </span>
        </fieldset>
        <label className="terms-field">
          <input name="termsAccepted" required type="checkbox" />
          <span>
            I agree to the community guidelines and understand this is a preview. You must be 13 or older.
          </span>
        </label>
        <Button className="auth-submit" disabled={busy} type="submit">
          Create your account <ArrowRight aria-hidden="true" size={17} />
        </Button>
        {message && <p aria-live="polite" className="form-status">{message}</p>}
      </form>
      <p className="auth-switch auth-switch--register">
        Already part of the community? <Link to="/login">Log in</Link>
      </p>
      <p className="auth-note">
        <ShieldCheck aria-hidden="true" size={15} />
        Demo only: accounts are local to this browser, and email does not verify affiliation or professor status.
      </p>
    </AuthShell>
  );
}

export default RegisterPage;
