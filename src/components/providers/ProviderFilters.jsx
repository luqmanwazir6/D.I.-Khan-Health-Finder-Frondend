import { FaFilter, FaRedo } from 'react-icons/fa';
import { CATEGORIES_DATA, DI_KHAN_AREAS } from '@/constants/data';
import Select from '@/components/common/Select';
import Button from '@/components/common/Button';
import './ProviderFilters.css';

export default function ProviderFilters({
  filters,
  onChange,
  onReset,
  className = '',
}) {
  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    ...CATEGORIES_DATA.map((c) => ({ value: c.id, label: c.name })),
  ];

  const areaOptions = [
    { value: 'all', label: 'All Areas in D.I. Khan' },
    ...DI_KHAN_AREAS.map((a) => ({ value: a, label: a })),
  ];

  const ratingOptions = [
    { value: '0', label: 'Any Rating' },
    { value: '4.8', label: '★ 4.8 & above (Top Rated)' },
    { value: '4.5', label: '★ 4.5 & above' },
    { value: '4.0', label: '★ 4.0 & above' },
  ];

  const sortOptions = [
    { value: 'rating', label: 'Highest Rated' },
    { value: 'experience', label: 'Most Experienced' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
    { value: 'reviews', label: 'Most Reviewed' },
  ];

  const availabilityOptions = [
    { value: 'all', label: 'Any Availability' },
    { value: 'today', label: 'Available Today' },
  ];

  const handleFieldChange = (field, value) => {
    onChange({ ...filters, [field]: value });
  };

  return (
    <div className={`provider-filters-panel ${className}`}>
      <div className="filters-header">
        <h3 className="filters-title">
          <FaFilter aria-hidden="true" />
          <span>Filters</span>
        </h3>
        <button
          type="button"
          onClick={onReset}
          className="filters-reset-btn"
          title="Reset all filters"
        >
          <FaRedo aria-hidden="true" /> Reset
        </button>
      </div>

      <div className="filters-body">
        {/* Category */}
        <Select
          label="Category"
          name="category"
          value={filters.category || 'all'}
          options={categoryOptions}
          placeholder=""
          onChange={(e) => handleFieldChange('category', e.target.value)}
        />

        {/* Area */}
        <Select
          label="Area in D.I. Khan"
          name="area"
          value={filters.area || 'all'}
          options={areaOptions}
          placeholder=""
          onChange={(e) => handleFieldChange('area', e.target.value)}
        />

        {/* Minimum Rating */}
        <Select
          label="Minimum Rating"
          name="rating"
          value={filters.rating || '0'}
          options={ratingOptions}
          placeholder=""
          onChange={(e) => handleFieldChange('rating', e.target.value)}
        />

        {/* Availability */}
        <Select
          label="Availability"
          name="availability"
          value={filters.availability || 'all'}
          options={availabilityOptions}
          placeholder=""
          onChange={(e) => handleFieldChange('availability', e.target.value)}
        />

        {/* Sort By */}
        <Select
          label="Sort By"
          name="sort"
          value={filters.sort || 'rating'}
          options={sortOptions}
          placeholder=""
          onChange={(e) => handleFieldChange('sort', e.target.value)}
        />

        {/* Verified checkbox */}
        <div className="filter-checkbox-row">
          <label className="filter-checkbox-label">
            <input
              type="checkbox"
              checked={filters.verified === 'true' || filters.verified === true}
              onChange={(e) => handleFieldChange('verified', e.target.checked ? 'true' : '')}
            />
            <span>Verified Professionals only</span>
          </label>
        </div>
      </div>
    </div>
  );
}
