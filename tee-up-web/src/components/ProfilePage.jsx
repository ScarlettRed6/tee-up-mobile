import { useState, useEffect, useMemo } from 'react';
import { Star, User, Settings, Camera } from 'lucide-react';
import UserHeader from './UserHeader';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { getListings, getFavorites } from '../api/userListingsApi';
import { changePassword, getProfileStats, updateProfile } from '../api/authApi';
import { Input } from './ui/input';
import { Label } from './ui/label';
import ListingSearchFilters from './ListingSearchFilters';
import { getUserRatings } from '../api/usersApi';
import { cn } from '@/lib/utils';
import { resolveMediaUrl } from '../utils/mediaUrl';
import PriceDisplay from './PriceDisplay';
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

const BIO_MAX_LENGTH = 200;

export default function ProfilePage({
  user,
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
  onGoHome,
  onEditProfile,
  onSettings,
  onViewListing,
}) {
  const [activeTab, setActiveTab] = useState('listings');
  const [myListings, setMyListings] = useState([]);
  const [savedItems, setSavedItems] = useState([]);
  const [savedCount, setSavedCount] = useState(0);
  const [draftsCount, setDraftsCount] = useState(0);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savedLoading, setSavedLoading] = useState(false);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [listingsSearch, setListingsSearch] = useState('');
  const [listingsCategory, setListingsCategory] = useState('');
  const [listingsSort, setListingsSort] = useState('newest');
  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editImageFile, setEditImageFile] = useState(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    setSavedLoading(true);
    Promise.all([
      getFavorites().catch(() => []),
      getListings({ user_id: user.id, status: 'pending' }).catch(() => []),
      getProfileStats().catch(() => null),
    ])
      .then(([favorites, drafts, statsRes]) => {
        const favArray = Array.isArray(favorites) ? favorites.map(normalizeListing) : [];
        setSavedItems(favArray);
        setSavedCount(favArray.length);

        const draftsArray = Array.isArray(drafts) ? drafts : [];
        setDraftsCount(draftsArray.length);

        setStats(statsRes);
      })
      .finally(() => {
        setSavedLoading(false);
      });
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

  useEffect(() => {
    if (!user?.id || activeTab !== 'reviews') return;
    setReviewsLoading(true);
    getUserRatings(user.id)
      .then((data) => setReviews(Array.isArray(data) ? data : []))
      .catch(() => setReviews([]))
      .finally(() => setReviewsLoading(false));
  }, [user?.id, activeTab]);

  const activeItemsCount = stats?.active_listings ?? myListings.length;
  const reviewsCount = stats?.total_ratings ?? 0;
  const rating = stats?.rating != null ? Number(stats.rating).toFixed(1) : '—';
  const displayName = user?.name || 'User';
  const memberSince = formatMemberSince(user?.created_at) || '—';
  const editImagePreview = useMemo(() => {
    if (editImageFile) return URL.createObjectURL(editImageFile);
    return user?.profile_image || null;
  }, [editImageFile, user?.profile_image]);

  useEffect(() => {
    return () => {
      if (editImageFile) URL.revokeObjectURL(editImagePreview);
    };
  }, [editImageFile, editImagePreview]);

  const openEditProfile = () => {
    setEditName(user?.name || '');
    setEditBio(user?.bio || '');
    setEditImageFile(null);
    setProfileError('');
    setPasswordOpen(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
    setPasswordError('');
    setPasswordSuccess('');
    setEditOpen(true);
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setProfileError('Please select an image file.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setProfileError('Image must be under 5MB.');
      return;
    }
    setProfileError('');
    setEditImageFile(file);
  };

  const handleSaveProfile = async () => {
    const trimmedName = editName.trim();
    const trimmedBio = editBio.trim();

    if (!trimmedName) {
      setProfileError('Name is required.');
      return;
    }
    if (trimmedName.length < 2) {
      setProfileError('Name must be at least 2 characters.');
      return;
    }
    if (trimmedBio.length > BIO_MAX_LENGTH) {
      setProfileError(`Bio cannot exceed ${BIO_MAX_LENGTH} characters.`);
      return;
    }

    setSavingProfile(true);
    setProfileError('');
    try {
      await updateProfile({
        name: trimmedName,
        bio: trimmedBio,
        profileImageFile: editImageFile,
      });
      await onEditProfile?.();
      setEditOpen(false);
    } catch (err) {
      setProfileError(
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        'Failed to update profile.'
      );
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    setPasswordError('');
    setPasswordSuccess('');

    if (!currentPassword.trim() || !newPassword.trim() || !confirmNewPassword.trim()) {
      setPasswordError('All password fields are required.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    setSavingPassword(true);
    try {
      await changePassword({
        currentPassword: currentPassword.trim(),
        newPassword: newPassword.trim(),
        confirmNewPassword: confirmNewPassword.trim(),
      });
      setPasswordSuccess('Password changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setPasswordOpen(false);
    } catch (err) {
      setPasswordError(
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        'Failed to change password.'
      );
    } finally {
      setSavingPassword(false);
    }
  };

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
        onViewAllNotifications={onViewAllNotifications}
        onNotificationClick={onNotificationClick}
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
                  <AvatarImage src={resolveMediaUrl(user?.profile_image)} alt={displayName} />
                  <AvatarFallback />
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
                <Button variant="secondary" size="default" className="profile-hero-btn" onClick={openEditProfile}>
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
              <>
                {savedLoading ? (
                  <p className="profile-content-muted">Loading saved items…</p>
                ) : savedItems.length === 0 ? (
                  <p className="profile-content-muted">
                    You haven&apos;t saved any items yet. Tap the heart on a listing to save it.
                  </p>
                ) : (
                  <div className="profile-listings-grid">
                    {savedItems.map((listing) => {
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
                    })}
                  </div>
                )}
              </>
            )}
            {activeTab === 'reviews' && (
              reviewsLoading ? (
                <p className="profile-content-muted">Loading reviews…</p>
              ) : reviews.length === 0 ? (
                <p className="profile-content-muted">No reviews yet.</p>
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
                              <AvatarImage src={resolveMediaUrl(review.reviewer_profile_image)} alt={review.reviewer_name || 'Reviewer'} />
                              <AvatarFallback />
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
              <p className="profile-content-muted">{user?.bio || 'Add a short bio in Edit Profile.'}</p>
            )}
          </div>
        </div>
      </main>
      {editOpen && (
        <div className="profile-edit-overlay" onClick={() => !savingProfile && setEditOpen(false)}>
          <div className="profile-edit-modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="profile-edit-title">Edit Profile</h3>
            <p className="profile-edit-subtitle">Update your public seller details.</p>
            {profileError ? (
              <div className="profile-edit-error">{profileError}</div>
            ) : null}

            <div className="profile-edit-image-wrap">
              <Avatar className="profile-edit-avatar">
                <AvatarImage src={editImagePreview || undefined} alt={editName || displayName} />
                <AvatarFallback />
              </Avatar>
              <label className="profile-edit-image-btn">
                <Camera className="h-4 w-4" />
                Change Photo
                <input type="file" accept="image/*" onChange={handleImageFileChange} />
              </label>
            </div>

            <div className="profile-edit-field">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Enter your name"
              />
            </div>

            <div className="profile-edit-field">
              <Label htmlFor="edit-email">Email</Label>
              <Input id="edit-email" value={user?.email || ''} disabled />
              <p className="profile-edit-note">Email cannot be changed.</p>
            </div>

            <div className="profile-edit-field">
              <Label htmlFor="edit-bio">Bio</Label>
              <textarea
                id="edit-bio"
                className="profile-edit-textarea"
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                maxLength={BIO_MAX_LENGTH}
                placeholder="Tell buyers about you."
              />
              <p className="profile-edit-note">{editBio.length}/{BIO_MAX_LENGTH}</p>
            </div>

            {user?.provider !== 'google' && (
              <div className="profile-password-section">
                <div className="profile-password-head">
                  <div>
                    <h4 className="profile-password-title">Password</h4>
                    <p className="profile-password-subtitle">Leave this unchanged if you do not want to update your password.</p>
                  </div>
                  {!passwordOpen && (
                    <Button variant="outline" size="sm" onClick={() => setPasswordOpen(true)}>
                      Edit Password
                    </Button>
                  )}
                </div>
                {passwordError ? <p className="profile-password-error">{passwordError}</p> : null}
                {passwordSuccess ? <p className="profile-password-success">{passwordSuccess}</p> : null}
                {passwordOpen && (
                  <div className="profile-password-fields">
                    <p className="profile-password-helper">Enter all fields below to replace your current password.</p>
                    <Input
                      type="password"
                      placeholder="Current password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                    <Input
                      type="password"
                      placeholder="New password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <Input
                      type="password"
                      placeholder="Re-enter new password"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                    />
                    <div className="profile-password-actions">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setPasswordOpen(false);
                          setCurrentPassword('');
                          setNewPassword('');
                          setConfirmNewPassword('');
                          setPasswordError('');
                        }}
                        disabled={savingPassword}
                      >
                        Keep Current Password
                      </Button>
                      <Button
                        size="sm"
                        className="profile-password-update-btn"
                        onClick={handleChangePassword}
                        disabled={savingPassword}
                      >
                        {savingPassword ? 'Updating…' : 'Update Password'}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="profile-edit-actions">
              <Button variant="outline" onClick={() => setEditOpen(false)} disabled={savingProfile}>
                Cancel
              </Button>
              <Button onClick={handleSaveProfile} disabled={savingProfile}>
                {savingProfile ? 'Saving…' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
