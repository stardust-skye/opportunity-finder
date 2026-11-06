import { X } from "lucide-react";
import { categories, opportunityTypes } from "../data/opportunities.js";

function FormSection({ number, title, description, children }) {
  return (
    <section className="opportunity-form-section">
      <div className="opportunity-form-section-heading">
        <span>{number}</span>
        <div><h2>{title}</h2><p>{description}</p></div>
      </div>
      <div className="professor-form-grid">{children}</div>
    </section>
  );
}

function Field({ id, label, error, optional = false, wide = false, children, hint }) {
  return (
    <div className={`professor-field${wide ? " professor-field--wide" : ""}`}>
      <label htmlFor={id}>
        {label} {optional ? <span className="field-optional">OPTIONAL</span> : <span>*</span>}
      </label>
      {children}
      {error && <span className="professor-field-error" id={`${id}-error`}>{error}</span>}
      {!error && hint && <span className="professor-field-hint" id={`${id}-hint`}>{hint}</span>}
    </div>
  );
}

export function OpportunityOverviewFields({ errors, form, onChange }) {
  return (
    <FormSection
      description="Start with the question students will be joining."
      number="01"
      title="The big picture"
    >
      <Field error={errors.title} id="opportunity-title" label="Opportunity title" wide>
        <input
          aria-describedby={errors.title ? "opportunity-title-error" : undefined}
          aria-invalid={Boolean(errors.title)}
          id="opportunity-title"
          maxLength={120}
          onChange={(event) => onChange("title", event.target.value)}
          placeholder="What question will students help you explore?"
          value={form.title}
        />
      </Field>
      <Field error={errors.category} id="opportunity-category" label="Research category">
        <select
          aria-describedby={errors.category ? "opportunity-category-error" : undefined}
          aria-invalid={Boolean(errors.category)}
          id="opportunity-category"
          onChange={(event) => onChange("category", event.target.value)}
          value={form.category}
        >
          <option value="">Choose a research area</option>
          {categories.map((category) => <option key={category} value={category}>{category}</option>)}
        </select>
      </Field>
      <Field error={errors.type} id="opportunity-type" label="Opportunity type">
        <select
          aria-describedby={errors.type ? "opportunity-type-error" : undefined}
          aria-invalid={Boolean(errors.type)}
          id="opportunity-type"
          onChange={(event) => onChange("type", event.target.value)}
          value={form.type}
        >
          <option value="">Choose a type</option>
          {opportunityTypes.map((type) => <option key={type} value={type}>{type}</option>)}
        </select>
      </Field>
      <Field error={errors.department} id="opportunity-department" label="Department or research lab" wide>
        <input
          aria-describedby={errors.department ? "opportunity-department-error" : undefined}
          aria-invalid={Boolean(errors.department)}
          id="opportunity-department"
          maxLength={120}
          onChange={(event) => onChange("department", event.target.value)}
          placeholder="e.g. College of Engineering · Human-Centered Computing"
          value={form.department}
        />
      </Field>
      <Field error={errors.location} id="opportunity-location" label="Location" optional>
        <input
          aria-describedby={errors.location ? "opportunity-location-error" : undefined}
          aria-invalid={Boolean(errors.location)}
          id="opportunity-location"
          maxLength={120}
          onChange={(event) => onChange("location", event.target.value)}
          placeholder="e.g. Raleigh, NC or remote"
          value={form.location}
        />
      </Field>
      <Field error={errors.hourlyPay} id="opportunity-hourly-pay" label="Pay per hour (USD)" optional hint="Leave blank if unspecified; enter 0 for unpaid.">
        <input
          aria-describedby={errors.hourlyPay ? "opportunity-hourly-pay-error" : "opportunity-hourly-pay-hint"}
          aria-invalid={Boolean(errors.hourlyPay)}
          id="opportunity-hourly-pay"
          inputMode="decimal"
          onChange={(event) => onChange("hourlyPay", event.target.value)}
          placeholder="e.g. 20.00"
          value={form.hourlyPay}
        />
      </Field>
      <Field error={errors.description} id="opportunity-description" label="Description" wide>
        <textarea
          aria-describedby={errors.description ? "opportunity-description-error" : undefined}
          aria-invalid={Boolean(errors.description)}
          id="opportunity-description"
          maxLength={1500}
          onChange={(event) => onChange("description", event.target.value)}
          placeholder="What is the research about, and why does the question matter?"
          rows={5}
          value={form.description}
        />
        <div className="professor-field-footer">
          {!errors.description && <span>Help students imagine what they’ll be part of.</span>}
          <span>{form.description.length}/1500</span>
        </div>
      </Field>
    </FormSection>
  );
}

