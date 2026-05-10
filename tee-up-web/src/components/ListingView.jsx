import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Heart, MapPin, Star, User } from 'lucide-react';
import UserHeader from './UserHeader';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Alert } from './ui/alert';
import { Skeleton } from './ui/skeleton';
import { getListingById } from '../api/userListingsApi';
import { getPublicUserProfile, getUserRatings } from '../api/usersApi';
import { cn } from '@/lib/utils';
import PriceDisplay from './PriceDisplay';
import { buildOfferMessage } from '../utils/chatOffers';
import './ListingView.css';

function normalizeListing(row) {
  const photos = row.photos != null
    ? (Array.isArray(row.photos) ? row.photos : (typeof row.photos === 'string' ? (() => { try { return JSON.parse(row.photos); } catch { return []; } })() : []))
    : [];
  return {
    ...row,
    id: row.listing_id ?? row.id,
    listing_id: row.listing_id ?? row.id,
    postedDate: row.date_posted ?? row.postedDate,
    seller: row.seller_name ?? row.seller,
    photos,
  };
}

export default function ListingView({ listingId, onBack, user, onSearch, onSell, onMessages, onMyListings, onNotifications, onViewAllNotifications, onNotificationClick, onOpenProfile, onLogout, onViewSellerProfile, onGoHome, onToggleFavorite, isFavorite }) {
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sellerStats, setSellerStats] = useState({ rating: null, totalRatings: 0 });
  const [sellerReviews, setSellerReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [offerAmount, setOfferAmount] = useState('');
  const [offerError, setOfferError] = useState('');

  useEffect(() => {
    if (!listingId) return;
    setLoading(true);
    setError(null);
    getListingById(listingId)
      .then((data) => {
        setListing(data ? normalizeListing(data) : null);
        setCurrentImageIndex(0);
      })
      .catch((err) => setError(err?.message ?? 'Failed to load listing'))
      .finally(() => setLoading(false));
  }, [listingId]);

  useEffect(() => {
    if (!listing?.user_id) {
      setSellerStats({ rating: null, totalRatings: 0 });
      setSellerReviews([]);
      return;
    }

    let cancelled = false;
    setReviewsLoading(true);
    getPublicUserProfile(listing.user_id)
      .then((profile) => {
        if (cancelled) return;
        const ratingValue = Number(profile?.rating);
        const totalRatingsValue = Number(profile?.total_ratings);
        setSellerStats({
          rating: Number.isFinite(ratingValue) ? ratingValue : null,
          totalRatings: Number.isFinite(totalRatingsValue) ? totalRatingsValue : 0,
        });
      })
      .catch(() => {
        if (!cancelled) {
          setSellerStats({ rating: null, totalRatings: 0 });
        }
      });

    getUserRatings(listing.user_id)
      .then((ratings) => {
        if (!cancelled) {
          setSellerReviews(Array.isArray(ratings) ? ratings : []);
        }
      })
      .catch(() => {
        if (!cancelled) setSellerReviews([]);
      })
      .finally(() => {
        if (!cancelled) setReviewsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [listing?.user_id]);

  if (!listingId) return null;

  const isOwnListing =
    user?.id != null &&
    listing?.user_id != null &&
    Number(user.id) === Number(listing.user_id);

  if (loading) {
    return (
      <div className="listing-view" style={{ backgroundColor: 'var(--color-background)' }}>
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
        <div className="listing-view-container">
          <Button variant="ghost" size="sm" className="listing-view-back" onClick={onBack}>
            <ChevronLeft className="h-4 w-4" /> Back to listings
          </Button>
          <div className="listing-view-layout">
            <Skeleton className="listing-view-gallery-skeleton" />
            <div className="listing-view-info-skeleton">
              <Skeleton className="h-8 w-3/4 mb-2" />
              <Skeleton className="h-6 w-24 mb-4" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-20 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="listing-view" style={{ backgroundColor: 'var(--color-background)' }}>
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
        <div className="listing-view-container">
          <Button variant="ghost" size="sm" className="listing-view-back" onClick={onBack}>
            <ChevronLeft className="h-4 w-4" /> Back to listings
          </Button>
          <Alert variant="destructive">{error || 'Listing not found.'}</Alert>
        </div>
      </div>
    );
  }

  const images = listing.photos?.length ? listing.photos : [];
  const currentImageUrl = images[currentImageIndex];
  const hasMultiple = images.length > 1;

  const formatDate = (d) => {
    if (!d) return '';
    const date = new Date(d);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const sellerName = listing.seller || 'Seller';
  const sellerRatingText = sellerStats.rating == null ? 'New' : sellerStats.rating.toFixed(1);
  const sellerReviewCount = sellerStats.totalRatings;
  const reviews = sellerReviews.slice(0, 6);

  return (
    <div className="listing-view" style={{ backgroundColor: 'var(--color-background)' }}>
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

      <div className="listing-view-container">
        <Button variant="ghost" size="sm" className="listing-view-back" onClick={onBack}>
          <ChevronLeft className="h-4 w-4" /> Back to listings
        </Button>

        <div className="listing-view-layout">
          {/* Gallery */}
          <div className="listing-view-gallery">
            <div className="listing-view-gallery-main">
              {currentImageUrl ? (
                <img src={currentImageUrl} alt={listing.title} className="listing-view-gallery-img" />
              ) : (
                <div className="listing-view-gallery-placeholder">
                  <span>{listing.title || 'No image'}</span>
                </div>
              )}
              {hasMultiple && (
                <>
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    className="listing-view-gallery-arrow listing-view-gallery-arrow-left"
                    onClick={() => setCurrentImageIndex((i) => (i === 0 ? images.length - 1 : i - 1))}
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    className="listing-view-gallery-arrow listing-view-gallery-arrow-right"
                    onClick={() => setCurrentImageIndex((i) => (i === images.length - 1 ? 0 : i + 1))}
                    aria-label="Next image"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </>
              )}
            </div>
            {hasMultiple && (
              <div className="listing-view-gallery-strip">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="listing-view-gallery-strip-btn"
                  onClick={() => setCurrentImageIndex((i) => (i === 0 ? images.length - 1 : i - 1))}
                  aria-label="Previous"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="listing-view-gallery-dots">
                  {images.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className={cn('listing-view-gallery-dot', idx === currentImageIndex && 'listing-view-gallery-dot-active')}
                      onClick={() => setCurrentImageIndex(idx)}
                      aria-label={`Image ${idx + 1}`}
                    />
                  ))}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="listing-view-gallery-strip-btn"
                  onClick={() => setCurrentImageIndex((i) => (i === images.length - 1 ? 0 : i + 1))}
                  aria-label="Next"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Info column */}
          <div className="listing-view-info">
            <div className="listing-view-title-row">
              <h1 className="listing-view-title">{listing.title || 'Untitled'}</h1>
              {onToggleFavorite && !isOwnListing ? (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="listing-view-favorite-btn"
                  onClick={onToggleFavorite}
                  aria-label={isFavorite ? 'Remove from saved' : 'Save listing'}
                >
                  <Heart className={isFavorite ? 'fill-current' : ''} />
                </Button>
              ) : null}
            </div>
            <PriceDisplay
              listing={listing}
              className="listing-view-price"
              currentClassName="listing-view-price-current"
              originalClassName="listing-view-price-original"
            />
            <p className="listing-view-meta">
              <MapPin className="listing-view-meta-icon" aria-hidden />
              {listing.location || '—'} | Posted on {formatDate(listing.postedDate)}
            </p>

            <section className="listing-view-section">
              <h2 className="listing-view-section-title">Description</h2>
              <p className="listing-view-description">{listing.description || 'No description provided.'}</p>
            </section>

            <section className="listing-view-section">
              <h2 className="listing-view-section-title">Details</h2>
              <ul className="listing-view-details">
                <li><span className="listing-view-detail-label">Category:</span> {listing.category || '—'}</li>
                <li><span className="listing-view-detail-label">Condition:</span> {listing.condition || '—'}</li>
              </ul>
            </section>

            <Card className="listing-view-seller-card">
              <CardContent className="listing-view-seller-content">
                <Avatar className="listing-view-seller-avatar">
                  <AvatarImage src={listing.seller_profile_image} alt={sellerName} />
                  <AvatarFallback><User className="h-6 w-6" /></AvatarFallback>
                </Avatar>
                <div className="listing-view-seller-text">
                  <div className="listing-view-seller-name">{sellerName}</div>
                  <div className="listing-view-seller-rating">
                    <Star className="listing-view-star" aria-hidden />
                    {sellerRatingText} ({sellerReviewCount})
                  </div>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  className="listing-view-seller-btn"
                  onClick={() => onViewSellerProfile?.(listing.user_id)}
                >
                  View Profile
                </Button>
              </CardContent>
            </Card>

            <Button
              className="listing-view-make-offer"
              size="lg"
              onClick={() => {
                onMessages?.({
                  sellerId: listing.user_id,
                  listingId: listing.listing_id ?? listing.id,
                  listingTitle: listing.title,
                });
              }}
            >
              Chat with Seller
            </Button>
            <div className="listing-view-offer-box">
              <div className="listing-view-offer-row">
                <input
                  type="number"
                  min="1"
                  className="listing-view-offer-input"
                  placeholder="Enter your offer amount"
                  value={offerAmount}
                  onChange={(e) => setOfferAmount(e.target.value)}
                />
                <Button
                  size="lg"
                  className="listing-view-make-offer"
                  onClick={() => {
                    setOfferError('');
                    const payload = buildOfferMessage(offerAmount);
                    if (!payload) {
                      setOfferError('Please enter a valid offer amount.');
                      return;
                    }
                    onMessages?.({
                      sellerId: listing.user_id,
                      listingId: listing.listing_id ?? listing.id,
                      listingTitle: listing.title,
                      intent: 'offer',
                      offerRequestId: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
                      initialMessage: payload,
                    });
                  }}
                >
                  Make Offer
                </Button>
              </div>
              {offerError ? <p className="listing-view-offer-error">{offerError}</p> : null}
            </div>
          </div>
        </div>

        {/* Product Reviews */}
        <section className="listing-view-reviews">
          <h2 className="listing-view-section-title">Product Reviews</h2>
          <div className="listing-view-reviews-list">
            {reviewsLoading ? (
              <p className="listing-view-reviews-empty">Loading reviews…</p>
            ) : reviews.length === 0 ? (
              <p className="listing-view-reviews-empty">No reviews yet.</p>
            ) : (
              reviews.map((review, idx) => (
                <Card key={`${review.created_at || idx}-${idx}`} className="listing-view-review-card">
                  <CardContent className="listing-view-review-content">
                    <p className="listing-view-review-text">
                      {review.review?.trim() ? review.review : 'No written review provided.'}
                    </p>
                    <div className="listing-view-reviewer">
                      <Avatar className="listing-view-reviewer-avatar">
                        <AvatarImage src={review.reviewer_profile_image} alt={review.reviewer_name || 'Reviewer'} />
                        <AvatarFallback><User className="h-3 w-3" /></AvatarFallback>
                      </Avatar>
                      <span className="listing-view-reviewer-name">{review.reviewer_name || `Buyer ${idx + 1}`}</span>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
