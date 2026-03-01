import './ListingCard.css';

function ListingCard({ listing, tagline, onFavorite, isFavorite }) {
  const photos = Array.isArray(listing.photos) ? listing.photos : (listing.photos ? JSON.parse(listing.photos || '[]') : []);
  const imageUrl = photos[0] || null;
  const price = listing.price != null ? Number(listing.price) : 0;
  const formattedPrice = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 2 }).format(price);
  const subtitle = tagline || listing.brand || listing.seller_name || '';

  const handleClick = () => {
    // Could open detail modal or navigate
  };

  return (
    <article className="listing-card" onClick={handleClick}>
      <div className="listing-card-image-wrap">
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
        {onFavorite && (
          <button
            type="button"
            className="listing-card-fav"
            onClick={(e) => { e.stopPropagation(); onFavorite(listing.listing_id || listing.id); }}
            aria-label={isFavorite ? 'Remove from saved' : 'Save listing'}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
        )}
      </div>
      <div className="listing-card-body">
        <h3 className="listing-card-title">{listing.title || 'Untitled'}</h3>
        <p className="listing-card-price">{formattedPrice}</p>
        {subtitle && (
          <p className="listing-card-subtitle">
            <span className="listing-card-dot" aria-hidden="true" />
            {subtitle}
          </p>
        )}
      </div>
    </article>
  );
}

export default ListingCard;
