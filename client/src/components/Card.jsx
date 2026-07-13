function Card({ children, className = '' }) {
  return (
    <section
      className={`rounded-lg border border-white/70 bg-panel shadow-panel backdrop-blur-sm ${className}`}
    >
      {children}
    </section>
  );
}

export default Card;
