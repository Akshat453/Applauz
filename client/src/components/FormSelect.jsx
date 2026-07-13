import { forwardRef } from 'react';

const FormSelect = forwardRef(function FormSelect(
  { label, error, id, children, className = '', ...props },
  ref,
) {
  return (
    <label className={`block space-y-2 ${className}`} htmlFor={id}>
      {label ? <span className="text-sm font-semibold uppercase tracking-[0.12em] text-ink/65">{label}</span> : null}
      <select
        ref={ref}
        id={id}
        aria-invalid={Boolean(error)}
        className="h-12 w-full rounded-sm border border-line bg-white px-4 text-base text-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
        {...props}
      >
        {children}
      </select>
      {error ? <p className="text-sm font-medium text-danger">{error}</p> : null}
    </label>
  );
});

export default FormSelect;
