import { Link, useNavigate } from 'react-router-dom';
import { FaMapMarkerAlt, FaBriefcase, FaCalendarCheck, FaPhoneAlt } from 'react-icons/fa';
import Card from '@/components/common/Card';
import Badge from '@/components/common/Badge';
import RatingStars from '@/components/common/RatingStars';
import Button from '@/components/common/Button';
import { ROUTES } from '@/constants/routes';
import './ProviderCard.css';

export default function ProviderCard({ provider, onRequestService }) {
  const navigate = useNavigate();

  const handleRequest = (e) => {
    e.preventDefault();
    if (onRequestService) {
      onRequestService(provider);
    } else {
      navigate(`${ROUTES.NEW_REQUEST}?providerId=${provider.id}&service=${encodeURIComponent(provider.service)}`);
    }
  };

  return (
    <Card interactive className="provider-card" as="article">
      <div className="provider-card-main">
        {/* Avatar & Badges */}
        <div className="provider-avatar-col">
          <div className="provider-img-wrap">
            <img
              src={provider.profileImage}
              alt={`${provider.name} - ${provider.service}`}
              className="provider-img"
              loading="lazy"
            />
          </div>
          {provider.isVerified && <Badge verified size="sm" />}
        </div>

        {/* Info */}
        <div className="provider-info-col">
          <div className="provider-card-header">
            <div>
              <h3 className="provider-name">
                <Link to={`/providers/${provider.id}`} className="provider-name-link">
                  {provider.name}
                </Link>
              </h3>
              <p className="provider-service-title">{provider.service}</p>
            </div>

            <div className="provider-price-box">
              <span className="price-label">Starts at</span>
              <strong className="price-val">Rs. {provider.startingPrice?.toLocaleString()}</strong>
            </div>
          </div>

          <div className="provider-rating-row">
            <RatingStars rating={provider.rating} reviewCount={provider.reviewCount} />
            <span className="meta-sep" aria-hidden="true">•</span>
            <span className="provider-exp">
              <FaBriefcase aria-hidden="true" /> {provider.experience} yrs exp
            </span>
          </div>

          <p className="provider-description">{provider.shortDescription}</p>

          <div className="provider-tags-row">
            <span className="provider-area-pill">
              <FaMapMarkerAlt aria-hidden="true" /> {provider.primaryArea}
            </span>
            <span className="provider-avail-pill">
              <FaCalendarCheck aria-hidden="true" /> {provider.availability}
            </span>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="provider-card-footer">
        <a
          href={`tel:${provider.phone.replace(/\s+/g, '')}`}
          className="btn-call-direct"
          title={`Call ${provider.name}`}
          aria-label={`Call ${provider.name} at ${provider.phone}`}
        >
          <FaPhoneAlt aria-hidden="true" />
          <span>Call</span>
        </a>

        <Link to={`/providers/${provider.id}`} className="btn-view-profile">
          View Profile
        </Link>

        <Button
          variant="primary"
          size="sm"
          onClick={handleRequest}
        >
          Request Service
        </Button>
      </div>
    </Card>
  );
}
