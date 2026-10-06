import { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  FaWrench,
  FaCheckCircle,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaArrowLeft,
  FaArrowRight,
  FaExclamationCircle,
} from 'react-icons/fa';
import useDocumentTitle from '@/hooks/useDocumentTitle';
import { serviceService } from '@/services/serviceService';
import { providerService } from '@/services/providerService';
import { DI_KHAN_AREAS, SERVICES_DATA, PROVIDERS_DATA } from '@/constants/data';
import { ROUTES } from '@/constants/routes';
import ProviderCard from '@/components/providers/ProviderCard';
import Button from '@/components/common/Button';
import SkeletonCard from '@/components/common/SkeletonCard';
import { ErrorState } from '@/components/common/FeedbackStates';
import './ServiceDetailsPage.css';

export default function ServiceDetailsPage() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const initialService = useMemo(() => {
    return SERVICES_DATA.find((s) => s.id === slug || s.slug === slug) || null;
  }, [slug]);

  const [service, setService] = useState(initialService);
  const [providers, setProviders] = useState(() =>
    initialService
      ? PROVIDERS_DATA.filter(
          (p) =>
            p.service?.toLowerCase() === initialService.name?.toLowerCase() ||
            p.serviceId === initialService.id,
        )
      : [],
  );
  const [relatedServices, setRelatedServices] = useState(() =>
    initialService
      ? SERVICES_DATA.filter(
          (s) => s.categoryId === initialService.categoryId && s.id !== initialService.id,
        ).slice(0, 4)
      : [],
  );
  const [isLoading, setIsLoading] = useState(!initialService);
  const [error, setError] = useState(null);
  const isFirstMount = useRef(true);

  useDocumentTitle(service ? `${service.name} in D.I. Khan` : 'Service details');

  useEffect(() => {
    let isMounted = true;
    const fetchServiceData = async () => {
      if (!isFirstMount.current) {
        setIsLoading(true);
      }
      isFirstMount.current = false;
      setError(null);
      try {
        const srvRes = await serviceService.getServiceByIdOrSlug(slug);
        const srv = srvRes.data;

        if (isMounted) {
          setService(srv);
        }

        // Fetch professionals providing this specific service
        const [provRes, allSrvRes] = await Promise.all([
          providerService.getProviders({ service: srv.slug || srv.id }),
          serviceService.getServices({ category: srv.categoryId }),
        ]);

        if (isMounted) {
          setProviders(provRes.data || []);
          // Related services in the same category
          setRelatedServices(
            (allSrvRes.data || []).filter((s) => s.id !== srv.id).slice(0, 4),
          );
        }
      } catch (err) {
        if (isMounted) setError(err.message || 'Service not found');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchServiceData();
    return () => {
      isMounted = false;
    };
  }, [slug]);

  if (isLoading && !service) {
    return (
      <div className="container page-section">
        <SkeletonCard count={3} type="provider" />
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="container page-section">
        <ErrorState
          title="Service Not Found"
          message={`We could not locate the service "${slug}". It may have been renamed or moved.`}
          onRetry={() => navigate(ROUTES.SERVICES)}
        />
      </div>
    );
  }

  return (
    <div className="service-details-page">
      {/* Breadcrumb & Hero */}
      <div className="service-hero-band">
        <div className="container">
          <Link to={ROUTES.SERVICES} className="back-link">
            <FaArrowLeft aria-hidden="true" /> Back to All Services
          </Link>

          <div className="service-hero-grid">
            <div className="service-hero-main">
              <span className="service-category-tag">{service.categoryName || 'Home & Local Services'}</span>
              <h1 className="service-name-heading">
                {service.name} Services in Dera Ismail Khan
              </h1>
              <p className="service-lead-text">{service.description}</p>

              <div className="service-quick-stats">
                <div className="quick-stat-item">
                  <FaMoneyBillWave className="stat-ico" aria-hidden="true" />
                  <div>
                    <small>Starting rate in D.I. Khan</small>
                    <strong>Rs. {service.avgPrice?.toLocaleString()}</strong>
                  </div>
                </div>

                <div className="quick-stat-item">
                  <FaCheckCircle className="stat-ico" aria-hidden="true" />
                  <div>
                    <small>Available Professionals</small>
                    <strong>{providers.length} Verified</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Request CTA card */}
            <div className="service-cta-box">
              <h3>Need a {service.name} today?</h3>
              <p>Post a quick service request and available technicians in your area will respond.</p>
              <Button
                variant="primary"
                fullWidth
                size="lg"
                onClick={() =>
                  navigate(`${ROUTES.NEW_REQUEST}?category=${service.categoryId}&service=${service.slug}`)
                }
              >
                Request a {service.name}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container service-content-body page-section">
        <div className="service-main-col">
          {/* Common Problems Solved */}
          {service.commonProblems && service.commonProblems.length > 0 && (
            <section className="service-section-box">
              <h2 className="section-subheading">
                Common {service.name} Problems Solved
              </h2>
              <ul className="problems-list" role="list">
                {service.commonProblems.map((prob, idx) => (
                  <li key={idx} className="problem-item">
                    <FaCheckCircle className="problem-icon" aria-hidden="true" />
                    <span>{prob}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Available Professionals */}
          <section className="service-section-box" id="available-pros">
            <div className="section-header-inline">
              <h2 className="section-subheading">
                Available {service.name}s in D.I. Khan ({providers.length})
              </h2>
              <Link
                to={`/providers?service=${service.slug}`}
                className="section-sub-link"
              >
                Filter by Area <FaArrowRight aria-hidden="true" />
              </Link>
            </div>

            {providers.length === 0 ? (
              <p className="no-pros-note">
                No individual profiles listed yet. You can still post a job request and we will notify our network of local technicians.
              </p>
            ) : (
              <div className="service-pros-list">
                {providers.map((p) => (
                  <ProviderCard key={p.id} provider={p} />
                ))}
              </div>
            )}
          </section>

          {/* Areas Covered */}
          <section className="service-section-box">
            <h2 className="section-subheading">Service Areas in Dera Ismail Khan</h2>
            <p className="text-muted">
              Our registered {service.name.toLowerCase()}s cover all major residential and commercial sectors in Dera Ismail Khan:
            </p>
            <div className="service-areas-chips">
              {DI_KHAN_AREAS.map((area) => (
                <span key={area} className="area-chip">
                  <FaMapMarkerAlt aria-hidden="true" /> {area}
                </span>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar: Related Services */}
        <aside className="service-sidebar-col">
          <div className="related-services-card">
            <h3 className="related-title">Related Services</h3>
            <ul className="related-list" role="list">
              {relatedServices.map((rel) => (
                <li key={rel.id}>
                  <Link to={`/services/${rel.slug}`} className="related-link">
                    <div>
                      <strong>{rel.name}</strong>
                      <small>Starts at Rs. {rel.avgPrice}</small>
                    </div>
                    <FaArrowRight aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
