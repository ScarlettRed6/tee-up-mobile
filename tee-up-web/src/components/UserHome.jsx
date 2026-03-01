import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { getListings, getRecommendations, getFavorites, addFavorite, removeFavorite } from '../api/userListingsApi';
import UserHeader from './UserHeader';
import ListingCard from './ListingCard';
import './UserHome.css';

function UserHome() {
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [recommended, setRecommended] = useState([]);
  const [recent, setRecent] = useState([]);
  const [saved, setSaved] = useState([]);
  const [savedIds, setSavedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const normalizeListing = (item) => {
    const photos = item.photos != null
      ? (Array.isArray(item.photos) ? item.photos : (typeof item.photos === 'string' ? (() => { try { return JSON.parse(item.photos); } catch { return []; } })() : []))
      : [];
    return {
      ...item,
      id: item.listing_id ?? item.id,
      listing_id: item.listing_id ?? item.id,
      photos,
    };
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [rec, listRes, favRes] = await Promise.all([
        getRecommendations().catch(() => []),
        getListings({ sort: 'newest', status: 'available' }).catch(() => []),
        getFavorites().catch(() => []),
      ]);
      setRecommended(Array.isArray(rec) ? rec.map(normalizeListing) : []);
      setRecent(Array.isArray(listRes) ? listRes.map(normalizeListing) : []);
      const favList = Array.isArray(favRes) ? favRes.map(normalizeListing) : [];
      setSaved(favList);
      setSavedIds(new Set(favList.map((f) => String(f.listing_id ?? f.id))));
    } catch (err) {
      setError(err?.message || 'Failed to load listings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleFavorite = async (listingId) => {
    const id = String(listingId);
    const isCurrentlySaved = savedIds.has(id);
    try {
      if (isCurrentlySaved) {
        await removeFavorite(listingId);
        setSavedIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
        setSaved((prev) => prev.filter((s) => String(s.listing_id ?? s.id) !== id));
      } else {
        await addFavorite(listingId);
        setSavedIds((prev) => new Set([...prev, id]));
        const found = [...recommended, ...recent].find((l) => String(l.listing_id ?? l.id) === id);
        if (found) setSaved((prev) => [normalizeListing(found), ...prev]);
      }
    } catch (e) {
      console.error('Favorite toggle failed', e);
    }
  };

  const handleSearch = (q) => {
    setSearchQuery(q);
    // Could filter local or refetch with search param
  };

  const handleSell = () => {
    // TODO: navigate to sell / create listing
  };

  const handleMessages = () => {
    // TODO: navigate to messages
  };

  const handleMyListings = () => {
    // TODO: navigate to my listings
  };

  const handleProfile = () => {
    // TODO: open profile or logout
    if (window.confirm('Sign out?')) logout();
  };

  return (
    <div className="user-home" style={{ backgroundColor: 'var(--color-background)' }}>
      <UserHeader
        user={user}
        onSearch={handleSearch}
        onSell={handleSell}
        onMessages={handleMessages}
        onMyListings={handleMyListings}
        onNotifications={() => {}}
        onProfile={handleProfile}
      />

      <main className="user-home-main">
        <div className="user-home-container">
          {error && (
            <div className="user-home-error" role="alert">
              {error}
            </div>
          )}

          {loading ? (
            <div className="user-home-loading">Loading…</div>
          ) : (
            <>
              <section className="user-home-section">
                <h2 className="user-home-section-title">Recommended For You</h2>
                <div className="user-home-scroll">
                  {recommended.length === 0 ? (
                    <p className="user-home-empty">No recommendations yet. Browse recently posted below.</p>
                  ) : (
                    recommended.map((listing) => (
                      <ListingCard
                        key={listing.listing_id ?? listing.id}
                        listing={listing}
                        tagline={listing.brand || listing.seller_name}
                        onFavorite={handleFavorite}
                        isFavorite={savedIds.has(String(listing.listing_id ?? listing.id))}
                      />
                    ))
                  )}
                </div>
              </section>

              <section className="user-home-section">
                <h2 className="user-home-section-title">Recently Posted</h2>
                <div className="user-home-scroll">
                  {recent.length === 0 ? (
                    <p className="user-home-empty">No listings yet.</p>
                  ) : (
                    recent.map((listing) => (
                      <ListingCard
                        key={listing.listing_id ?? listing.id}
                        listing={listing}
                        tagline={listing.brand || listing.seller_name}
                        onFavorite={handleFavorite}
                        isFavorite={savedIds.has(String(listing.listing_id ?? listing.id))}
                      />
                    ))
                  )}
                </div>
              </section>

              <section className="user-home-section">
                <h2 className="user-home-section-title">Saved Listings</h2>
                <div className="user-home-scroll">
                  {saved.length === 0 ? (
                    <p className="user-home-empty">Save items you like to find them here.</p>
                  ) : (
                    saved.map((listing) => (
                      <ListingCard
                        key={listing.listing_id ?? listing.id}
                        listing={listing}
                        tagline={listing.brand || listing.seller_name}
                        onFavorite={handleFavorite}
                        isFavorite
                      />
                    ))
                  )}
                </div>
              </section>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default UserHome;
