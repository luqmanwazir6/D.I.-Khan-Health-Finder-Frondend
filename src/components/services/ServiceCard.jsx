import { Link } from 'react-router-dom';
import { FaWrench, FaArrowRight } from 'react-icons/fa';
import Card from '@/components/common/Card';
import './ServiceCard.css';

export default function ServiceCard({ service }) {
  return (
    <Card interactive className="service-card" as="article">
      <div className="service-card-body">
        <div className="service-header">
          <div className="service-icon" aria-hidden="true">
            <FaWrench />
          </div>
          <span className="service-cat-pill">{service.categoryName}</span>
        </div>

        <h3 className="service-title">{service.name}</h3>
        <p className="service-desc">{service.description}</p>

        <div className="service-meta">
          <div className="service-price">
            <small>Starting from</small>
            <strong>Rs. {service.avgPrice?.toLocaleString()}</strong>
          </div>
        </div>
      </div>

      <div className="service-card-actions">
        <Link to={`/services/${service.slug}`} className="service-action-link">
          <span>View Service & Pros</span>
          <FaArrowRight aria-hidden="true" />
        </Link>
      </div>
    </Card>
  );
}
