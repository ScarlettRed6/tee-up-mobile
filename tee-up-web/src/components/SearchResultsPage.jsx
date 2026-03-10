import UserHeader from './UserHeader';
import ListingCard from './ListingCard';
import { Button } from './ui/button';
import { Input } from './ui/input';
import './SearchResultsPage.css';

function SearchResultsPage({
  user,
  query,
  results,
  loading,
  error,
  filters,
  onFiltersChange,
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
  onViewListing,
}) {
  const hasResults = Array.isArray(results) && results.length > 0;

  const handleCategoryToggle = (label, value) => {
    if (!onFiltersChange) return;
    onFiltersChange((prev) => ({
      ...prev,
      category: prev?.category === value ? null : value,
    }));
  };

  const handleConditionToggle = (label, value) => {
    if (!onFiltersChange) return;
    onFiltersChange((prev) => ({
      ...prev,
      condition: prev?.condition === value ? null : value,
    }));
  };

  const handlePriceChange = (key, raw) => {
    if (!onFiltersChange) return;
    const numeric = raw.replace(/[^0-9]/g, '');
    onFiltersChange((prev) => ({
      ...prev,
      [key]: numeric,
    }));
  };

  const handleLocationChange = (value) => {
    if (!onFiltersChange) return;
    onFiltersChange((prev) => ({
      ...prev,
      location: value,
    }));
  };

  return (
    <div className="search-page" style={{ backgroundColor: 'var(--color-background)' }}>
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

      <main className="search-page-main">
        <div className="search-page-container">
          <Button
            variant="ghost"
            size="sm"
            className="search-page-back"
            onClick={onBack}
          >
            Back to feed
          </Button>

          <div className="search-page-layout">
            <aside className="search-page-filters" aria-label="Search filters">
              <section className="search-page-filter-section">
                <h3 className="search-page-filter-title">Category</h3>
                <button
                  type="button"
                  className={`search-page-filter-pill ${filters?.category === 'Driver' ? 'search-page-filter-pill-active' : ''}`}
                  onClick={() => handleCategoryToggle('Drivers', 'Driver')}
                >
                  Drivers
                </button>
                <button
                  type="button"
                  className={`search-page-filter-pill ${filters?.category === 'Iron' ? 'search-page-filter-pill-active' : ''}`}
                  onClick={() => handleCategoryToggle('Iron Sets', 'Iron')}
                >
                  Iron Sets
                </button>
                <button
                  type="button"
                  className={`search-page-filter-pill ${filters?.category === 'Putters' ? 'search-page-filter-pill-active' : ''}`}
                  onClick={() => handleCategoryToggle('Putters', 'Putters')}
                >
                  Putters
                </button>
                <button
                  type="button"
                  className={`search-page-filter-pill ${filters?.category === 'Wedges' ? 'search-page-filter-pill-active' : ''}`}
                  onClick={() => handleCategoryToggle('Wedges', 'Wedges')}
                >
                  Wedges
                </button>
              </section>

              <section className="search-page-filter-section">
                <h3 className="search-page-filter-title">Condition</h3>
                <button
                  type="button"
                  className={`search-page-filter-pill ${filters?.condition === 'New' ? 'search-page-filter-pill-active' : ''}`}
                  onClick={() => handleConditionToggle('New', 'New')}
                >
                  New
                </button>
                <button
                  type="button"
                  className={`search-page-filter-pill ${filters?.condition === 'Slightly Used' ? 'search-page-filter-pill-active' : ''}`}
                  onClick={() => handleConditionToggle('Slightly Used', 'Slightly Used')}
                >
                  Slightly Used
                </button>
                <button
                  type="button"
                  className={`search-page-filter-pill ${filters?.condition === 'Well Used' ? 'search-page-filter-pill-active' : ''}`}
                  onClick={() => handleConditionToggle('Well Used', 'Well Used')}
                >
                  Well Used
                </button>
              </section>

              <section className="search-page-filter-section">
                <h3 className="search-page-filter-title">Price Range</h3>
                <div className="search-page-price-row">
                  <div className="search-page-price-field">
                    <span className="search-page-price-label">Min</span>
                    <div className="search-page-price-input-wrap">
                      <span className="search-page-price-currency">₱</span>
                      <Input
                        type="text"
                        inputMode="numeric"
                        className="search-page-price-input"
                        value={filters?.minPrice ?? ''}
                        onChange={(e) => handlePriceChange('minPrice', e.target.value)}
                        placeholder="0"
                      />
                    </div>
                  </div>
                  <div className="search-page-price-field">
                    <span className="search-page-price-label">Max</span>
                    <div className="search-page-price-input-wrap">
                      <span className="search-page-price-currency">₱</span>
                      <Input
                        type="text"
                        inputMode="numeric"
                        className="search-page-price-input"
                        value={filters?.maxPrice ?? ''}
                        onChange={(e) => handlePriceChange('maxPrice', e.target.value)}
                        placeholder="50,000"
                      />
                    </div>
                  </div>
                </div>
              </section>

              <section className="search-page-filter-section">
                <h3 className="search-page-filter-title">Location</h3>
                <Input
                  type="text"
                  className="search-page-location-input"
                  placeholder="Quezon City, NCR"
                  value={filters?.location ?? ''}
                  onChange={(e) => handleLocationChange(e.target.value)}
                />
              </section>
            </aside>

            <section className="search-page-results">
              <header className="search-page-results-head">
                <div>
                  <h1 className="search-page-title">
                    Showing results for <span className="search-page-query">"{query}"</span>
                  </h1>
                  <p className="search-page-subtitle">
                    {hasResults
                      ? `${results.length} item${results.length === 1 ? '' : 's'} found`
                      : loading
                      ? 'Searching listings...'
                      : 'No items found'}
                  </p>
                </div>
              </header>

              {error && (
                <div className="search-page-error" role="alert">
                  {error}
                </div>
              )}

              {loading ? (
                <div className="search-page-loading">Loading listings...</div>
              ) : hasResults ? (
                <div className="search-page-grid">
                  {results.map((listing) => (
                    <ListingCard
                      key={listing.listing_id ?? listing.id}
                      listing={listing}
                      tagline={listing.seller_name}
                      variant="grid"
                      onClick={() => onViewListing?.(listing.listing_id ?? listing.id)}
                    />
                  ))}
                </div>
              ) : (
                !error && (
                  <div className="search-page-empty">
                    Try a different search term.
                  </div>
                )
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

export default SearchResultsPage;

