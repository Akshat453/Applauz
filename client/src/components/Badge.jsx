function Badge({ children, tone = 'default', className = '' }) {
  const tones = {
    default: 'bg-mist text-primary',
    accent: 'bg-accent/15 text-accent',
    success: 'bg-success/12 text-success',
    danger: 'bg-danger/12 text-danger',
    warning: 'bg-warning/16 text-[#9a6b00]',
    outline: 'border border-primary/20 bg-white text-primary',
  };

  return <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${tones[tone]} ${className}`}>{children}</span>;
}

export default Badge;
