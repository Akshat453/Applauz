function Badge({ children, tone = 'default', className = '' }) {
  const tones = {
    default: 'bg-primary/8 text-primary',
    accent: 'bg-accent/15 text-accent',
    success: 'bg-success/12 text-success',
    danger: 'bg-danger/12 text-danger',
    warning: 'bg-warning/16 text-[#9a6b00]',
    outline: 'border border-line bg-white text-primary',
  };

  return <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${tones[tone]} ${className}`}>{children}</span>;
}

export default Badge;
