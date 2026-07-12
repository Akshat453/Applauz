import { forwardRef } from 'react';

const FormTextarea = forwardRef(function FormTextarea(
  { label, error, id, helperText, className = '', ...props },
  ref,
) {
  const describedBy = error ? `${id}-error` : helperText ? `${id}-help` : undefined;

  return (
    <label className={`block space-y-2 ${className}`} htmlFor={id}>
      {label ? <span className="text-sm font-semibold uppercase tracking-[0.12em] text-ink/65">{label}</span> : null}
      <textarea
        ref={ref}
        id={id}
        aria-describedby={describedBy}
        aria-invalid={Boolean(error)}
        className="min-h-40 w-full rounded-sm border border-line bg-white px-4 py-4 text-base text-ink outline-none transition placeholder:text-ink/35 focus:border-primary focus:ring-2 focus:ring-primary/20"
        {...props}
      />
      {helperText && !error ? <p id={`${id}-help`} className="text-sm text-ink/55">{helperText}</p> : null}
      {error ? <p id={`${id}-error`} className="text-sm font-medium text-danger">{error}</p> : null}
    </label>
  );
});

export default FormTextarea;
