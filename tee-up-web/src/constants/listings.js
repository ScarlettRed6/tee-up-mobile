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
  { value: 'pending', label: 'Draft' },
  { value: 'sold', label: 'Sold' },
];

/** Saved via "Save draft" — stored as `pending` in the database. */
export const DRAFT_LISTING_STATUS = 'pending';

export function isDraftListingStatus(status) {
  return String(status || '').trim().toLowerCase() === DRAFT_LISTING_STATUS;
}
