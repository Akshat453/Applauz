import { forwardRef } from 'react';

const FormInput = forwardRef(function FormInput(
  { label, error, id, helperText, className = '', ...props },
  ref,
) {
  const describedBy = error ? `${id}-error` : helperText ? `${id}-help` : undefined;

  return (
    <label className={`block space-y-2 ${className}`} htmlFor={id}>
      {label ? <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink/55">{label}</span> : null}
      <input
        ref={ref}
        id={id}
        aria-describedby={describedBy}
        aria-invalid={Boolean(error)}
        className="h-11 w-full rounded-sm border border-line/80 bg-white px-4 text-sm text-ink outline-none transition placeholder:text-ink/35 focus:border-primary focus:ring-4 focus:ring-primary/10"
        {...props}
      />
      {helperText && !error ? <p id={`${id}-help`} className="text-sm text-ink/55">{helperText}</p> : null}
      {error ? <p id={`${id}-error`} className="text-sm font-medium text-danger">{error}</p> : null}
    </label>
  );
});

export default FormInput;
