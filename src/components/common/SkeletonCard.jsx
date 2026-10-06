import './Skeleton.css';

export default function SkeletonCard({ count = 1, type = 'provider' }) {
  const items = Array.from({ length: count }, (_, i) => i);

  return (
    <>
      {items.map((key) => (
        <div key={key} className={`skeleton-card skeleton-${type}`} aria-hidden="true">
          <div className="skeleton-avatar" />
          <div className="skeleton-lines">
            <div className="skeleton-line skeleton-title" />
            <div className="skeleton-line skeleton-subtitle" />
            <div className="skeleton-line skeleton-text" />
            <div className="skeleton-line skeleton-footer" />
          </div>
        </div>
      ))}
    </>
  );
}
