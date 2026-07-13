import { forwardRef } from 'react';

const FormSelect = forwardRef(function FormSelect(
  { label, error, id, children, className = '', ...props },
  ref,
) {
  return (
    <label className={`block space-y-2 ${className}`} htmlFor={id}>
      {label ? <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink/55">{label}</span> : null}
      <select
        ref={ref}
        id={id}
        aria-invalid={Boolean(error)}
        className="h-11 w-full rounded-sm border border-line/80 bg-white px-4 text-sm text-ink outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
        {...props}
      >
        {children}
      </select>
      {error ? <p className="text-sm font-medium text-danger">{error}</p> : null}
    </label>
  );
});

export default FormSelect;
