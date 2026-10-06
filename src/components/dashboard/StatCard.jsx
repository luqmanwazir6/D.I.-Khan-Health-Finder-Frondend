import Card from '@/components/common/Card';
import './StatCard.css';

export default function StatCard({
  title,
  value,
  subtitle = null,
  icon = null,
  tone = 'primary',
}) {
  return (
    <Card className="stat-card" as="div">
      <div className="stat-card-inner">
        <div className="stat-info">
          <span className="stat-title">{title}</span>
          <strong className="stat-value">{value}</strong>
          {subtitle && <small className="stat-subtitle">{subtitle}</small>}
        </div>
        {icon && (
          <div className={`stat-icon-wrap stat-tone-${tone}`} aria-hidden="true">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}
