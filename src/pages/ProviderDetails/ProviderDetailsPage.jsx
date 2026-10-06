import { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaWhatsapp,
  FaBriefcase,
  FaCalendarCheck,
  FaClock,
  FaShieldAlt,
  FaArrowLeft,
  FaStar,
} from 'react-icons/fa';
import useDocumentTitle from '@/hooks/useDocumentTitle';
import { providerService } from '@/services/providerService';
import { reviewService } from '@/services/reviewService';
import { requestService } from '@/services/requestService';
import { useAuth } from '@/context/AuthContext';
import { ROUTES } from '@/constants/routes';
import Badge from '@/components/common/Badge';
import RatingStars from '@/components/common/RatingStars';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import Modal from '@/components/common/Modal';
import SkeletonCard from '@/components/common/SkeletonCard';
import { ErrorState, SuccessMessage } from '@/components/common/FeedbackStates';
import ReviewCard from '@/components/reviews/ReviewCard';
import ReviewForm from '@/components/reviews/ReviewForm';
import Input from '@/components/common/Input';
import Textarea from '@/components/common/Textarea';
import Select from '@/components/common/Select';
import { DI_KHAN_AREAS, INITIAL_PROVIDERS, INITIAL_REVIEWS } from '@/constants/data';
import { validateServiceRequest } from '@/validations';
import './ProviderDetailsPage.css';

