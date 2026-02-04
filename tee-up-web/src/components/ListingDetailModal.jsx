import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import './ListingDetailModal.css';

function ListingDetailModal({ listing, onClose }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    console.log('ListingDetailModal useEffect - listing:', listing);
    // Prevent body scroll when modal is open
    if (listing) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [listing]);

  if (!listing) {
    console.log('Modal: No listing provided');
    return null;
  }
  
  console.log('Modal: Rendering with listing:', listing);

  // Mock images - in real app these would come from listing data
  const images = listing.images || [
    { id: 1, uri: null },
    { id: 2, uri: null },
    { id: 3, uri: null },
  ];

  const handlePreviousImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? images.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === images.length - 1 ? 0 : prev + 1
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const formatPrice = (price) => {
    return `₱${price.toFixed(2)}`;
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <span className="status-badge status-active">Active</span>;
      case 'pending':
        return <span className="status-badge status-pending">Pending Approval</span>;
      case 'sold':
        return <span className="status-badge status-sold">Sold</span>;
      default:
        return <span className="status-badge status-active">Active</span>;
    }
  };

  const getConditionBadge = (condition) => {
    const conditionClass = condition.toLowerCase().replace(/\s+/g, '-');
    return <span className={`condition-badge condition-${conditionClass}`}>{condition}</span>;
  };

  // Mock seller data
  const seller = {
    name: listing.seller,
    rating: 4.9,
    reviewCount: 120,
  };

  // Mock reviews
  const reviews = listing.reviews || [
    {
      id: 1,
      heading: 'Loved It!',
      text: 'The seller is very trustworthy and the product was exactly as described.',
      reviewer: {
        name: 'buyer123',
      },
    },
  ];

  const modalContent = (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>

        <div className="modal-scroll">
          {/* Image Carousel */}
          <div className="image-carousel-container">
            <div className="image-wrapper">
              <div className="product-image-placeholder">
                <span className="image-placeholder-text">{listing.title}</span>
              </div>
              
              {images.length > 1 && (
                <>
                  <button 
                    className="carousel-arrow arrow-left"
                    onClick={handlePreviousImage}
                    aria-label="Previous image"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <polyline points="15 18 9 12 15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  <button 
                    className="carousel-arrow arrow-right"
                    onClick={handleNextImage}
                    aria-label="Next image"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <polyline points="9 18 15 12 9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </>
              )}
            </div>
            
            {images.length > 1 && (
              <div className="pagination-dots">
                {images.map((_, index) => (
                  <div
                    key={index}
                    className={`dot ${index === currentImageIndex ? 'dot-active' : ''}`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="product-info-section">
            <div className="title-row">
              <h2 className="product-title">{listing.title}</h2>
            </div>
            
            <div className="price-row">
              <span className="product-price">{formatPrice(listing.price)}</span>
              {getStatusBadge(listing.status)}
            </div>
            
            <div className="location-date">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>{listing.location}</span>
              <span className="separator">•</span>
              <span>Posted on {formatDate(listing.postedDate)}</span>
            </div>
          </div>

          {/* Description */}
          <div className="section">
            <h3 className="section-title">Description</h3>
            <p className="section-content">
              {listing.description || 'No description provided.'}
            </p>
          </div>

          {/* Details */}
          <div className="section">
            <h3 className="section-title">Details</h3>
            <div className="details-grid">
              <div className="detail-item">
                <span className="detail-label">Category:</span>
                <span className="detail-value">{listing.category}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Condition:</span>
                <span className="detail-value">{getConditionBadge(listing.condition)}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Listing ID:</span>
                <span className="detail-value">{listing.id}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Saves:</span>
                <span className="detail-value">{listing.saves}</span>
              </div>
            </div>
          </div>

          {/* Seller Information */}
          <div className="section">
            <h3 className="section-title">Seller Information</h3>
            <div className="seller-info-container">
              <div className="seller-avatar">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="seller-details">
                <div className="seller-name">{seller.name}</div>
                <div className="rating-container">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                  <span className="rating-text">
                    {seller.rating} ({seller.reviewCount} reviews)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Reviews */}
          {reviews.length > 0 && (
            <div className="section">
              <h3 className="section-title">Product Reviews</h3>
              <div className="reviews-list">
                {reviews.map((review) => (
                  <div key={review.id} className="review-card">
                    <div className="review-heading">{review.heading}</div>
                    <p className="review-text">{review.text}</p>
                    <div className="reviewer-info">
                      <div className="reviewer-avatar">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <span className="reviewer-name">{review.reviewer.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Try without portal first to debug
  return modalContent;
  // return createPortal(modalContent, document.body);
}

export default ListingDetailModal;

