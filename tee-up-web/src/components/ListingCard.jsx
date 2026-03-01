import * as React from 'react';
import { Card, CardHeader, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Heart, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import './ListingCard.css';

function ListingCard({ listing, tagline, onFavorite, isFavorite, onClick, variant }) {
  const photos = Array.isArray(listing.photos) ? listing.photos : (listing.photos ? JSON.parse(listing.photos || '[]') : []);
  const imageUrl = photos[0] || null;
  const price = listing.price != null ? Number(listing.price) : 0;
  const formattedPrice = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 2 }).format(price);
  const subtitle = listing.seller_name || tagline || listing.brand || '';

  const handleClick = () => {
    onClick?.(listing.listing_id ?? listing.id);
  };

  return (
    <Card
      className={cn("listing-card", variant === "grid" && "listing-card--grid")}
      onClick={handleClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick(); } } : undefined}
    >
      <CardHeader className="listing-card-image-wrap p-0 text-left">
        <div className="listing-card-image-inner">
          {imageUrl ? (
            <img src={imageUrl} alt="" className="listing-card-image" loading="lazy" />
          ) : (
            <div className="listing-card-image-placeholder" aria-hidden="true">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="M21 15l-5-5L5 21" />
              </svg>
            </div>
          )}
        </div>
        {isFavorite && (
          <Badge variant="default" className="listing-card-badge-saved">Saved</Badge>
        )}
        {onFavorite && (
          <Button
            type="button"
            variant="secondary"
            size="icon"
            className={cn("listing-card-fav", isFavorite && "listing-card-fav-active")}
            onClick={(e) => { e.stopPropagation(); onFavorite(listing.listing_id || listing.id); }}
            aria-label={isFavorite ? 'Remove from saved' : 'Save listing'}
          >
            <Heart className={cn("h-5 w-5", isFavorite && "fill-current")} />
          </Button>
        )}
      </CardHeader>
      <CardContent className="listing-card-body">
        <h3 className="listing-card-title">{listing.title || 'Untitled'}</h3>
        <p className="listing-card-price">{formattedPrice}</p>
        {subtitle && (
          <p className="listing-card-subtitle">
            <span className="listing-card-dot" aria-hidden="true" />
            {subtitle}
          </p>
        )}
        {variant === 'grid' && (
          <span className="listing-card-view-hint">
            View details <ChevronRight className="listing-card-view-icon" />
          </span>
        )}
      </CardContent>
    </Card>
  );
}

export default ListingCard;
