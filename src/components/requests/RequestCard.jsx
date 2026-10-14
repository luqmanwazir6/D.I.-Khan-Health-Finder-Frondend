import { Link } from 'react-router-dom';
import {
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaClock,
  FaMoneyBillWave,
  FaUser,
  FaPhoneAlt,
  FaPaperclip,
  FaEye,
} from 'react-icons/fa';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import RequestStatusBadge from './RequestStatusBadge';
import { REQUEST_STATUS, CANCELLABLE_STATUSES } from '@/constants/requestStatus';
import './RequestCard.css';

export default function RequestCard({
  request,
  userRole = 'customer',
  onCancel = null,
  onAccept = null,
  onReject = null,
  onComplete = null,
  onReview = null,
  onViewDetails = null,
}) {
  const isCancellable = userRole === 'customer' && CANCELLABLE_STATUSES.includes(request.status);
  const isReviewable = userRole === 'customer' && request.status === REQUEST_STATUS.COMPLETED;
  const isPendingProviderAction = userRole === 'provider' && request.status === REQUEST_STATUS.PENDING;
  const isCompletable = userRole === 'provider' && ['accepted', 'in-progress'].includes(request.status);

  const displayId = request.requestId || `#${(request.id || request._id || '').slice(-6)}`;
  const attachmentCount = request.attachments ? request.attachments.length : 0;

  return (
    <Card className="request-card" as="article">
      <div className="request-card-header">
        <div className="request-service-info">
          <span className="request-service-category">{request.category}</span>
          <h3
            className="request-service-title"
            style={onViewDetails ? { cursor: 'pointer' } : undefined}
            onClick={() => onViewDetails && onViewDetails(request)}
          >
            {request.service}
          </h3>
          <span className="request-id">ID: {displayId}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {attachmentCount > 0 && (
            <span
              style={{
                fontSize: '11px',
                background: '#e0e7ff',
                color: '#3730a3',
                padding: '2px 8px',
                borderRadius: '12px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <FaPaperclip /> {attachmentCount} file{attachmentCount > 1 ? 's' : ''}
            </span>
          )}
          <RequestStatusBadge status={request.status} />
        </div>
      </div>

      <p className="request-description">{request.description}</p>

      <div className="request-details-grid">
        <div className="request-detail-item">
          <FaMapMarkerAlt className="detail-icon" aria-hidden="true" />
          <span>
            <strong>{request.area}:</strong> {request.address}
          </span>
        </div>

        <div className="request-detail-item">
          <FaCalendarAlt className="detail-icon" aria-hidden="true" />
          <span>
            {request.preferredDate || 'Flexible date'} ({request.preferredTime})
          </span>
        </div>

        {request.budget ? (
          <div className="request-detail-item">
            <FaMoneyBillWave className="detail-icon" aria-hidden="true" />
            <span>
              <strong>Budget:</strong> Rs. {Number(request.budget).toLocaleString()}
            </span>
          </div>
        ) : null}

        <div className="request-detail-item">
          <FaUser className="detail-icon" aria-hidden="true" />
          <span>
            {userRole === 'customer' ? (
              <>
                <strong>Pro:</strong>{' '}
                {request.providerName ? (
                  <Link to={`/providers/${request.providerId}`}>{request.providerName}</Link>
                ) : (
                  'Broadcasting to local pros'
                )}
              </>
            ) : (
              <>
                <strong>Customer:</strong> {request.customerName}
              </>
            )}
          </span>
        </div>
      </div>

      {request.notes && (
        <div className="request-notes">
          <small>Note: {request.notes}</small>
        </div>
      )}

      {/* Action buttons depending on state and role */}
      <div className="request-card-actions">
        {onViewDetails && (
          <Button
            variant="ghost"
            size="sm"
            icon={<FaEye />}
            onClick={() => onViewDetails(request)}
          >
            Details
          </Button>
        )}

        {userRole === 'provider' && request.customerPhone && (
          <a
            href={`tel:${request.customerPhone.replace(/\s+/g, '')}`}
            className="request-contact-link"
          >
            <FaPhoneAlt aria-hidden="true" /> Call Customer
          </a>
        )}

        {userRole === 'customer' && request.providerPhone && (
          <a
            href={`tel:${request.providerPhone.replace(/\s+/g, '')}`}
            className="request-contact-link"
          >
            <FaPhoneAlt aria-hidden="true" /> Call Professional
          </a>
        )}

        {/* Customer Actions */}
        {isCancellable && onCancel && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onCancel(request)}
          >
            Cancel Request
          </Button>
        )}

        {isReviewable && onReview && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onReview(request)}
          >
            ★ Write Review
          </Button>
        )}

        {/* Provider Actions */}
        {isPendingProviderAction && (
          <div className="provider-action-group">
            {onReject && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onReject(request)}
              >
                Decline
              </Button>
            )}
            {onAccept && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => onAccept(request)}
              >
                Accept Job
              </Button>
            )}
          </div>
        )}

        {isCompletable && onComplete && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => onComplete(request)}
          >
            Mark Completed
          </Button>
        )}
      </div>
    </Card>
  );
}
