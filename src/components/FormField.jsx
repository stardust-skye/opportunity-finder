function FormField({
  autoComplete,
  children,
  error,
  hint,
  id,
  label,
  name = id,
  ...inputProps
}) {
  return (
    <div className={`form-field${error ? " has-error" : ""}`}>
      {label && <label htmlFor={id}>{label}</label>}
      {children || (
        <input
          aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
          autoComplete={autoComplete}
          id={id}
          name={name}
          {...inputProps}
        />
      )}
      {error && <span className="field-message" id={`${id}-error`}>{error}</span>}
      {!error && hint && <span className="field-hint" id={`${id}-hint`}>{hint}</span>}
    </div>
  );
}

export default FormField;
