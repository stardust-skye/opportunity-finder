import { ArrowLeft, ArrowRight, Plus } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Button from "../components/Button.jsx";
import { useOpportunities } from "../context/OpportunityContext.jsx";
import { useProfessorVerification } from "../context/ProfessorVerificationContext.jsx";
import { mockProfessor } from "../data/mockProfessor.js";
import {
  OpportunityApplicationFields,
  OpportunityOverviewFields,
  OpportunityResearchFields,
} from "../components/OpportunityFormSections.jsx";

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

function toLines(value) {
  return value.split("\n").map((line) => line.trim()).filter(Boolean);
}

function getInitialForm(opportunity) {
  if (!opportunity) {
    return {
      title: "",
      description: "",
      category: "",
      department: "",
      type: "",
      skills: [],
      skillInput: "",
      qualifications: "",
      responsibilities: "",
      deadline: "",
      applicationUrl: "",
      contactEmail: mockProfessor.email,
    };
  }

  return {
    title: opportunity.title,
    description: opportunity.description,
    category: opportunity.category,
    department: opportunity.department,
    type: opportunity.type,
    skills: [...opportunity.skills],
    skillInput: "",
    qualifications: opportunity.qualifications.join("\n"),
    responsibilities: opportunity.responsibilities.join("\n"),
    deadline: opportunity.deadline,
    applicationUrl: opportunity.applicationUrl || "",
    contactEmail: opportunity.contactEmail || mockProfessor.email,
  };
}

function OpportunityFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { professorOpportunities, createOpportunity, updateOpportunity } = useOpportunities();
  const { isVerified } = useProfessorVerification();
  const existingOpportunity = id
    ? professorOpportunities.find((opportunity) => opportunity.id === id)
    : null;
  const [form, setForm] = useState(() => getInitialForm(existingOpportunity));
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const isEditing = Boolean(id);

  function updateField(name, value) {
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => {
      if (!current[name]) {
        return current;
      }
      const next = { ...current };
      delete next[name];
      return next;
    });
  }

  function addSkill(event) {
    if (event.key !== "Enter" && event.key !== ",") {
      return;
    }
    event.preventDefault();
    const skill = form.skillInput.trim().replace(/,$/, "");
    if (skill && !form.skills.some((item) => item.toLowerCase() === skill.toLowerCase())) {
      updateField("skills", [...form.skills, skill]);
    }
    updateField("skillInput", "");
  }

  function removeSkill(skill) {
    updateField("skills", form.skills.filter((item) => item !== skill));
  }

  function validate() {
    const nextErrors = {};
    const requiredFields = [
      ["title", "Enter an opportunity title."],
      ["description", "Add a description of the research opportunity."],
      ["category", "Choose a research category."],
      ["department", "Enter a department or research lab."],
      ["type", "Choose an opportunity type."],
      ["qualifications", "Describe the qualifications students need."],
      ["responsibilities", "Describe the responsibilities for this opportunity."],
      ["deadline", "Choose an application deadline."],
      ["contactEmail", "Enter a contact email address."],
    ];

    requiredFields.forEach(([field, message]) => {
      if (!form[field].trim()) {
        nextErrors[field] = message;
      }
    });
    if (form.skills.length === 0) {
      nextErrors.skills = "Add at least one required skill.";
    }
    if (form.deadline && form.deadline < getToday()) {
      nextErrors.deadline = "Choose today or a future application deadline.";
    }
    if (
      form.contactEmail &&
      !/^[^\s@]+@ncsu\.edu$/i.test(form.contactEmail.trim())
    ) {
      nextErrors.contactEmail = "Use an NC State contact email ending in @ncsu.edu.";
    }
    if (form.applicationUrl) {
      try {
        const url = new URL(form.applicationUrl);
        if (url.protocol !== "https:" && url.protocol !== "http:") {
          nextErrors.applicationUrl = "Use a secure web link that starts with https://.";
        }
      } catch {
        nextErrors.applicationUrl = "Enter a valid application URL, or leave this optional field blank.";
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleSubmit(event) {
    event.preventDefault();
    setSubmitError("");
    if (!isVerified) {
      setSubmitError("Professor verification is required before publishing.");
      return;
    }
    if (!validate()) {
      document.querySelector("[aria-invalid='true']")?.focus();
      return;
    }

    const deadlineDate = new Date(`${form.deadline}T12:00:00`);
    const opportunity = {
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category,
      department: form.department.trim(),
      eyebrow: form.department.split("·")[0].trim() || form.department.trim(),
      type: form.type,
      skills: form.skills,
      qualifications: toLines(form.qualifications),
      responsibilities: toLines(form.responsibilities),
      objectives: [],
      deadline: form.deadline,
      deadlineLabel: new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(deadlineDate),
      applicationUrl: form.applicationUrl.trim(),
      contactEmail: form.contactEmail.trim(),
      applicationHref:
        form.applicationUrl.trim() ||
        `mailto:${encodeURIComponent(form.contactEmail.trim())}?subject=${encodeURIComponent(form.title.trim())}`,
      applicationInstructions: form.applicationUrl.trim()
        ? `Use the application link, or contact ${form.contactEmail.trim()} with questions.`
        : `Email ${form.contactEmail.trim()} to ask about applying.`,
      professor: mockProfessor.name,
      role: mockProfessor.role,
      initials: mockProfessor.initials,
      color: "coral",
      location: "NC State · Raleigh, NC",
      commitment: "Flexible schedule",
      status: existingOpportunity?.status || "open",
    };

    try {
      if (isEditing) {
        const updated = updateOpportunity(id, opportunity);
        if (!updated) {
          setSubmitError("This opportunity is no longer available to edit.");
          return;
        }
      } else {
        createOpportunity(opportunity);
      }
      navigate("/professor/dashboard", {
        state: {
          message: isEditing
            ? "Your opportunity has been updated."
            : "Your opportunity has been published and is now open to students.",
        },
      });
    } catch (error) {
      setSubmitError(error.message || "Your opportunity could not be saved.");
    }
  }

  if (isEditing && !existingOpportunity) {
    return (
      <section className="professor-form-page content-width">
        <span className="section-eyebrow"><span className="eyebrow-line" />LISTING NOT FOUND</span>
        <h1>This opportunity isn’t available to edit.</h1>
        <Button to="/professor/dashboard"><ArrowLeft aria-hidden="true" size={16} /> Back to dashboard</Button>
      </section>
    );
  }

  return (
    <div className="professor-form-page content-width">
      <Link className="professor-back-link" to="/professor/dashboard">
        <ArrowLeft aria-hidden="true" size={15} /> Professor dashboard
      </Link>
      <header className="professor-form-heading">
        <span className="section-eyebrow"><span className="eyebrow-line" />{isEditing ? "REFINE YOUR LISTING" : "INVITE SOMEONE INTO THE WORK"}</span>
        <h1>
          {isEditing ? (
            "Edit opportunity."
          ) : (
            <>Share a question<br /><span>worth exploring.</span></>
          )}
        </h1>
        <p>Give students a clear sense of the research, the people, and the next step.</p>
      </header>

      {!isVerified && (
        <div className="publishing-notice publishing-notice--form">
          <span>Professor verification is required before you can publish or edit opportunities.</span>
          <Link to="/professor/dashboard">Review verification status <ArrowRight aria-hidden="true" size={14} /></Link>
        </div>
      )}
      {submitError && <p aria-live="assertive" className="form-status professor-submit-error">{submitError}</p>}

      <form className="opportunity-form" noValidate onSubmit={handleSubmit}>
        <OpportunityOverviewFields errors={errors} form={form} onChange={updateField} />
        <OpportunityResearchFields
          addSkill={addSkill}
          errors={errors}
          form={form}
          onChange={updateField}
          removeSkill={removeSkill}
        />
        <OpportunityApplicationFields
          errors={errors}
          form={form}
          getToday={getToday}
          onChange={updateField}
        />

        <div className="professor-form-actions">
          <Button to="/professor/dashboard" variant="secondary">Cancel</Button>
          {isVerified ? (
            <Button type="submit">
              {isEditing ? "Save changes" : "Publish opportunity"} <ArrowRight aria-hidden="true" size={16} />
            </Button>
          ) : (
            <button className="button button--primary" disabled type="button">
              <Plus aria-hidden="true" size={16} /> Verification required
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default OpportunityFormPage;
