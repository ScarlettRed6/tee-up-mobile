/**
 * Listing filter options aligned with backend GET /listings.
 * Categories come from backend GET /listings/categories (see ListingSearchFilters).
 * Sort and status options below.
 */

export const LISTING_SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'price_low_high', label: 'Price: low to high' },
  { value: 'price_high_low', label: 'Price: high to low' },
];

export const LISTING_STATUS_FILTERS = [
  { value: '', label: 'All statuses' },
  { value: 'available', label: 'Available' },
  { value: 'pending', label: 'Pending' },
  { value: 'sold', label: 'Sold' },
];
