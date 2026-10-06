import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FaSearch, FaThList, FaThLarge } from 'react-icons/fa';
import useDocumentTitle from '@/hooks/useDocumentTitle';
import { categoryService } from '@/services/categoryService';
import { serviceService } from '@/services/serviceService';
import { CATEGORIES_DATA, SERVICES_DATA } from '@/constants/data';
import ServiceCard from '@/components/services/ServiceCard';
import CategoryCard from '@/components/services/CategoryCard';
import SkeletonCard from '@/components/common/SkeletonCard';
import { EmptyState } from '@/components/common/FeedbackStates';
import './ServicesPage.css';

export default function ServicesPage() {
  useDocumentTitle('All Services');
  const [searchParams, setSearchParams] = useSearchParams();

  const activeCategory = searchParams.get('category') || 'all';
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [categories, setCategories] = useState(CATEGORIES_DATA);
  const [services, setServices] = useState(SERVICES_DATA);
  const [isLoading, setIsLoading] = useState(false);
  const isFirstMount = useRef(true);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      if (!isFirstMount.current) {
        setIsLoading(true);
      }
      isFirstMount.current = false;
      try {
        const [catRes, srvRes] = await Promise.all([
          categoryService.getCategories(),
          serviceService.getServices({
            category: activeCategory !== 'all' ? activeCategory : undefined,
            q: searchQuery || undefined,
          }),
        ]);
        if (isMounted) {
          setCategories(catRes.data || []);
          setServices(srvRes.data || []);
        }
      } catch (err) {
        console.error('Error loading services', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchData();
    return () => {
      isMounted = false;
    };
  }, [activeCategory, searchQuery]);

  const handleCategorySelect = (slug) => {
    const nextParams = new URLSearchParams(searchParams);
    if (slug === 'all') {
      nextParams.delete('category');
    } else {
      nextParams.set('category', slug);
    }
    setSearchParams(nextParams);
  };

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    const nextParams = new URLSearchParams(searchParams);
    if (val.trim()) {
      nextParams.set('q', val.trim());
    } else {
      nextParams.delete('q');
    }
    setSearchParams(nextParams);
  };

  return (
    <div className="services-page">
      {/* Header */}
      <section className="services-header-section">
        <div className="container">
          <h1 className="services-page-title">Services & Categories</h1>
          <p className="services-page-subtitle">
            Find skilled, verified local professionals across Dera Ismail Khan for repairs, maintenance, and home care.
          </p>

          {/* Quick search input */}
          <div className="services-search-input-wrap">
            <FaSearch className="services-search-icon" aria-hidden="true" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search services (e.g. Plumber, AC, Inverter, Painter)…"
              className="services-search-field"
              aria-label="Search services"
            />
          </div>

          {/* Category filter pills */}
          <div className="category-filter-pills" role="tablist" aria-label="Service categories">
            <button
              type="button"
              role="tab"
              aria-selected={activeCategory === 'all'}
              className={`cat-pill-btn ${activeCategory === 'all' ? 'active' : ''}`}
              onClick={() => handleCategorySelect('all')}
            >
              All Categories
            </button>
            {categories.map((c) => (
              <button
                type="button"
                key={c.id}
                role="tab"
                aria-selected={activeCategory === c.slug}
                className={`cat-pill-btn ${activeCategory === c.slug ? 'active' : ''}`}
                onClick={() => handleCategorySelect(c.slug)}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Grid */}
      <div className="container page-section">
        <div className="services-results-header">
          <h2>
            {activeCategory !== 'all'
              ? categories.find((c) => c.slug === activeCategory)?.name || 'Category Services'
              : 'All Available Services'}
          </h2>
          <span className="services-count-label">
            Showing {services.length} service{services.length === 1 ? '' : 's'}
          </span>
        </div>

        {isLoading ? (
          <div className="services-cards-grid">
            <SkeletonCard count={6} type="provider" />
          </div>
        ) : services.length === 0 ? (
          <EmptyState
            title="No services match your search"
            message={`We could not find any services matching "${searchQuery}". Try a different keyword.`}
            actionLabel="Reset Search"
            onAction={() => {
              setSearchQuery('');
              handleCategorySelect('all');
            }}
          />
        ) : (
          <div className="services-cards-grid">
            {services.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
