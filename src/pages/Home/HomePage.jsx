import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaSearch,
  FaMapMarkerAlt,
  FaShieldAlt,
  FaUserCheck,
  FaCheckCircle,
  FaPhoneAlt,
  FaArrowRight,
  FaTools,
  FaRegHandshake,
} from 'react-icons/fa';
import useDocumentTitle from '@/hooks/useDocumentTitle';
import { categoryService } from '@/services/categoryService';
import { providerService } from '@/services/providerService';
import { DI_KHAN_AREAS, CATEGORIES_DATA, PROVIDERS_DATA } from '@/constants/data';
import { ROUTES } from '@/constants/routes';
import Button from '@/components/common/Button';
import CategoryCard from '@/components/services/CategoryCard';
import ProviderCard from '@/components/providers/ProviderCard';
import SkeletonCard from '@/components/common/SkeletonCard';
import './HomePage.css';

const SEARCH_SUGGESTIONS = ['Plumber', 'Electrician', 'AC Technician', 'Car Mechanic', 'Carpenter'];

export default function HomePage() {
  useDocumentTitle();
  const navigate = useNavigate();

  const [categories, setCategories] = useState(CATEGORIES_DATA);
  const [featuredProviders, setFeaturedProviders] = useState(() => PROVIDERS_DATA.slice(0, 4));
  const [isLoading, setIsLoading] = useState(false);

  // Search Bar State
  const [keyword, setKeyword] = useState('');
  const [selectedArea, setSelectedArea] = useState('');

  useEffect(() => {
    let isMounted = true;
    const loadHomeData = async () => {
      try {
        const [catRes, provRes] = await Promise.all([
          categoryService.getCategories(),
          providerService.getProviders({ limit: 4, sort: 'rating' }),
        ]);
        if (isMounted) {
          setCategories(catRes.data || []);
          setFeaturedProviders(provRes.data || []);
        }
      } catch (err) {
        console.error('Failed to load homepage data', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadHomeData();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (keyword.trim()) params.set('q', keyword.trim());
    if (selectedArea) params.set('area', selectedArea);
    params.set('city', 'dera-ismail-khan');
    navigate(`${ROUTES.SEARCH}?${params.toString()}`);
  };

  const handleSuggestionClick = (term) => {
    navigate(`${ROUTES.SEARCH}?q=${encodeURIComponent(term)}&city=dera-ismail-khan`);
  };

  return (
    <div className="home-page">
      {/* 1. HERO SECTION */}
      <section className="hero-section" aria-labelledby="hero-heading">
        <div className="container hero-container">
          <div className="hero-badge">
            <FaMapMarkerAlt aria-hidden="true" />
            <span>Dedicated to Dera Ismail Khan, KP</span>
          </div>

          <h1 id="hero-heading" className="hero-headline">
            Find the Right Service, <span className="highlight-text">Near You.</span>
          </h1>

          <p className="hero-subheading">
            Connect with trusted local professionals for your home, vehicle, business, and everyday service needs.
          </p>

          {/* Unified Local Search Bar */}
          <form className="hero-search-box" onSubmit={handleSearchSubmit} role="search">
            <div className="search-field-group">
              <label htmlFor="hero-service-input" className="search-field-label">
                What service do you need?
              </label>
              <div className="search-field-input-wrap">
                <FaSearch className="field-icon" aria-hidden="true" />
                <input
                  id="hero-service-input"
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="e.g. Plumber, Electrician, AC Repair…"
                  className="search-input"
                />
              </div>
            </div>

            <div className="search-field-divider" aria-hidden="true" />

            <div className="search-field-group">
              <label htmlFor="hero-area-select" className="search-field-label">
                Where do you need the service?
              </label>
              <div className="search-field-input-wrap">
                <FaMapMarkerAlt className="field-icon" aria-hidden="true" />
                <select
                  id="hero-area-select"
                  value={selectedArea}
                  onChange={(e) => setSelectedArea(e.target.value)}
                  className="search-select"
                >
                  <option value="">Any Area in D.I. Khan</option>
                  {DI_KHAN_AREAS.map((area) => (
                    <option key={area} value={area}>
                      {area}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="hero-search-btn"
              icon={<FaSearch />}
            >
              Find a Professional
            </Button>
          </form>

          {/* Quick chip examples */}
          <div className="hero-suggestions">
            <span className="suggestions-label">Popular in Dera:</span>
            <div className="suggestions-chips">
              {SEARCH_SUGGESTIONS.map((term) => (
                <button
                  type="button"
                  key={term}
                  className="suggestion-chip"
                  onClick={() => handleSuggestionClick(term)}
                >
                  {term}
                </button>
              ))}
            </div>
          </div>

          {/* Secondary CTA */}
          <div className="hero-secondary-cta">
            <span>Are you a skilled technician or craftsman in D.I. Khan?</span>
            <Link to={ROUTES.REGISTER} className="join-pro-link">
              Join as a Professional <FaArrowRight aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* 2. VALUE / TRUST PROPOSITION BAR */}
      <section className="trust-strip" aria-label="Why choose D.I. Khan Service Finder">
        <div className="container trust-strip-grid">
          <div className="trust-item">
            <div className="trust-icon" aria-hidden="true">
              <FaUserCheck />
            </div>
            <div>
              <strong>Verified Local Professionals</strong>
              <p>Direct contacts of experienced tradespeople operating across D.I. Khan.</p>
            </div>
          </div>

          <div className="trust-item">
            <div className="trust-icon" aria-hidden="true">
              <FaShieldAlt />
            </div>
            <div>
              <strong>Fair Local Pricing</strong>
              <p>Transparent starting rates in PKR with no hidden middleman markups.</p>
            </div>
          </div>

          <div className="trust-item">
            <div className="trust-icon" aria-hidden="true">
              <FaPhoneAlt />
            </div>
            <div>
              <strong>Direct Call or Request</strong>
              <p>Call professionals directly or post a detailed job request for callbacks.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CATEGORIES SECTION */}
      <section className="container page-section" aria-labelledby="categories-heading">
        <div className="section-header-row">
          <div>
            <h2 id="categories-heading" className="section-title">
              Explore Service Categories
            </h2>
            <p className="section-subtitle">
              From household repairs to automotive breakdowns and solar installations.
            </p>
          </div>
          <Link to={ROUTES.SERVICES} className="section-view-all">
            Browse all services <FaArrowRight aria-hidden="true" />
          </Link>
        </div>

        <div className="categories-grid">
          {isLoading ? (
            <SkeletonCard count={5} type="provider" />
          ) : (
            categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))
          )}
        </div>
      </section>

      {/* 4. FEATURED VERIFIED PROVIDERS */}
      <section className="featured-providers-section" aria-labelledby="featured-heading">
        <div className="container page-section">
          <div className="section-header-row">
            <div>
              <h2 id="featured-heading" className="section-title">
                Trusted Professionals in D.I. Khan
              </h2>
              <p className="section-subtitle">
                Highly rated technicians ready to assist you today.
              </p>
            </div>
            <Link to={ROUTES.PROVIDERS} className="section-view-all">
              View all professionals <FaArrowRight aria-hidden="true" />
            </Link>
          </div>

          <div className="providers-grid">
            {isLoading ? (
              <SkeletonCard count={4} type="provider" />
            ) : (
              featuredProviders.map((provider) => (
                <ProviderCard key={provider.id} provider={provider} />
              ))
            )}
          </div>
        </div>
      </section>

      {/* 5. HOW IT WORKS */}
      <section id="how-it-works" className="container page-section" aria-labelledby="hiw-heading">
        <div className="text-center hiw-header">
          <h2 id="hiw-heading" className="section-title">
            How It Works
          </h2>
          <p className="section-subtitle">
            Hiring a reliable technician in Dera Ismail Khan has never been this simple.
          </p>
        </div>

        <div className="hiw-steps-grid">
          <div className="hiw-step-card">
            <div className="hiw-step-number">1</div>
            <div className="hiw-step-icon" aria-hidden="true">
              <FaSearch />
            </div>
            <h3 className="hiw-step-title">1. Search or Request</h3>
            <p className="hiw-step-desc">
              Search by service type and area in Dera Ismail Khan, or post your job details (water leakage, AC gas, wiring).
            </p>
          </div>

          <div className="hiw-step-card">
            <div className="hiw-step-number">2</div>
            <div className="hiw-step-icon" aria-hidden="true">
              <FaRegHandshake />
            </div>
            <h3 className="hiw-step-title">2. Compare & Contact</h3>
            <p className="hiw-step-desc">
              Review genuine customer ratings, experience, starting prices, and call the professional directly.
            </p>
          </div>

          <div className="hiw-step-card">
            <div className="hiw-step-number">3</div>
            <div className="hiw-step-icon" aria-hidden="true">
              <FaCheckCircle />
            </div>
            <h3 className="hiw-step-title">3. Job Done & Reviewed</h3>
            <p className="hiw-step-desc">
              The technician arrives at your doorstep, completes the work, and you can leave a verified review.
            </p>
          </div>
        </div>
      </section>

      {/* 6. CALL TO ACTION FOR PROVIDERS */}
      <section className="container page-section">
        <div className="pro-cta-card">
          <div className="pro-cta-content">
            <span className="pro-cta-badge">For Technicians & Craftsmen</span>
            <h2 className="pro-cta-title">
              Grow Your Business in Dera Ismail Khan
            </h2>
            <p className="pro-cta-desc">
              Join dozens of plumbers, electricians, mechanics, and technicians receiving daily customer calls and service requests across D.I. Khan.
            </p>
            <div className="pro-cta-buttons">
              <Button
                variant="amber"
                size="lg"
                onClick={() => navigate(ROUTES.REGISTER)}
              >
                Join as a Professional
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate(ROUTES.PROVIDERS)}
                className="btn-pro-see"
              >
                Browse Current Listings
              </Button>
            </div>
          </div>
          <div className="pro-cta-icon-decor" aria-hidden="true">
            <FaTools />
          </div>
        </div>
      </section>
    </div>
  );
}
