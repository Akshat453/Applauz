function Button({
  children,
  className = '',
  variant = 'primary',
  size = 'md',
  loading = false,
  icon: Icon,
  ...props
}) {
  const variants = {
    primary: 'bg-accent text-white shadow-soft hover:bg-[#f6920d]',
    secondary: 'border border-line bg-white text-ink hover:border-primary/25 hover:bg-primary/5',
    ghost: 'bg-transparent text-primary hover:bg-primary/8',
    danger: 'bg-danger text-white hover:bg-danger/90',
    success: 'bg-success text-white hover:bg-success/90',
  };

  const sizes = {
    sm: 'h-10 px-4 text-sm',
    md: 'h-11 px-5 text-sm',
    lg: 'h-12 px-6 text-base',
  };

  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" aria-hidden="true" /> : null}
      {!loading && Icon ? <Icon className="h-4 w-4" aria-hidden="true" /> : null}
      <span>{children}</span>
    </button>
  );
}

export default Button;
