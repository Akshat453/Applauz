function Card({ children, className = '' }) {
  return <section className={`rounded-lg bg-white shadow-panel ${className}`}>{children}</section>;
}

export default Card;
