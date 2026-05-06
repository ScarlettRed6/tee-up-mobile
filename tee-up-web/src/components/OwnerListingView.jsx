import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, MapPin, User } from 'lucide-react';
import UserHeader from './UserHeader';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Alert } from './ui/alert';
import { Skeleton } from './ui/skeleton';
import { getListingById, updateListingStatus, deleteListing } from '../api/userListingsApi';
import { cn } from '@/lib/utils';
import PriceDisplay from './PriceDisplay';
import './OwnerListingView.css';

function normalizeListing(row) {
  const photos = row.photos != null
    ? (Array.isArray(row.photos) ? row.photos : (typeof row.photos === 'string' ? (() => { try { return JSON.parse(row.photos); } catch { return []; } })() : []))
    : [];
  return {
    ...row,
    id: row.listing_id ?? row.id,
    listing_id: row.listing_id ?? row.id,
    postedDate: row.date_posted ?? row.postedDate,
    photos,
  };
}

export default function OwnerListingView({
  listingId,
  onBack,
  user,
  onSearch,
  onSell,
  onMessages,
  onMyListings,
  onNotifications,
  onViewAllNotifications,
  onNotificationClick,
  onProfile,
  onEditListing,
  onReviewOffer,
  onOpenProfile,
  onLogout,
  onGoHome,
}) {
  const SOLD_CONFIRM_ACTION = 'sold';
  const AVAILABLE_CONFIRM_ACTION = 'available';
  const DELETE_CONFIRM_ACTION = 'delete';
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [actionLoading, setActionLoading] = useState(null);
  const [pendingConfirmAction, setPendingConfirmAction] = useState(null);

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

  const handleMarkAsSold = async () => {
    if (!listing?.listing_id) return;
    setActionLoading('sold');
    try {
      await updateListingStatus(listing.listing_id, 'sold');
      setListing((prev) => (prev ? { ...prev, status: 'sold' } : null));
    } catch (err) {
      setError(err?.message ?? 'Failed to update status');
    } finally {
      setActionLoading(null);
    }
  };

  const handleMarkAsAvailable = async () => {
    if (!listing?.listing_id) return;
    setActionLoading('available');
    try {
      await updateListingStatus(listing.listing_id, 'available');
      setListing((prev) => (prev ? { ...prev, status: 'available' } : null));
    } catch (err) {
      setError(err?.message ?? 'Failed to update status');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async () => {
    if (!listing?.listing_id) return;
    setActionLoading('delete');
    try {
      await deleteListing(listing.listing_id);
      onBack?.();
    } catch (err) {
      setError(err?.message ?? 'Failed to delete listing');
    } finally {
      setActionLoading(null);
    }
  };

  if (!listingId) return null;

  if (loading) {
    return (
      <div className="owner-listing-view" style={{ backgroundColor: 'var(--color-background)' }}>
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
        <div className="owner-listing-container">
          <Button variant="ghost" size="sm" className="owner-listing-back" onClick={onBack}>
            <ChevronLeft className="h-4 w-4" /> Back
          </Button>
          <div className="owner-listing-layout">
            <Skeleton className="owner-listing-gallery-skeleton" />
            <div className="owner-listing-info-skeleton">
              <Skeleton className="h-8 w-3/4 mb-2" />
              <Skeleton className="h-6 w-24 mb-4" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !listing) {
    return (
      <div className="owner-listing-view" style={{ backgroundColor: 'var(--color-background)' }}>
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
        <div className="owner-listing-container">
          <Button variant="ghost" size="sm" className="owner-listing-back" onClick={onBack}>
            <ChevronLeft className="h-4 w-4" /> Back
          </Button>
          <Alert variant="destructive">{error}</Alert>
        </div>
      </div>
    );
  }

  const isOwner = user?.id != null && Number(listing.user_id) === Number(user.id);
  if (!isOwner) {
    return (
      <div className="owner-listing-view" style={{ backgroundColor: 'var(--color-background)' }}>
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
        <div className="owner-listing-container">
          <Button variant="ghost" size="sm" className="owner-listing-back" onClick={onBack}>
            <ChevronLeft className="h-4 w-4" /> Back
          </Button>
          <Alert variant="destructive">You don&apos;t own this listing.</Alert>
        </div>
      </div>
    );
  }

  const images = listing.photos?.length ? listing.photos : [];
  const currentImageUrl = images[currentImageIndex];
  const hasMultiple = images.length > 1;

  const formatDate = (d) => {
    if (!d) return '';
    return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const formatPrice = (p) => {
    const num = Number(p);
    return isNaN(num) ? '—' : new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 0 }).format(num);
  };

  const currentOffers = [
    { id: '1', buyerName: 'Hockeyops', offerAmount: 7500, buyerImage: null },
  ];

  const openSoldConfirmation = () => setPendingConfirmAction(SOLD_CONFIRM_ACTION);
  const openAvailableConfirmation = () => setPendingConfirmAction(AVAILABLE_CONFIRM_ACTION);
  const openDeleteConfirmation = () => setPendingConfirmAction(DELETE_CONFIRM_ACTION);
  const closeConfirmationModal = () => {
    if (actionLoading) return;
    setPendingConfirmAction(null);
  };
  const confirmPendingAction = async () => {
    if (pendingConfirmAction === SOLD_CONFIRM_ACTION) {
      await handleMarkAsSold();
    } else if (pendingConfirmAction === AVAILABLE_CONFIRM_ACTION) {
      await handleMarkAsAvailable();
    } else if (pendingConfirmAction === DELETE_CONFIRM_ACTION) {
      await handleDelete();
    }
    setPendingConfirmAction(null);
  };
  const confirmConfig = pendingConfirmAction === SOLD_CONFIRM_ACTION
    ? {
      title: 'Mark listing as sold?',
      message: 'This listing will be shown as sold and buyers will see it as no longer available.',
      confirmLabel: actionLoading === 'sold' ? 'Marking…' : 'Mark as Sold',
    }
    : pendingConfirmAction === AVAILABLE_CONFIRM_ACTION
      ? {
        title: 'Mark listing as available?',
        message: 'This listing will be shown as available and buyers can purchase it again.',
        confirmLabel: actionLoading === 'available' ? 'Updating…' : 'Mark as Available',
      }
    : pendingConfirmAction === DELETE_CONFIRM_ACTION
      ? {
        title: 'Delete this listing?',
        message: 'This action is permanent and cannot be undone.',
        confirmLabel: actionLoading === 'delete' ? 'Deleting…' : 'Delete Listing',
      }
      : null;
  const isConfirming = actionLoading === 'sold' || actionLoading === 'available' || actionLoading === 'delete';

  return (
    <div className="owner-listing-view" style={{ backgroundColor: 'var(--color-background)' }}>
      <UserHeader
        user={user}
        onSearch={onSearch}
        onSell={onSell}
        onMessages={onMessages}
        onMyListings={onMyListings}
        onNotifications={onNotifications}
        onViewAllNotifications={onViewAllNotifications}
        onNotificationClick={onNotificationClick}
        onProfile={onProfile}
      />

      <div className="owner-listing-container">
        <Button variant="ghost" size="sm" className="owner-listing-back" onClick={onBack}>
          <ChevronLeft className="h-4 w-4" /> Back
        </Button>

        {error && (
          <Alert variant="destructive" className="owner-listing-error">{error}</Alert>
        )}

        <div className="owner-listing-layout">
          <div className="owner-listing-left">
            <div className="owner-listing-gallery">
              <div className="owner-listing-gallery-main">
                {currentImageUrl ? (
                  <img src={currentImageUrl} alt={listing.title} className="owner-listing-gallery-img" />
                ) : (
                  <div className="owner-listing-gallery-placeholder">
                    <span>{listing.title || 'No image'}</span>
                  </div>
                )}
                {hasMultiple && (
                  <>
                    <Button
                      type="button"
                      variant="secondary"
                      size="icon"
                      className="owner-listing-gallery-arrow owner-listing-gallery-arrow-left"
                      onClick={() => setCurrentImageIndex((i) => (i === 0 ? images.length - 1 : i - 1))}
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      size="icon"
                      className="owner-listing-gallery-arrow owner-listing-gallery-arrow-right"
                      onClick={() => setCurrentImageIndex((i) => (i === images.length - 1 ? 0 : i + 1))}
                      aria-label="Next image"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                  </>
                )}
              </div>
              {hasMultiple && (
                <div className="owner-listing-gallery-strip">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="owner-listing-gallery-strip-btn"
                    onClick={() => setCurrentImageIndex((i) => (i === 0 ? images.length - 1 : i - 1))}
                    aria-label="Previous"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="owner-listing-gallery-dots">
                    {images.map((_, idx) => (
                      <button
                        key={idx}
                        type="button"
                        className={cn('owner-listing-gallery-dot', idx === currentImageIndex && 'owner-listing-gallery-dot-active')}
                        onClick={() => setCurrentImageIndex(idx)}
                        aria-label={`Image ${idx + 1}`}
                      />
                    ))}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="owner-listing-gallery-strip-btn"
                    onClick={() => setCurrentImageIndex((i) => (i === images.length - 1 ? 0 : i + 1))}
                    aria-label="Next"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            <section className="owner-listing-offers">
              <h2 className="owner-listing-section-title">Current Offers</h2>
              <div className="owner-listing-offers-list">
                {currentOffers.length === 0 ? (
                  <p className="owner-listing-offers-empty">No offers yet.</p>
                ) : (
                  currentOffers.map((offer) => (
                    <Card key={offer.id} className="owner-listing-offer-card">
                      <CardContent className="owner-listing-offer-content">
                        <Avatar className="owner-listing-offer-avatar">
                          <AvatarImage src={offer.buyerImage} alt={offer.buyerName} />
                          <AvatarFallback><User className="h-5 w-5" /></AvatarFallback>
                        </Avatar>
                        <div className="owner-listing-offer-info">
                          <span className="owner-listing-offer-name">{offer.buyerName}</span>
                          <span className="owner-listing-offer-amount">Offer: {formatPrice(offer.offerAmount)}</span>
                        </div>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="owner-listing-offer-btn"
                          onClick={() => onReviewOffer?.(offer, listing)}
                        >
                          Review Offer
                        </Button>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </section>
          </div>

          <div className="owner-listing-info">
            <h1 className="owner-listing-title">{listing.title || 'Untitled'}</h1>
            <PriceDisplay
              listing={listing}
              className="owner-listing-price"
              currentClassName="owner-listing-price-current"
              originalClassName="owner-listing-price-original"
            />
            <p className="owner-listing-meta">
              <MapPin className="owner-listing-meta-icon" aria-hidden />
              {listing.location || '—'} | Posted on {formatDate(listing.postedDate)}
            </p>

            <div className="owner-listing-actions-row">
              <Button
                variant="secondary"
                size="default"
                className="owner-listing-action-btn"
                onClick={() => onEditListing?.(listing)}
                disabled={listing.status === 'sold'}
              >
                Edit Listing Details
              </Button>
              <Button
                variant="secondary"
                size="default"
                className="owner-listing-action-btn"
                onClick={listing.status === 'sold' ? openAvailableConfirmation : openSoldConfirmation}
                disabled={actionLoading === 'sold' || actionLoading === 'available'}
              >
                {actionLoading === 'sold' || actionLoading === 'available'
                  ? 'Updating…'
                  : listing.status === 'sold'
                    ? 'Mark as Available'
                    : 'Mark as Sold'}
              </Button>
            </div>

            <section className="owner-listing-section">
              <h2 className="owner-listing-section-title">Description</h2>
              <p className="owner-listing-description">{listing.description || 'No description provided.'}</p>
            </section>

            <section className="owner-listing-section">
              <h2 className="owner-listing-section-title">Details</h2>
              <ul className="owner-listing-details">
                <li><span className="owner-listing-detail-label">Category:</span> {listing.category || '—'}</li>
                <li><span className="owner-listing-detail-label">Condition:</span> {listing.condition || '—'}</li>
              </ul>
            </section>

            <div className="owner-listing-delete-wrap">
              <Button
                variant="secondary"
                size="lg"
                className="owner-listing-delete-btn"
                onClick={openDeleteConfirmation}
                disabled={actionLoading === 'delete'}
              >
                {actionLoading === 'delete' ? 'Deleting…' : 'Delete Listing'}
              </Button>
              <p className="owner-listing-delete-warning">Deleted listings cannot be recovered.</p>
            </div>
          </div>
        </div>
      </div>
      {pendingConfirmAction && confirmConfig && (
        <div className="owner-listing-modal-overlay" onClick={closeConfirmationModal}>
          <div className="owner-listing-confirm-modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="owner-listing-confirm-title">{confirmConfig.title}</h3>
            <p className="owner-listing-confirm-message">{confirmConfig.message}</p>
            <div className="owner-listing-confirm-actions">
              <Button
                variant="secondary"
                size="sm"
                onClick={closeConfirmationModal}
                disabled={isConfirming}
              >
                Cancel
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="owner-listing-confirm-primary"
                onClick={confirmPendingAction}
                disabled={isConfirming}
              >
                {confirmConfig.confirmLabel}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
