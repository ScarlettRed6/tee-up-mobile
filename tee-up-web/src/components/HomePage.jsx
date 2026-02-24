import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import Logo from './Logo';
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

// Placeholder trending items (replace with API later)
const TRENDING_PLACEHOLDER = [
  { id: 1, title: 'TaylorMade SIM2 Driver', price: '₱18,500', merchant: 'Golf Pro Shop', image: null },
  { id: 2, title: 'Titleist Pro V1 Golf Balls (12 pack)', price: '₱3,200', merchant: 'Big White Ralph Ball Merchandise', image: null },
  { id: 3, title: 'Callaway Apex Iron Set', price: '₱35,000', merchant: 'Fairway Finds', image: null },
  { id: 4, title: 'RalphMade Balls 2', price: '₱69.00', merchant: 'Big White Ralph Ball Merchandise', image: null },
];

function HomePage({ onOpenLogin, onOpenSignUp }) {
  const [heroIndex, setHeroIndex] = useState(0);
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

  return (
    <div className="home-page" style={{ backgroundColor: 'var(--color-background)' }}>
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
          <h1 className="home-hero-title">Upgrade Your Bag.</h1>
          <p className="home-hero-subtitle">
            The premium community marketplace for golf enthusiasts in the Philippines.
          </p>
          <Button
            type="button"
            onClick={handleOpenSignUp}
            className="home-hero-cta"
            size="lg"
          >
            Browse Marketplace
          </Button>
        </div>
      </section>

      {/* Trending Gear */}
      <section className="home-section home-trending">
        <div className="home-section-inner">
          <h2 className="home-section-title">Trending Gear</h2>
          <div className="home-trending-grid">
            {TRENDING_PLACEHOLDER.map((item) => (
              <article key={item.id} className="home-product-card">
                <div className="home-product-image">
                  {item.image ? (
                    <img src={item.image} alt="" />
                  ) : (
                    <div
                      className="home-product-image-placeholder"
                      style={{ backgroundColor: 'var(--color-light-gray)' }}
                    />
                  )}
                </div>
                <div className="home-product-info">
                  <h3 className="home-product-title">{item.title}</h3>
                  <p className="home-product-price">{item.price}</p>
                  <p className="home-product-merchant">
                    <span className="home-product-merchant-dot" />
                    {item.merchant}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
