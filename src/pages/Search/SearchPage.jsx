import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FaSearch, FaFilter, FaTimes, FaMapMarkerAlt } from 'react-icons/fa';
import useDocumentTitle from '@/hooks/useDocumentTitle';
import { providerService } from '@/services/providerService';
import { PROVIDERS_DATA } from '@/constants/data';
import ProviderCard from '@/components/providers/ProviderCard';
import ProviderFilters from '@/components/providers/ProviderFilters';
import SkeletonCard from '@/components/common/SkeletonCard';
import { EmptyState, ErrorState } from '@/components/common/FeedbackStates';
import Button from '@/components/common/Button';
import './SearchPage.css';

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Read URL query parameters
  const query = searchParams.get('q') || '';
  const category = searchParams.get('category') || 'all';
  const service = searchParams.get('service') || 'all';
  const area = searchParams.get('area') || 'all';
  const rating = searchParams.get('rating') || '0';
  const availability = searchParams.get('availability') || 'all';
  const verified = searchParams.get('verified') || '';
  const sort = searchParams.get('sort') || 'rating';

  const [inputVal, setInputVal] = useState(query);
  const [providers, setProviders] = useState(PROVIDERS_DATA);
  const [pagination, setPagination] = useState({ page: 1, total: PROVIDERS_DATA.length });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const isFirstMount = useRef(true);

  useDocumentTitle(query ? `Search: “${query}”` : 'Search Services in D.I. Khan');

  // Sync internal input with URL if URL changes
  useEffect(() => {
    setInputVal(query);
  }, [query]);

  // Execute query against providerService
  useEffect(() => {
    let isMounted = true;
    const executeSearch = async () => {
      if (!isFirstMount.current) {
        setIsLoading(true);
      }
      isFirstMount.current = false;
      setError(null);
      try {
        const res = await providerService.getProviders({
          q: query,
          category,
          service,
          area,
          rating,
          availability,
          verified,
          sort,
          limit: 12,
        });
        if (isMounted) {
          setProviders(res.data || []);
          setPagination(res.pagination || { page: 1, total: res.data?.length || 0 });
        }
      } catch (err) {
        if (isMounted) setError(err.message || 'Search failed');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    executeSearch();
    return () => {
      isMounted = false;
    };
  }, [query, category, service, area, rating, availability, verified, sort]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const nextParams = new URLSearchParams(searchParams);
    if (inputVal.trim()) {
      nextParams.set('q', inputVal.trim());
    } else {
      nextParams.delete('q');
    }
    setSearchParams(nextParams);
  };

  const handleFilterChange = (newFilters) => {
    const nextParams = new URLSearchParams();
    if (query) nextParams.set('q', query);
    Object.entries(newFilters).forEach(([key, val]) => {
      if (val && val !== 'all' && val !== '0') {
        nextParams.set(key, val);
      }
    });
    setSearchParams(nextParams);
    setShowMobileFilters(false);
  };

  const handleResetFilters = () => {
    const nextParams = new URLSearchParams();
    if (query) nextParams.set('q', query);
    setSearchParams(nextParams);
    setShowMobileFilters(false);
  };

  const removeFilterTag = (key) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete(key);
    setSearchParams(nextParams);
  };

  // Determine active filter badges
  const activeFilters = [];
  if (category && category !== 'all') activeFilters.push({ key: 'category', label: `Category: ${category}` });
  if (area && area !== 'all') activeFilters.push({ key: 'area', label: `Area: ${area}` });
  if (rating && rating !== '0') activeFilters.push({ key: 'rating', label: `★ ${rating}+` });
  if (availability && availability !== 'all') activeFilters.push({ key: 'availability', label: 'Available Today' });
  if (verified === 'true') activeFilters.push({ key: 'verified', label: 'Verified Only' });

  return (
    <div className="search-page">
      {/* Header with Search Input */}
      <section className="search-header-strip">
        <div className="container">
          <form onSubmit={handleSearchSubmit} className="search-bar-form" role="search">
            <div className="search-input-field-wrap">
              <FaSearch className="search-bar-icon" aria-hidden="true" />
              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="Search by keyword, skill, or service (e.g. Plumber, Electrician, Motor, AC)…"
                className="search-bar-field"
                aria-label="Search keyword"
              />
              {inputVal && (
                <button
                  type="button"
                  className="search-clear-btn"
                  onClick={() => {
                    setInputVal('');
                    const p = new URLSearchParams(searchParams);
                    p.delete('q');
                    setSearchParams(p);
                  }}
                  aria-label="Clear keyword"
                >
                  <FaTimes aria-hidden="true" />
                </button>
              )}
            </div>
            <Button type="submit" variant="primary" icon={<FaSearch />}>
              Search
            </Button>
          </form>

          {/* Active filter tags */}
          {activeFilters.length > 0 && (
            <div className="active-filters-chips">
              <span className="chips-label">Active filters:</span>
              {activeFilters.map((flt) => (
                <span key={flt.key} className="filter-chip">
                  <span>{flt.label}</span>
                  <button
                    type="button"
                    onClick={() => removeFilterTag(flt.key)}
                    aria-label={`Remove filter ${flt.label}`}
                  >
                    ×
                  </button>
                </span>
              ))}
              <button
                type="button"
                className="clear-all-chips-btn"
                onClick={handleResetFilters}
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Main Content Layout */}
      <div className="container page-section search-layout-grid">
        <div className="mobile-search-filter-toggle">
          <Button
            variant="outline"
            size="sm"
            icon={<FaFilter />}
            onClick={() => setShowMobileFilters((prev) => !prev)}
          >
            Filters & Sorting
          </Button>
          <span className="results-count-text">
            {pagination.total} result{pagination.total === 1 ? '' : 's'} found
          </span>
        </div>

        {/* Sidebar */}
        <aside className={`search-sidebar ${showMobileFilters ? 'open' : ''}`}>
          <ProviderFilters
            filters={{ category, service, area, rating, availability, verified, sort }}
            onChange={handleFilterChange}
            onReset={handleResetFilters}
          />
        </aside>

        {/* Results */}
        <main className="search-results-main">
          <div className="search-results-header-info">
            <h1 className="search-results-h1">
              {query ? `Search Results for “${query}”` : 'All Services & Professionals'}
            </h1>
            <span className="results-counter">
              Showing {providers.length} of {pagination.total} professionals in D.I. Khan
            </span>
          </div>

          {isLoading ? (
            <div className="search-cards-stack">
              <SkeletonCard count={4} type="provider" />
            </div>
          ) : error ? (
            <ErrorState
              title="Search encountered an error"
              message={error}
              onRetry={handleResetFilters}
            />
          ) : providers.length === 0 ? (
            <EmptyState
              title="No results match your search"
              message={`We found no professionals matching your search criteria in Dera Ismail Khan.`}
              actionLabel="Reset Search & Filters"
              onAction={() => {
                setInputVal('');
                setSearchParams(new URLSearchParams());
              }}
            />
          ) : (
            <div className="search-cards-stack">
              {providers.map((p) => (
                <ProviderCard key={p.id} provider={p} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
