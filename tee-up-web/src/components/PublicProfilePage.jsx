import { useState, useEffect } from 'react';
import { Star, User, UserPlus, ChevronLeft } from 'lucide-react';
import UserHeader from './UserHeader';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Alert } from './ui/alert';
import { getPublicUserProfile, getUserRatings } from '../api/usersApi';
import { getListings } from '../api/userListingsApi';
import { getFollowStatus } from '../api/followerApi';
import ListingSearchFilters from './ListingSearchFilters';
import PriceDisplay from './PriceDisplay';
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
  onViewAllNotifications,
  onNotificationClick,
  onOpenProfile,
  onLogout,
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
  const [followLoading, setFollowLoading] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
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

  useEffect(() => {
    if (!profileUserId || activeTab !== 'reviews') return;
    setReviewsLoading(true);
    getUserRatings(profileUserId)
      .then((data) => setReviews(Array.isArray(data) ? data : []))
      .catch(() => setReviews([]))
      .finally(() => setReviewsLoading(false));
  }, [profileUserId, activeTab]);

  useEffect(() => {
    if (!profileUserId || !currentUser?.id) return;
    let cancelled = false;
    getFollowStatus(profileUserId)
      .then((res) => {
        if (!cancelled) setFollowing(Boolean(res?.isFollowing));
      })
      .catch(() => {
        if (!cancelled) setFollowing(false);
      });
    return () => {
      cancelled = true;
    };
  }, [profileUserId, currentUser?.id]);

  const handleFollow = async () => {
    if (followLoading) return;
    setActionError(null);
    const nextFollowing = !following;
    setFollowLoading(true);
    try {
      await onFollowUser?.(profileUserId, nextFollowing);
      setFollowing(nextFollowing);
    } catch (err) {
      setActionError(err?.message ?? 'Failed to update follow status.');
    } finally {
      setFollowLoading(false);
    }
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
          onViewAllNotifications={onViewAllNotifications}
          onNotificationClick={onNotificationClick}
          onOpenProfile={onOpenProfile}
          onLogout={onLogout}
          onGoHome={onGoHome}
        />
        <main className="profile-page-main">
          <div className="profile-page-container">
            {actionError ? <Alert variant="destructive">{actionError}</Alert> : null}
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
        onViewAllNotifications={onViewAllNotifications}
        onNotificationClick={onNotificationClick}
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
                  variant={following ? 'secondary' : 'outline'}
                  size="default"
                  className="profile-hero-btn"
                  onClick={handleFollow}
                  disabled={followLoading}
                >
                  <UserPlus className="h-4 w-4" />
                  {followLoading ? 'Please wait…' : following ? 'Following' : 'Follow'}
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
                          <PriceDisplay
                            listing={listing}
                            className="profile-listing-price"
                            currentClassName="profile-listing-price-current"
                            originalClassName="profile-listing-price-original"
                          />
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
              reviewsLoading ? (
                <p className="profile-content-muted">Loading reviews…</p>
              ) : reviews.length === 0 ? (
                <p className="profile-content-muted">No reviews yet for this seller.</p>
              ) : (
                <div className="profile-reviews-list">
                  {reviews.map((review, idx) => {
                    const ratingValue = Number(review.rating || 0);
                    const dateText = review.created_at
                      ? new Date(review.created_at).toLocaleDateString()
                      : 'Recently';
                    return (
                      <article className="profile-review-card" key={`${review.created_at || idx}-${idx}`}>
                        <div className="profile-review-header">
                          <div className="profile-reviewer">
                            <Avatar className="profile-review-avatar">
                              <AvatarImage src={review.reviewer_profile_image} alt={review.reviewer_name || 'Reviewer'} />
                              <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="profile-reviewer-name">{review.reviewer_name || `Buyer ${idx + 1}`}</p>
                              <p className="profile-review-date">{dateText}</p>
                            </div>
                          </div>
                          <div className="profile-review-rating">
                            <Star className="h-4 w-4 profile-review-star" />
                            {ratingValue.toFixed(1)}
                          </div>
                        </div>
                        <p className="profile-review-text">
                          {review.review?.trim() ? review.review : 'No written review provided.'}
                        </p>
                      </article>
                    );
                  })}
                </div>
              )
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
