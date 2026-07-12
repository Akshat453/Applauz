function LoadingSkeleton({ className = '' }) {
  return <div className={`animate-pulse rounded-lg bg-mist ${className}`} aria-hidden="true" />;
}

export default LoadingSkeleton;
