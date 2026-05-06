import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, MapPin, Star, User } from 'lucide-react';
import UserHeader from './UserHeader';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Alert } from './ui/alert';
import { Skeleton } from './ui/skeleton';
import { getListingById } from '../api/userListingsApi';
import { cn } from '@/lib/utils';
import PriceDisplay from './PriceDisplay';
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

export default function ListingView({ listingId, onBack, user, onSearch, onSell, onMessages, onMyListings, onNotifications, onViewAllNotifications, onNotificationClick, onOpenProfile, onLogout, onViewSellerProfile, onGoHome }) {
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

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

  if (!listingId) return null;

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
  const sellerRating = 4.9;
  const sellerReviewCount = 120;
  const reviews = [
    { id: 1, text: 'Loved it! The seller is very trustworthy and the product was exactly as described.', reviewer: { name: 'Hockeyops' } },
  ];

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
            <h1 className="listing-view-title">{listing.title || 'Untitled'}</h1>
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
                    {sellerRating} ({sellerReviewCount})
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

            <Button className="listing-view-make-offer" size="lg" onClick={() => { /* TODO: open make offer / message */ }}>
              Make Offer
            </Button>
          </div>
        </div>

        {/* Product Reviews */}
        <section className="listing-view-reviews">
          <h2 className="listing-view-section-title">Product Reviews</h2>
          <div className="listing-view-reviews-list">
            {reviews.length === 0 ? (
              <p className="listing-view-reviews-empty">No reviews yet.</p>
            ) : (
              reviews.map((review) => (
                <Card key={review.id} className="listing-view-review-card">
                  <CardContent className="listing-view-review-content">
                    <p className="listing-view-review-text">{review.text}</p>
                    <div className="listing-view-reviewer">
                      <Avatar className="listing-view-reviewer-avatar">
                        <AvatarFallback><User className="h-3 w-3" /></AvatarFallback>
                      </Avatar>
                      <span className="listing-view-reviewer-name">{review.reviewer?.name ?? '—'}</span>
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
