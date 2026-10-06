import { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FaUserTie, FaFilter, FaRedo } from 'react-icons/fa';
import useDocumentTitle from '@/hooks/useDocumentTitle';
import { providerService } from '@/services/providerService';
import { PROVIDERS_DATA } from '@/constants/data';
import ProviderCard from '@/components/providers/ProviderCard';
import ProviderFilters from '@/components/providers/ProviderFilters';
import SkeletonCard from '@/components/common/SkeletonCard';
import { EmptyState, ErrorState } from '@/components/common/FeedbackStates';
import './ProvidersPage.css';

export default function ProvidersPage() {
  useDocumentTitle('Find Local Professionals');
  const [searchParams, setSearchParams] = useSearchParams();

  // Extract filter parameters from URL
  const filters = useMemo(() => ({
    category: searchParams.get('category') || 'all',
    service: searchParams.get('service') || 'all',
    area: searchParams.get('area') || 'all',
    rating: searchParams.get('rating') || '0',
    availability: searchParams.get('availability') || 'all',
    verified: searchParams.get('verified') || '',
    sort: searchParams.get('sort') || 'rating',
    q: searchParams.get('q') || '',
  }), [searchParams]);

  const [providers, setProviders] = useState(PROVIDERS_DATA);
  const [pagination, setPagination] = useState({ page: 1, total: PROVIDERS_DATA.length });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const isFirstMount = useRef(true);

  useEffect(() => {
    let isMounted = true;
    const fetchProviders = async () => {
      if (!isFirstMount.current) {
        setIsLoading(true);
      }
      isFirstMount.current = false;
      setError(null);
      try {
        const res = await providerService.getProviders({
          ...filters,
          page: 1,
          limit: 12,
        });
        if (isMounted) {
          setProviders(res.data || []);
          setPagination(res.pagination || { page: 1, total: res.data?.length || 0 });
        }
      } catch (err) {
        if (isMounted) setError(err.message || 'Failed to load professionals');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchProviders();
    return () => {
      isMounted = false;
    };
  }, [filters]);

  const handleFilterChange = (newFilters) => {
    const nextParams = new URLSearchParams();
    Object.entries(newFilters).forEach(([key, val]) => {
      if (val && val !== 'all' && val !== '0') {
        nextParams.set(key, val);
      }
    });
    setSearchParams(nextParams);
    setShowMobileFilters(false);
  };

  const handleResetFilters = () => {
    setSearchParams(new URLSearchParams());
    setShowMobileFilters(false);
  };

  return (
    <div className="providers-page">
      {/* Page Header */}
      <section className="providers-header-band">
        <div className="container">
          <div className="providers-header-content">
            <h1 className="providers-page-title">
              Local Service Professionals in D.I. Khan
            </h1>
            <p className="providers-page-subtitle">
              Browse trusted, verified technicians and artisans. Compare reviews, check rates, and contact directly.
            </p>
          </div>
        </div>
      </section>

      {/* Main Layout */}
      <div className="container page-section providers-layout-grid">
        {/* Mobile filter toggle */}
        <div className="mobile-filter-bar">
          <button
            type="button"
            className="btn-toggle-filters"
            onClick={() => setShowMobileFilters((prev) => !prev)}
            aria-expanded={showMobileFilters}
          >
            <FaFilter aria-hidden="true" />
            <span>Filters & Sorting</span>
          </button>
          <span className="results-count-pill">
            {pagination.total} Professional{pagination.total === 1 ? '' : 's'}
          </span>
        </div>

        {/* Sidebar filters */}
        <aside className={`filters-sidebar-col ${showMobileFilters ? 'open' : ''}`}>
          <ProviderFilters
            filters={filters}
            onChange={handleFilterChange}
            onReset={handleResetFilters}
          />
        </aside>

        {/* Providers list */}
        <main className="providers-list-col">
          <div className="providers-results-meta">
            <h2>
              {filters.category !== 'all' ? `Category: ${filters.category}` : 'All Professionals'}
              {filters.area !== 'all' ? ` in ${filters.area}` : ''}
            </h2>
            <span className="results-total-text">
              Showing {providers.length} of {pagination.total} results
            </span>
          </div>

          {isLoading ? (
            <div className="providers-cards-stack">
              <SkeletonCard count={4} type="provider" />
            </div>
          ) : error ? (
            <ErrorState
              title="Could not load professionals"
              message={error}
              onRetry={() => handleFilterChange(filters)}
            />
          ) : providers.length === 0 ? (
            <EmptyState
              icon={<FaUserTie />}
              title="No professionals found"
              message="No local professionals match your specific filter criteria in Dera Ismail Khan. Try clearing your filters or selecting a different area."
              actionLabel="Clear all filters"
              onAction={handleResetFilters}
            />
          ) : (
            <div className="providers-cards-stack">
              {providers.map((provider) => (
                <ProviderCard key={provider.id} provider={provider} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