export default function ProviderDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const initialProvider = useMemo(() => {
    return INITIAL_PROVIDERS.find((p) => p.id === id) || null;
  }, [id]);

  const [provider, setProvider] = useState(initialProvider);
  const [reviews, setReviews] = useState(() =>
    INITIAL_REVIEWS.filter((r) => r.providerId === id),
  );
  const [isLoading, setIsLoading] = useState(!initialProvider);
  const [error, setError] = useState(null);
  const isFirstMount = useRef(true);

  // Modal states
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [modalSuccessMsg, setModalSuccessMsg] = useState('');

  // Request form state
  const [requestForm, setRequestForm] = useState({
    description: '',
    area: '',
    address: '',
    preferredDate: '',
    preferredTime: 'Morning (9:00 AM - 1:00 PM)',
    budget: '',
    notes: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);

  useDocumentTitle(provider ? `${provider.name} | ${provider.service}` : 'Provider details');

  useEffect(() => {
    let isMounted = true;
    const loadProviderDetails = async () => {
      if (!isFirstMount.current) {
        setIsLoading(true);
      }
      isFirstMount.current = false;
      setError(null);
      try {
        const [provRes, revRes] = await Promise.all([
          providerService.getProviderById(id),
          reviewService.getReviews({ providerId: id }),
        ]);
        if (isMounted) {
          setProvider(provRes.data);
          setReviews(revRes.data || []);
        }
      } catch (err) {
        if (isMounted) setError(err.message || 'Provider not found');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadProviderDetails();
    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...requestForm,
      category: provider.categoryName,
      serviceName: provider.service,
      serviceId: provider.serviceId,
    };

    const validation = validateServiceRequest(payload);
    if (!validation.isValid) {
      setFormErrors(validation.errors);
      return;
    }
    setFormErrors({});
    setIsSubmittingRequest(true);

    try {
      await requestService.createRequest({
        ...payload,
        providerId: provider.id,
        providerName: provider.name,
        providerPhone: provider.phone,
        customerId: user?.id || 'guest',
        customerName: user?.name || 'Local Customer',
        customerPhone: user?.phone || '+92 300 0000000',
      });
      setIsRequestModalOpen(false);
      setModalSuccessMsg(`Your service request was sent to ${provider.name}. They will call you shortly.`);
    } catch (err) {
      alert(err.message || 'Failed to submit request');
    } finally {
      setIsSubmittingRequest(false);
    }
  };

  const handleReviewSubmit = async ({ rating, comment }) => {
    try {
      const res = await reviewService.createReview({
        providerId: provider.id,
        userName: user?.name || 'Customer from D.I. Khan',
        userCity: user?.area ? `D.I. Khan (${user.area})` : 'Dera Ismail Khan',
        rating,
        comment,
      });
      setReviews((prev) => [res.data, ...prev]);
      setIsReviewModalOpen(false);
      setModalSuccessMsg('Thank you for leaving a verified review!');
    } catch (err) {
      alert(err.message || 'Failed to submit review');
    }
  };

  if (isLoading && !provider) {
    return (
      <div className="container page-section">
        <SkeletonCard count={2} type="provider" />
      </div>
    );
  }

  if (error || !provider) {
    return (
      <div className="container page-section">
        <ErrorState
          title="Professional Not Found"
          message={`We could not find the profile for ID "${id}".`}
          onRetry={() => navigate(ROUTES.PROVIDERS)}
        />
      </div>
    );
  }

  return (
    <div className="provider-details-page">
      {/* Top Banner */}
      <div className="provider-hero-band">
        <div className="container">
          <Link to={ROUTES.PROVIDERS} className="back-link">
            <FaArrowLeft aria-hidden="true" /> Back to All Professionals
          </Link>

          {modalSuccessMsg && (
            <SuccessMessage
              message={modalSuccessMsg}
              onDismiss={() => setModalSuccessMsg('')}
            />
          )}

          <div className="provider-hero-card">
            <div className="provider-profile-image-wrap">
              <img
                src={provider.profileImage}
                alt={provider.name}
                className="provider-profile-image"
              />
              {provider.isVerified && (
                <div className="verified-badge-overlay">
                  <Badge verified />
                </div>
              )}
            </div>

            <div className="provider-hero-info">
              <div className="provider-title-row">
                <div>
                  <h1 className="pro-name">{provider.name}</h1>
                  <span className="pro-service-tag">{provider.service}</span>
                </div>
                <div className="pro-pricing-tag">
                  <small>Starting at</small>
                  <strong>Rs. {provider.startingPrice?.toLocaleString()}</strong>
                </div>
              </div>

              <div className="pro-meta-bar">
                <RatingStars rating={provider.rating} reviewCount={reviews.length} size="lg" />
                <span className="pro-meta-sep">•</span>
                <span className="pro-exp">
                  <FaBriefcase aria-hidden="true" /> {provider.experience} Years Experience
                </span>
                <span className="pro-meta-sep">•</span>
                <span className="pro-avail">
                  <FaCalendarCheck aria-hidden="true" /> {provider.availability}
                </span>
              </div>

              <p className="pro-short-desc">{provider.shortDescription}</p>

              {/* Direct Call & Request CTAs */}
              <div className="pro-hero-action-buttons">
                <a
                  href={`tel:${provider.phone.replace(/\s+/g, '')}`}
                  className="pro-btn-call"
                  title="Direct Phone Call"
                >
                  <FaPhoneAlt aria-hidden="true" /> Call {provider.phone}
                </a>

                {provider.whatsapp && (
                  <a
                    href={`https://wa.me/${provider.whatsapp.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="pro-btn-whatsapp"
                    title="Chat on WhatsApp"
                  >
                    <FaWhatsapp aria-hidden="true" /> WhatsApp
                  </a>
                )}

                <Button
                  variant="primary"
                  onClick={() => setIsRequestModalOpen(true)}
                  className="pro-btn-request"
                >
                  Request Service
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Details Grid */}
      <div className="container page-section pro-content-grid">
        <div className="pro-left-column">
          {/* About / Bio */}
          <section className="pro-section-card">
            <h2 className="pro-card-title">About the Professional</h2>
            <p className="pro-about-text">{provider.about}</p>
          </section>

          {/* Skills & Expertise */}
          {provider.skills && provider.skills.length > 0 && (
            <section className="pro-section-card">
              <h2 className="pro-card-title">Skills & Expertise</h2>
              <div className="skills-pill-cluster">
                {provider.skills.map((skill, idx) => (
                  <span key={idx} className="skill-pill">
                    {skill}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Pricing Table */}
          {provider.pricingDetails && provider.pricingDetails.length > 0 && (
            <section className="pro-section-card">
              <h2 className="pro-card-title">Estimated Pricing (PKR)</h2>
              <div className="pricing-table-wrap">
                <table className="pricing-table">
                  <thead>
                    <tr>
                      <th scope="col">Service / Task</th>
                      <th scope="col">Estimated Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {provider.pricingDetails.map((item, idx) => (
                      <tr key={idx}>
                        <td>{item.item}</td>
                        <td className="price-cell">Rs. {item.price.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <small className="pricing-disclaimer">
                * Final pricing may vary depending on spare parts or specific site requirements.
              </small>
            </section>
          )}

          {/* Reviews & Feedback */}
          <section className="pro-section-card" id="reviews">
            <div className="reviews-section-header">
              <div>
                <h2 className="pro-card-title">Verified Customer Reviews ({reviews.length})</h2>
                <p className="text-muted">Real feedback from clients in Dera Ismail Khan.</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsReviewModalOpen(true)}
              >
                ★ Leave a Review
              </Button>
            </div>

            {reviews.length === 0 ? (
              <p className="no-reviews-note">
                No reviews yet. Be the first customer in D.I. Khan to leave feedback!
              </p>
            ) : (
              <div className="reviews-stack">
                {reviews.map((rev) => (
                  <ReviewCard key={rev.id} review={rev} />
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Right Sidebar Details */}
        <aside className="pro-sidebar-column">
          {/* Service Areas */}
          <div className="pro-section-card sidebar-card">
            <h3 className="sidebar-card-title">
              <FaMapMarkerAlt aria-hidden="true" /> Areas Served
            </h3>
            <p className="text-muted text-xs">
              This professional operates in the following Dera Ismail Khan locations:
            </p>
            <ul className="areas-list" role="list">
              {provider.serviceAreas?.map((area) => (
                <li key={area}>
                  <FaMapMarkerAlt className="area-icon" aria-hidden="true" /> {area}
                </li>
              ))}
            </ul>
          </div>

          {/* Working Hours */}
          <div className="pro-section-card sidebar-card">
            <h3 className="sidebar-card-title">
              <FaClock aria-hidden="true" /> Working Hours
            </h3>
            <p className="pro-hours-val">{provider.workingHours || '9:00 AM - 8:00 PM'}</p>
          </div>

          {/* Verification Notice */}
          <div className="pro-section-card sidebar-card verify-box">
            <div className="verify-box-header">
              <FaShieldAlt className="shield-icon" aria-hidden="true" />
              <strong>Trust Guarantee</strong>
            </div>
            <p className="text-xs">
              Identity & CNIC verified. In case of issues, contact D.I. Khan Service Finder support anytime.
            </p>
          </div>
        </aside>
      </div>

      {/* REQUEST SERVICE MODAL */}
      <Modal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        title={`Request Service from ${provider.name}`}
        size="md"
      >
        <form onSubmit={handleRequestSubmit} className="request-modal-form">
          <p className="request-modal-subtitle">
            Provide details of the job. {provider.name} will be notified with your address and contact number.
          </p>

          <Textarea
            label="Describe the work needed"
            name="description"
            value={requestForm.description}
            onChange={(e) => setRequestForm({ ...requestForm, description: e.target.value })}
            placeholder="e.g. Water motor leaking in courtyard, need pipe fix and valve check..."
            error={formErrors.description}
            required
            rows={3}
          />

          <Select
            label="Your Area in D.I. Khan"
            name="area"
            value={requestForm.area}
            options={DI_KHAN_AREAS.map((a) => ({ value: a, label: a }))}
            onChange={(e) => setRequestForm({ ...requestForm, area: e.target.value })}
            error={formErrors.area}
            required
          />

          <Input
            label="Street Address / House #"
            name="address"
            value={requestForm.address}
            onChange={(e) => setRequestForm({ ...requestForm, address: e.target.value })}
            placeholder="House #, Street name, Landmark"
            error={formErrors.address}
            required
          />

          <div className="form-row-two">
            <Input
              label="Preferred Date"
              name="preferredDate"
              type="date"
              value={requestForm.preferredDate}
              onChange={(e) => setRequestForm({ ...requestForm, preferredDate: e.target.value })}
              error={formErrors.preferredDate}
              required
            />

            <Select
              label="Preferred Time Slot"
              name="preferredTime"
              value={requestForm.preferredTime}
              options={[
                'Morning (9:00 AM - 1:00 PM)',
                'Afternoon (1:00 PM - 5:00 PM)',
                'Evening (5:00 PM - 9:00 PM)',
                'Emergency (As soon as possible)',
              ]}
              onChange={(e) => setRequestForm({ ...requestForm, preferredTime: e.target.value })}
              error={formErrors.preferredTime}
              required
            />
          </div>

          <Input
            label="Estimated Budget (PKR, optional)"
            name="budget"
            type="number"
            value={requestForm.budget}
            onChange={(e) => setRequestForm({ ...requestForm, budget: e.target.value })}
            placeholder="e.g. 1500"
            error={formErrors.budget}
          />

          <div className="modal-actions-bar">
            <Button
              variant="ghost"
              onClick={() => setIsRequestModalOpen(false)}
              disabled={isSubmittingRequest}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              isLoading={isSubmittingRequest}
            >
              Send Service Request
            </Button>
          </div>
        </form>
      </Modal>

      {/* WRITE REVIEW MODAL */}
      <Modal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        title={`Write a Review for ${provider.name}`}
        size="md"
      >
        <ReviewForm
          providerName={provider.name}
          onSubmit={handleReviewSubmit}
          onCancel={() => setIsReviewModalOpen(false)}
        />
      </Modal>
    </div>
  );
}