export function OpportunityResearchFields({
  addSkill,
  errors,
  form,
  onChange,
  removeSkill,
}) {
  return (
    <FormSection
      description="Set expectations and help students picture themselves in the work."
      number="02"
      title="The day-to-day"
    >
      <Field
        error={errors.skills}
        hint="Press Enter or comma after each skill."
        id="opportunity-skills"
        label="Required skills"
        wide
      >
        <div className={`skill-entry${errors.skills ? " has-error" : ""}`}>
          {form.skills.map((skill) => (
            <span className="skill-entry-tag" key={skill}>
              {skill}
              <button
                aria-label={`Remove ${skill}`}
                onClick={() => removeSkill(skill)}
                type="button"
              >
                <X aria-hidden="true" size={13} />
              </button>
            </span>
          ))}
          <input
            aria-describedby={errors.skills ? "opportunity-skills-error" : undefined}
            aria-invalid={Boolean(errors.skills)}
            id="opportunity-skills"
            onChange={(event) => onChange("skillInput", event.target.value)}
            onKeyDown={addSkill}
            placeholder={form.skills.length ? "Add another skill…" : "Type a skill and press Enter"}
            value={form.skillInput}
          />
        </div>
      </Field>
      <Field
        error={errors.qualifications}
        hint="Use a new line for each qualification."
        id="opportunity-qualifications"
        label="Qualifications"
      >
        <textarea
          aria-describedby={errors.qualifications ? "opportunity-qualifications-error" : undefined}
          aria-invalid={Boolean(errors.qualifications)}
          id="opportunity-qualifications"
          onChange={(event) => onChange("qualifications", event.target.value)}
          placeholder={"One qualification per line\nExperience that helps but isn’t required"}
          rows={5}
          value={form.qualifications}
        />
      </Field>
      <Field
        error={errors.responsibilities}
        hint="Use a new line for each responsibility."
        id="opportunity-responsibilities"
        label="Responsibilities"
      >
        <textarea
          aria-describedby={errors.responsibilities ? "opportunity-responsibilities-error" : undefined}
          aria-invalid={Boolean(errors.responsibilities)}
          id="opportunity-responsibilities"
          onChange={(event) => onChange("responsibilities", event.target.value)}
          placeholder={"One responsibility per line\nMeet with the research team each week"}
          rows={5}
          value={form.responsibilities}
        />
      </Field>
    </FormSection>
  );
}

export function OpportunityApplicationFields({ errors, form, getToday, onChange }) {
  return (
    <FormSection
      description="Let students know when and how to get in touch."
      number="03"
      title="Make the next step clear"
    >
      <Field error={errors.deadline} id="opportunity-deadline" label="Application deadline">
        <input
          aria-describedby={errors.deadline ? "opportunity-deadline-error" : undefined}
          aria-invalid={Boolean(errors.deadline)}
          id="opportunity-deadline"
          min={getToday()}
          onChange={(event) => onChange("deadline", event.target.value)}
          type="date"
          value={form.deadline}
        />
      </Field>
      <Field error={errors.contactEmail} id="opportunity-contact-email" label="Contact email">
        <input
          aria-describedby={errors.contactEmail ? "opportunity-contact-email-error" : undefined}
          aria-invalid={Boolean(errors.contactEmail)}
          id="opportunity-contact-email"
          onChange={(event) => onChange("contactEmail", event.target.value)}
          placeholder="you@ncsu.edu"
          type="email"
          value={form.contactEmail}
        />
      </Field>
      <Field
        error={errors.applicationUrl}
        hint="If left blank, students will be directed to contact you by email."
        id="opportunity-application-url"
        label="Application URL"
        optional
        wide
      >
        <input
          aria-describedby={errors.applicationUrl ? "opportunity-application-url-error" : undefined}
          aria-invalid={Boolean(errors.applicationUrl)}
          id="opportunity-application-url"
          onChange={(event) => onChange("applicationUrl", event.target.value)}
          placeholder="https://…"
          type="url"
          value={form.applicationUrl}
        />
      </Field>
    </FormSection>
  );
}
