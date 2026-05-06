import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import Logo from './Logo';
import { ChevronRight } from 'lucide-react';
import { getListings } from '../api/userListingsApi';
import PriceDisplay from './PriceDisplay';
import './HomePage.css';

// Golf scenery for hero slideshow – only URLs that load reliably (full Unsplash photo-id-hash format)
const HERO_SLIDES = [
  'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=1200&q=80',  // putting green, golf ball
  'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=1200&q=80',  // golf course
  'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=1200&q=80',
  'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=1200&q=80',
  'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=1200&q=80',
  'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=1200&q=80',
  'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=1200&q=80',
  'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=1200&q=80',
];

function normalizeListing(item) {
  const photos = item.photos != null
    ? (
      Array.isArray(item.photos)
        ? item.photos
        : (typeof item.photos === 'string'
          ? (() => {
            try { return JSON.parse(item.photos); } catch { return []; }
          })()
          : [])
    )
    : [];
  return {
    ...item,
    id: item.listing_id ?? item.id,
    listing_id: item.listing_id ?? item.id,
    photos,
  };
}

function HomePage({ onOpenLogin, onOpenSignUp }) {
  const [heroIndex, setHeroIndex] = useState(0);
  const [trendingItems, setTrendingItems] = useState([]);
  const [trendingLoading, setTrendingLoading] = useState(true);
  const handleOpenLogin = () => (onOpenLogin ? onOpenLogin() : null);
  const handleOpenSignUp = () => (onOpenSignUp ? onOpenSignUp() : onOpenLogin?.());

  // Preload slideshow images for smoother transitions
  useEffect(() => {
    HERO_SLIDES.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  // Auto-advance with longer interval so crossfade feels smooth
  useEffect(() => {
    const id = setInterval(() => {
      setHeroIndex((i) => (i + 1) % HERO_SLIDES.length);
    }, 6500);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const loadTrending = async () => {
      setTrendingLoading(true);
      try {
        const data = await getListings({ status: 'available', sort: 'newest' });
        if (!cancelled) {
          const normalized = Array.isArray(data) ? data.map(normalizeListing) : [];
          setTrendingItems(normalized.slice(0, 4));
        }
      } catch {
        if (!cancelled) setTrendingItems([]);
      } finally {
        if (!cancelled) setTrendingLoading(false);
      }
    };
    loadTrending();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="home-page">
      {/* Header */}
      <header className="home-header">
        <div className="home-header-inner">
          <Logo className="home-logo" size={36} />
          <div className="home-search-wrap">
            <Input
              type="search"
              placeholder="Search clubs, balls, rangefinders..."
              className="home-search-input"
              aria-label="Search marketplace"
            />
          </div>
          <div className="home-header-actions">
            <button
              type="button"
              onClick={handleOpenLogin}
              className="home-link-login"
            >
              Log In
            </button>
            <Button
              type="button"
              onClick={handleOpenSignUp}
              className="home-btn-join"
              size="lg"
            >
              Join the Club
            </Button>
          </div>
        </div>
      </header>

      {/* Hero – auto slideshow of golf scenery (no user controls) */}
      <section className="home-hero" aria-label="Golf scenery">
        <div className="home-hero-slides" aria-hidden="true">
          {HERO_SLIDES.map((src, i) => (
            <div
              key={src}
              className={`home-hero-slide ${i === heroIndex ? 'home-hero-slide-active' : ''}`}
              style={{
                backgroundImage: `url('${src}')`,
              }}
            />
          ))}
        </div>
        <div className="home-hero-overlay" aria-hidden="true" />
        <div className="home-hero-content">
          <h1 className="home-hero-title">Upgrade your bag</h1>
          <p className="home-hero-subtitle">
            The premium community marketplace for golf enthusiasts in the Philippines.
          </p>
          <Button
            type="button"
            onClick={handleOpenSignUp}
            className="home-hero-cta"
            size="lg"
          >
            Browse marketplace
            <ChevronRight className="home-hero-cta-icon" />
          </Button>
        </div>
      </section>

      {/* Trending Gear */}
      <section className="home-section home-trending" aria-labelledby="home-trending-title">
        <div className="home-section-inner">
          <header className="home-section-head">
            <span className="home-section-label">Popular now</span>
            <h2 id="home-trending-title" className="home-section-title">Trending gear</h2>
          </header>
          <div className="home-trending-grid">
            {trendingLoading ? (
              Array.from({ length: 4 }).map((_, idx) => (
                <article key={idx} className="home-product-card home-product-card-skeleton">
                  <div className="home-product-image home-product-image-placeholder" />
                  <div className="home-product-info">
                    <div className="home-product-skeleton-line home-product-skeleton-title" />
                    <div className="home-product-skeleton-line home-product-skeleton-price" />
                    <div className="home-product-skeleton-line home-product-skeleton-merchant" />
                  </div>
                </article>
              ))
            ) : trendingItems.length === 0 ? (
              <p className="home-trending-empty">No trending listings yet.</p>
            ) : (
              trendingItems.map((item) => {
                const imageUrl = item.photos?.[0] || null;
                return (
                  <article key={item.id} className="home-product-card">
                    <div className="home-product-image">
                      {imageUrl ? (
                        <img src={imageUrl} alt={item.title || 'Trending gear'} />
                      ) : (
                        <div
                          className="home-product-image-placeholder"
                          style={{ backgroundColor: 'var(--color-light-gray)' }}
                        />
                      )}
                    </div>
                    <div className="home-product-info">
                      <h3 className="home-product-title">{item.title || 'Untitled listing'}</h3>
                      <PriceDisplay
                        listing={item}
                        className="home-product-price"
                        currentClassName="home-product-price-current"
                        originalClassName="home-product-price-original"
                      />
                      <p className="home-product-merchant">
                        <span className="home-product-merchant-dot" />
                        {item.seller_name || 'Marketplace seller'}
                      </p>
                      <button type="button" className="home-product-view-hint-btn" onClick={handleOpenLogin}>
                        <span className="home-product-view-hint">
                          View details <ChevronRight className="home-product-view-icon" />
                        </span>
                      </button>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
