import { useState, useEffect } from 'react';
import { Star, User, Settings, ChevronLeft } from 'lucide-react';
import UserHeader from './UserHeader';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { getListings, getFavorites } from '../api/userListingsApi';
import { getProfileStats } from '../api/authApi';
import ListingSearchFilters from './ListingSearchFilters';
import { cn } from '@/lib/utils';
import './ProfilePage.css';

const TABS = [
  { id: 'listings', label: 'My Listings' },
  { id: 'drafts', label: 'Drafts', countKey: 'drafts' },
  { id: 'saved', label: 'Saved Items', countKey: 'saved' },
  { id: 'reviews', label: 'Reviews' },
  { id: 'about', label: 'About' },
];

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

function formatMemberSince(createdAt) {
  if (!createdAt) return null;
  const year = new Date(createdAt).getFullYear();
  return isNaN(year) ? null : year;
}

export default function ProfilePage({
  user,
  onBack,
  onSearch,
  onSell,
  onMessages,
  onMyListings,
  onNotifications,
  onOpenProfile,
  onLogout,
  onGoHome,
  onEditProfile,
  onSettings,
  onViewListing,
}) {
  const [activeTab, setActiveTab] = useState('listings');
  const [myListings, setMyListings] = useState([]);
  const [savedCount, setSavedCount] = useState(0);
  const [draftsCount, setDraftsCount] = useState(0);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [listingsSearch, setListingsSearch] = useState('');
  const [listingsCategory, setListingsCategory] = useState('');
  const [listingsSort, setListingsSort] = useState('newest');

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    Promise.all([
      getFavorites().then((d) => setSavedCount(Array.isArray(d) ? d.length : 0)),
      getListings({ user_id: user.id, status: 'pending' }).then((d) => setDraftsCount(Array.isArray(d) ? d.length : 0)),
      getProfileStats().then(setStats).catch(() => setStats(null)),
    ]).finally(() => { /* counts only */ });
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    const params = { user_id: user.id, status: 'available', sort: listingsSort || 'newest' };
    if (listingsSearch.trim()) params.search = listingsSearch.trim();
    if (listingsCategory) params.category = listingsCategory;
    getListings(params)
      .then((d) => setMyListings(Array.isArray(d) ? d.map(normalizeListing) : []))
      .finally(() => setLoading(false));
  }, [user?.id, listingsSearch, listingsCategory, listingsSort]);

  const activeItemsCount = stats?.active_listings ?? myListings.length;
  const reviewsCount = stats?.total_ratings ?? 0;
  const rating = stats?.rating != null ? Number(stats.rating).toFixed(1) : '—';
  const displayName = user?.name || 'User';
  const memberSince = formatMemberSince(user?.created_at) || '—';

  const tabsWithCount = TABS.map((t) => {
    if (t.countKey === 'drafts') return { ...t, count: draftsCount };
    if (t.countKey === 'saved') return { ...t, count: savedCount };
    return t;
  });

  return (
    <div className="profile-page">
      <UserHeader
        user={user}
        onSearch={onSearch}
        onSell={onSell}
        onMessages={onMessages}
        onMyListings={onMyListings}
        onNotifications={onNotifications}
        onOpenProfile={onOpenProfile}
        onLogout={onLogout}
        onGoHome={onGoHome}
      />

      <main className="profile-page-main">
        <div className="profile-page-container">
          <div className="profile-hero">
            <div className="profile-hero-inner">
              <div className="profile-avatar-wrap">
                <Avatar className="profile-avatar">
                  <AvatarImage src={user?.profile_image} alt={displayName} />
                  <AvatarFallback><User className="h-12 w-12" /></AvatarFallback>
                </Avatar>
              </div>
              <div className="profile-hero-text">
                <h1 className="profile-hero-name">
                  {displayName} <span className="profile-hero-you">(You)</span>
                </h1>
                <div className="profile-hero-rating">
                  <Star className="profile-hero-star" aria-hidden />
                  {rating} ({reviewsCount} reviews)
                </div>
                <p className="profile-hero-meta">
                  Verified Seller · Member since {memberSince}
                </p>
              </div>
              <div className="profile-hero-actions">
                <Button variant="secondary" size="default" className="profile-hero-btn" onClick={() => onEditProfile?.()}>
                  Edit Profile
                </Button>
                <Button variant="outline" size="default" className="profile-hero-btn" onClick={() => onSettings?.()}>
                  <Settings className="h-4 w-4" />
                  Settings
                </Button>
              </div>
            </div>
          </div>

          <div className="profile-stats">
            <div className="profile-stat-card">
              <div className="profile-stat-value">{loading ? '—' : activeItemsCount}</div>
              <p className="profile-stat-label">Active Items</p>
            </div>
            <div className="profile-stat-card">
              <div className="profile-stat-value">{reviewsCount}</div>
              <p className="profile-stat-label">Reviews</p>
            </div>
          </div>

          <div className="profile-tabs">
            {tabsWithCount.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={cn('profile-tab', activeTab === tab.id && 'profile-tab-active')}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
                {tab.count != null && tab.count > 0 && (
                  <span className="profile-tab-count">({tab.count})</span>
                )}
              </button>
            ))}
          </div>

          <div className="profile-content">
            {activeTab === 'listings' && (
              <>
                <ListingSearchFilters
                  search={listingsSearch}
                  onSearchChange={setListingsSearch}
                  category={listingsCategory}
                  onCategoryChange={setListingsCategory}
                  sort={listingsSort}
                  onSortChange={setListingsSort}
                  placeholder="Search your listings…"
                />
                <div className="profile-listings-grid">
                {loading ? (
                  <p className="profile-content-muted">Loading…</p>
                ) : myListings.length === 0 ? (
                  <p className="profile-content-muted">No active listings. Create one from + Sell.</p>
                ) : (
                  myListings.map((listing) => {
                    const photos = listing.photos ?? [];
                    const imageUrl = photos[0] || null;
                    const price = listing.price != null ? Number(listing.price) : 0;
                    const formattedPrice = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 0 }).format(price);
                    return (
                      <div key={listing.listing_id ?? listing.id} className="profile-listing-card">
                        <div className="profile-listing-image-wrap">
                          {imageUrl ? (
                            <img src={imageUrl} alt="" className="profile-listing-image" />
                          ) : (
                            <div className="profile-listing-image-placeholder">
                              <User className="h-10 w-10" />
                            </div>
                          )}
                        </div>
                        <div className="profile-listing-body">
                          <h3 className="profile-listing-title">{listing.title || 'Untitled'}</h3>
                          <p className="profile-listing-price">{formattedPrice}</p>
                          <Button
                            variant="secondary"
                            size="sm"
                            className="profile-listing-view-btn"
                            onClick={() => onViewListing?.(listing.listing_id ?? listing.id)}
                          >
                            View Listing
                          </Button>
                        </div>
                      </div>
                    );
                  })
                )}
                </div>
              </>
            )}
            {activeTab === 'drafts' && (
              <p className="profile-content-muted">Draft listings will appear here.</p>
            )}
            {activeTab === 'saved' && (
              <p className="profile-content-muted">Saved items are in the Saved Listings section on the home page.</p>
            )}
            {activeTab === 'reviews' && (
              <p className="profile-content-muted">Your reviews will appear here.</p>
            )}
            {activeTab === 'about' && (
              <p className="profile-content-muted">{user?.bio || 'Add a short bio in Edit Profile.'}</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
