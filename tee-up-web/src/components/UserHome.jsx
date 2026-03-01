import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { getListings, getRecommendations, getFavorites, addFavorite, removeFavorite } from '../api/userListingsApi';
import UserHeader from './UserHeader';
import ListingCard from './ListingCard';
import ListingView from './ListingView';
import OwnerListingView from './OwnerListingView';
import MyListings from './MyListings';
import ProfilePage from './ProfilePage';
import PublicProfilePage from './PublicProfilePage';
import { Alert } from './ui/alert';
import { Card, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Skeleton } from './ui/skeleton';
import { ChevronRight } from 'lucide-react';
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
  const [selectedListingId, setSelectedListingId] = useState(null);
  const [view, setView] = useState('feed');
  const [selectedOwnerListingId, setSelectedOwnerListingId] = useState(null);
  const [selectedProfileUserId, setSelectedProfileUserId] = useState(null);
  const [ownerListingFromView, setOwnerListingFromView] = useState('feed');

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
    setView('myListings');
    setSelectedOwnerListingId(null);
  };

  const handleProfile = () => {
    // No longer used; dropdown uses onOpenProfile / onLogout
  };

  const handleOpenProfile = () => {
    setView('profile');
  };

  const handleLogout = () => {
    if (window.confirm('Sign out?')) logout();
  };

  const handleGoHome = () => {
    setView('feed');
    setSelectedListingId(null);
    setSelectedOwnerListingId(null);
    setSelectedProfileUserId(null);
  };

  const handleListingClick = (listing) => {
    const id = String(listing.listing_id ?? listing.id);
    const isOwnListing = user?.id != null && Number(listing.user_id) === Number(user.id);
    if (isOwnListing) {
      setSelectedOwnerListingId(id);
      setOwnerListingFromView('feed');
      setView('ownerListing');
      setSelectedListingId(null);
    } else {
      setSelectedListingId(id);
      setSelectedOwnerListingId(null);
    }
  };

  return (
    <div className="user-home" style={{ backgroundColor: 'var(--color-background)' }}>
      {view === 'profile' ? (
        <ProfilePage
          user={user}
          onBack={() => setView('feed')}
          onSearch={handleSearch}
          onSell={handleSell}
          onMessages={handleMessages}
          onMyListings={handleMyListings}
          onNotifications={() => {}}
          onOpenProfile={handleOpenProfile}
          onLogout={handleLogout}
          onGoHome={handleGoHome}
          onViewListing={(id) => {
            setSelectedOwnerListingId(String(id));
            setView('ownerListing');
          }}
        />
      ) : view === 'publicProfile' && selectedProfileUserId ? (
        <PublicProfilePage
          profileUserId={selectedProfileUserId}
          currentUser={user}
          onBack={() => setView('feed')}
          onSearch={handleSearch}
          onSell={handleSell}
          onMessages={handleMessages}
          onMyListings={handleMyListings}
          onNotifications={() => {}}
          onOpenProfile={handleOpenProfile}
          onLogout={handleLogout}
          onGoHome={handleGoHome}
          onViewListing={(id) => {
            setSelectedListingId(String(id));
            setView('feed');
          }}
        />
      ) : view === 'ownerListing' && selectedOwnerListingId != null ? (
        <OwnerListingView
          listingId={selectedOwnerListingId}
          onBack={() => setView(ownerListingFromView)}
          user={user}
          onSearch={handleSearch}
          onSell={handleSell}
          onMessages={handleMessages}
          onMyListings={handleMyListings}
          onNotifications={() => {}}
          onOpenProfile={handleOpenProfile}
          onLogout={handleLogout}
          onGoHome={handleGoHome}
        />
      ) : view === 'myListings' ? (
        <MyListings
          user={user}
          onBack={() => setView('feed')}
          onSelectListing={(id) => {
            setSelectedOwnerListingId(id);
            setOwnerListingFromView('myListings');
            setView('ownerListing');
          }}
          onSearch={handleSearch}
          onSell={handleSell}
          onMessages={handleMessages}
          onMyListings={handleMyListings}
          onNotifications={() => {}}
          onOpenProfile={handleOpenProfile}
          onLogout={handleLogout}
          onGoHome={handleGoHome}
        />
      ) : selectedListingId != null ? (
        <ListingView
          listingId={selectedListingId}
          onBack={() => setSelectedListingId(null)}
          user={user}
          onSearch={handleSearch}
          onSell={handleSell}
          onMessages={handleMessages}
          onMyListings={handleMyListings}
          onNotifications={() => {}}
          onOpenProfile={handleOpenProfile}
          onLogout={handleLogout}
          onViewSellerProfile={(userId) => {
            setSelectedProfileUserId(String(userId));
            setView('publicProfile');
          }}
          onGoHome={handleGoHome}
        />
      ) : (
        <>
      <UserHeader
        user={user}
        onSearch={handleSearch}
        onSell={handleSell}
        onMessages={handleMessages}
        onMyListings={handleMyListings}
        onNotifications={() => {}}
        onOpenProfile={handleOpenProfile}
        onLogout={handleLogout}
        onGoHome={handleGoHome}
      />

      <main className="user-home-main">
        <div className="user-home-container">
          {error && (
            <Alert variant="destructive" className="user-home-error" role="alert">
              {error}
            </Alert>
          )}

          {!loading && (
            <section className="user-home-hero-wrap">
              <Card className="user-home-hero">
                <CardHeader className="user-home-hero-header">
                  <p className="user-home-hero-label">Pre-owned golf gear</p>
                  <CardTitle className="user-home-hero-text">
                    Find your next club
                  </CardTitle>
                  <CardDescription className="user-home-hero-sub">
                    Browse listings from sellers in your community. Make an offer and get fitted for your game.
                  </CardDescription>
                  <Button
                    size="lg"
                    className="user-home-hero-cta"
                    onClick={() => document.getElementById('user-home-recent')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    Browse listings
                    <ChevronRight className="ml-2 h-5 w-5" />
                  </Button>
                </CardHeader>
              </Card>
              <p className="user-home-trust">
                Authentic gear from verified sellers · Make an offer anytime
              </p>
            </section>
          )}

          {loading ? (
            <div className="user-home-loading">
              <div className="user-home-section">
                <Skeleton className="h-6 w-36 mb-1" />
                <Skeleton className="h-8 w-48 mb-4" />
                <div className="user-home-scroll">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-[280px] w-[220px] shrink-0 rounded-xl" />
                  ))}
                </div>
              </div>
              <div className="user-home-section">
                <Skeleton className="h-6 w-32 mb-1" />
                <Skeleton className="h-8 w-40 mb-4" />
                <div className="user-home-grid">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <Skeleton key={i} className="h-[280px] w-full rounded-xl" />
                  ))}
                </div>
              </div>
              <div className="user-home-section">
                <Skeleton className="h-6 w-28 mb-1" />
                <Skeleton className="h-8 w-36 mb-4" />
                <div className="user-home-scroll">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-[280px] w-[220px] shrink-0 rounded-xl" />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <>
              <section className="user-home-section user-home-section-recommended">
                <header className="user-home-section-head">
                  <span className="user-home-section-label">Picked for you</span>
                  <h2 className="user-home-section-title">Recommended</h2>
                </header>
                <div className="user-home-scroll">
                  {recommended.length === 0 ? (
                    <p className="user-home-empty">No recommendations yet. Check out recently posted below.</p>
                  ) : (
                    recommended.map((listing) => (
                      <ListingCard
                        key={listing.listing_id ?? listing.id}
                        listing={listing}
                        tagline={listing.seller_name}
                        onFavorite={handleFavorite}
                        isFavorite={savedIds.has(String(listing.listing_id ?? listing.id))}
                        onClick={() => handleListingClick(listing)}
                      />
                    ))
                  )}
                </div>
              </section>

              <section id="user-home-recent" className="user-home-section user-home-section-recent">
                <header className="user-home-section-head">
                  <span className="user-home-section-label">Latest arrivals</span>
                  <h2 className="user-home-section-title">Recently Posted</h2>
                </header>
                <div className="user-home-grid">
                  {recent.length === 0 ? (
                    <p className="user-home-empty user-home-empty-grid">No listings yet. List something to get started.</p>
                  ) : (
                    recent.map((listing) => (
                      <ListingCard
                        key={listing.listing_id ?? listing.id}
                        listing={listing}
                        tagline={listing.seller_name}
                        onFavorite={handleFavorite}
                        isFavorite={savedIds.has(String(listing.listing_id ?? listing.id))}
                        onClick={() => handleListingClick(listing)}
                        variant="grid"
                      />
                    ))
                  )}
                </div>
              </section>

              <section className="user-home-section user-home-section-saved">
                <header className="user-home-section-head">
                  <span className="user-home-section-label">Your list</span>
                  <h2 className="user-home-section-title">Saved</h2>
                </header>
                <div className="user-home-scroll">
                  {saved.length === 0 ? (
                    <p className="user-home-empty">Save items you like to find them here.</p>
                  ) : (
                    saved.map((listing) => (
                      <ListingCard
                        key={listing.listing_id ?? listing.id}
                        listing={listing}
                        tagline={listing.seller_name}
                        onFavorite={handleFavorite}
                        isFavorite
                        onClick={() => handleListingClick(listing)}
                      />
                    ))
                  )}
                </div>
              </section>
            </>
          )}
        </div>
      </main>
        </>
      )}
    </div>
  );
}

export default UserHome;
