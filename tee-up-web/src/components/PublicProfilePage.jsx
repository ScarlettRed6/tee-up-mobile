import { useState, useEffect } from 'react';
import { Star, User, MessageCircle, UserPlus, ChevronLeft } from 'lucide-react';
import UserHeader from './UserHeader';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Alert } from './ui/alert';
import { getPublicUserProfile } from '../api/usersApi';
import { getListings } from '../api/userListingsApi';
import ListingSearchFilters from './ListingSearchFilters';
import { cn } from '@/lib/utils';
import './ProfilePage.css';

const TABS = [
  { id: 'listings', label: 'My Listings' },
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

export default function PublicProfilePage({
  profileUserId,
  currentUser,
  onBack,
  onSearch,
  onSell,
  onMessages,
  onMyListings,
  onNotifications,
  onOpenProfile,
  onLogout,
  onMessageUser,
  onFollowUser,
  onViewListing,
  onGoHome,
}) {
  const [profile, setProfile] = useState(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('listings');
  const [following, setFollowing] = useState(false);
  const [listingsSearch, setListingsSearch] = useState('');
  const [listingsCategory, setListingsCategory] = useState('');
  const [listingsSort, setListingsSort] = useState('newest');

  useEffect(() => {
    if (!profileUserId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    getPublicUserProfile(profileUserId)
      .then(setProfile)
      .catch((err) => {
        setError(err?.message ?? 'Failed to load profile');
        setProfile(null);
      })
      .finally(() => setLoading(false));
  }, [profileUserId]);

  useEffect(() => {
    if (!profileUserId || activeTab !== 'listings') return;
    setLoading(true);
    const params = { user_id: profileUserId, status: 'available', sort: listingsSort || 'newest' };
    if (listingsSearch.trim()) params.search = listingsSearch.trim();
    if (listingsCategory) params.category = listingsCategory;
    getListings(params)
      .then((d) => setListings(Array.isArray(d) ? d.map(normalizeListing) : []))
      .catch(() => setListings([]))
      .finally(() => setLoading(false));
  }, [profileUserId, activeTab, listingsSearch, listingsCategory, listingsSort]);

  const handleFollow = () => {
    setFollowing((prev) => !prev);
    onFollowUser?.(profileUserId, !following);
  };

  if (!profileUserId) return null;

  if (error && !profile) {
    return (
      <div className="profile-page">
        <UserHeader
          user={currentUser}
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
            {onBack && (
              <Button variant="ghost" size="sm" className="profile-back-link" onClick={onBack}>
                <ChevronLeft className="h-4 w-4" /> Back
              </Button>
            )}
            <Alert variant="destructive">{error}</Alert>
          </div>
        </main>
      </div>
    );
  }

  const displayName = profile?.name || 'User';
  const memberSince = formatMemberSince(profile?.created_at) || '—';
  const rating = profile?.rating != null ? Number(profile.rating).toFixed(1) : '—';
  const reviewsCount = profile?.total_ratings ?? 0;
  const activeItemsCount = profile?.active_listings ?? listings.length;

  return (
    <div className="profile-page">
      <UserHeader
        user={currentUser}
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
          {onBack && (
            <Button variant="ghost" size="sm" className="profile-back-link" onClick={onBack}>
              <ChevronLeft className="h-4 w-4" /> Back
            </Button>
          )}

          <div className="profile-hero">
            <div className="profile-hero-inner">
              <div className="profile-avatar-wrap">
                <Avatar className="profile-avatar">
                  <AvatarImage src={profile?.profile_image} alt={displayName} />
                  <AvatarFallback><User className="h-12 w-12" /></AvatarFallback>
                </Avatar>
              </div>
              <div className="profile-hero-text">
                <h1 className="profile-hero-name">{displayName}</h1>
                <div className="profile-hero-rating">
                  <Star className="profile-hero-star" aria-hidden />
                  {rating} ({reviewsCount} reviews)
                </div>
                <p className="profile-hero-meta">
                  Verified Seller · Member since {memberSince}
                </p>
              </div>
              <div className="profile-hero-actions public-profile-actions">
                <Button
                  variant="outline"
                  size="default"
                  className="profile-hero-btn"
                  onClick={() => onMessageUser?.(profileUserId)}
                >
                  <MessageCircle className="h-4 w-4" />
                  Message
                </Button>
                <Button
                  variant={following ? 'secondary' : 'outline'}
                  size="default"
                  className="profile-hero-btn"
                  onClick={handleFollow}
                >
                  <UserPlus className="h-4 w-4" />
                  {following ? 'Following' : 'Follow'}
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
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={cn('profile-tab', activeTab === tab.id && 'profile-tab-active')}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
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
                  placeholder="Search this seller's listings…"
                />
                <div className="profile-listings-grid">
                {loading ? (
                  <p className="profile-content-muted">Loading…</p>
                ) : listings.length === 0 ? (
                  <p className="profile-content-muted">No active listings.</p>
                ) : (
                  listings.map((listing) => {
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
                            variant="outline"
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
            {activeTab === 'reviews' && (
              <p className="profile-content-muted">Reviews for this seller will appear here.</p>
            )}
            {activeTab === 'about' && (
              <p className="profile-content-muted">{profile?.bio || 'No bio yet.'}</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
