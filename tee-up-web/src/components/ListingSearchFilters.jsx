import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Input } from './ui/input';
import { getListingCategories } from '../api/userListingsApi';
import { LISTING_SORT_OPTIONS, LISTING_STATUS_FILTERS } from '../constants/listings';
import './ListingSearchFilters.css';

/**
 * Search + category + sort (and optional status) filters for listing grids.
 * Categories are loaded from the backend (GET /listings/categories).
 */
export default function ListingSearchFilters({
  search = '',
  onSearchChange,
  category = '',
  onCategoryChange,
  sort = 'newest',
  onSortChange,
  showStatusFilter = false,
  status = '',
  onStatusChange,
  placeholder = 'Search listings…',
  className = '',
}) {
  const [categories, setCategories] = useState([{ value: '', label: 'All categories' }]);

  useEffect(() => {
    getListingCategories()
      .then((list) => {
        const options = [{ value: '', label: 'All categories' }];
        if (Array.isArray(list) && list.length > 0) {
          list.forEach((name) => {
            const trimmed = name && String(name).trim();
            if (trimmed) options.push({ value: trimmed, label: trimmed });
          });
        }
        setCategories(options);
      })
      .catch(() => setCategories([{ value: '', label: 'All categories' }]));
  }, []);

  return (
    <div className={`listing-filters ${className}`}>
      <div className="listing-filters-search-wrap">
        <Search className="listing-filters-search-icon" aria-hidden />
        <Input
          type="search"
          placeholder={placeholder}
          value={search}
          onChange={(e) => onSearchChange?.(e.target.value)}
          className="listing-filters-search-input"
          aria-label="Search"
        />
      </div>
      <div className="listing-filters-selects">
        <label className="listing-filters-label">
          <span className="listing-filters-label-text">Category</span>
          <select
            className="listing-filters-select"
            value={category}
            onChange={(e) => onCategoryChange?.(e.target.value)}
            aria-label="Category"
          >
            {categories.map((opt) => (
              <option key={opt.value || 'all'} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </label>
        <label className="listing-filters-label">
          <span className="listing-filters-label-text">Sort</span>
          <select
            className="listing-filters-select"
            value={sort}
            onChange={(e) => onSortChange?.(e.target.value)}
            aria-label="Sort by"
          >
            {LISTING_SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </label>
        {showStatusFilter && (
          <label className="listing-filters-label">
            <span className="listing-filters-label-text">Status</span>
            <select
              className="listing-filters-select"
              value={status}
              onChange={(e) => onStatusChange?.(e.target.value)}
              aria-label="Status"
            >
              {LISTING_STATUS_FILTERS.map((opt) => (
                <option key={opt.value || 'all'} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </label>
        )}
      </div>
    </div>
  );
}
