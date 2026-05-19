import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft } from 'lucide-react';
import { getListings } from '../api/userListingsApi';
import UserHeader from './UserHeader';
import ListingCard from './ListingCard';
import ListingSearchFilters from './ListingSearchFilters';
import { Button } from './ui/button';
import { Alert } from './ui/alert';
import { Skeleton } from './ui/skeleton';
import './MyListings.css';

function normalizeListing(item) {
  const photos = item.photos != null
    ? (Array.isArray(item.photos) ? item.photos : (typeof item.photos === 'string' ? (() => { try { return JSON.parse(item.photos); } catch { return []; } })() : []))
    : [];
  return {
    ...item,
    id: item.listing_id ?? item.id,
    listing_id: item.listing_id ?? item.id,
    photos,
  };
}

export default function MyListings({
  user,
  onBack,
  onSelectListing,
  onSearch,
  onSell,
  onMessages,
  onMyListings,
  onNotifications,
  onViewAllNotifications,
  onNotificationClick,
  onOpenProfile,
  onLogout,
  onGoHome,
}) {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('newest');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchListings = useCallback(() => {
    if (!user?.id) {
      setListings([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const params = {
      user_id: user.id,
      sort: sort || 'newest',
    };
    if (search.trim()) params.search = search.trim();
    if (category) params.category = category;
    if (statusFilter) params.status = statusFilter;
    getListings(params)
      .then((data) => setListings(Array.isArray(data) ? data.map(normalizeListing) : []))
      .catch((err) => setError(err?.message ?? 'Failed to load your listings'))
      .finally(() => setLoading(false));
  }, [user?.id, search, category, sort, statusFilter]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  return (
    <div className="my-listings" style={{ backgroundColor: 'var(--color-background)' }}>
      <UserHeader
        user={user}
        onSearch={onSearch}
        onSell={onSell}
        onMessages={onMessages}
        onMyListings={onMyListings}
        onNotifications={onNotifications}
        onViewAllNotifications={onViewAllNotifications}
        onNotificationClick={onNotificationClick}
        onOpenProfile={onOpenProfile}
        onLogout={onLogout}
        onGoHome={onGoHome}
      />
      <main className="my-listings-main">
        <div className="my-listings-container">
          <Button variant="ghost" size="sm" className="my-listings-back" onClick={onBack}>
            <ChevronLeft className="h-4 w-4" /> Back to home
          </Button>
          <h1 className="my-listings-title">My Listings</h1>

          <ListingSearchFilters
            search={search}
            onSearchChange={setSearch}
            category={category}
            onCategoryChange={setCategory}
            sort={sort}
            onSortChange={setSort}
            showStatusFilter
            status={statusFilter}
            onStatusChange={setStatusFilter}
            placeholder="Search your listings…"
          />

          {error && (
            <Alert variant="destructive" className="app-page-alert my-listings-error">{error}</Alert>
          )}

          {loading ? (
            <div className="my-listings-grid">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="my-listings-card-skeleton" />
              ))}
            </div>
          ) : listings.length === 0 ? (
            <p className="my-listings-empty">You haven&apos;t listed anything yet.</p>
          ) : (
            <div className="my-listings-grid">
              {listings.map((listing) => (
                <ListingCard
                  key={listing.listing_id ?? listing.id}
                  listing={listing}
                  tagline={listing.seller_name}
                  onClick={() => onSelectListing?.(String(listing.listing_id ?? listing.id))}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
