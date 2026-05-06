import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { getListings, getRecommendations, getFavorites, addFavorite, removeFavorite, getListingById } from '../api/userListingsApi';
import { followUser, unfollowUser } from '../api/followerApi';
import { findOrCreateConversation } from '../api/chatApi';
import UserHeader from './UserHeader';
import ListingCard from './ListingCard';
import ListingView from './ListingView';
import OwnerListingView from './OwnerListingView';
import MyListings from './MyListings';
import SellListingPage from './SellListingPage';
import ProfilePage from './ProfilePage';
import PublicProfilePage from './PublicProfilePage';
import MessagesPage from './MessagesPage';
import { Alert } from './ui/alert';
import { Button } from './ui/button';
import { Skeleton } from './ui/skeleton';
import { ChevronRight } from 'lucide-react';
import SearchResultsPage from './SearchResultsPage';
import NotificationsPage from './NotificationsPage';
import LogoutConfirmModal from './LogoutConfirmModal';
import { getSocket } from '../utils/socketClient';
import './UserHome.css';

// Golf slideshow for logged-in hero (same style as landing)
const HERO_SLIDES = [
  'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=1200&q=80',
  'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=1200&q=80',
  'https://images.unsplash.com/photo-1545241047-6083a3684587?w=1200&q=80',
  'https://images.unsplash.com/photo-1593111774240-d2b1dc2b16e2?w=1200&q=80',
];

function UserHome() {
  const { user, logout, refreshProfile } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [searchFilters, setSearchFilters] = useState({
    category: null,
    condition: null,
    minPrice: '',
    maxPrice: '',
    location: '',
  });
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
  const [editingListing, setEditingListing] = useState(null);
  const [heroIndex, setHeroIndex] = useState(0);
  const [messagesListingContext, setMessagesListingContext] = useState(null);
  const [initialMessagesConversationId, setInitialMessagesConversationId] = useState(null);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const previewLimit = 10;
  const recommendedPreview = recommended.slice(0, previewLimit);
  const latestArrivals = recent.slice(0, previewLimit);
  const isApplyingHistoryRef = useRef(false);
  const sendingOfferRef = useRef(false);

  const getRouteState = useCallback(() => {
    if (selectedListingId != null) {
      return { route: 'listing', listingId: String(selectedListingId) };
    }
    if (view === 'ownerListing' && selectedOwnerListingId != null) {
      return {
        route: 'ownerListing',
        listingId: String(selectedOwnerListingId),
        from: ownerListingFromView,
      };
    }
    if (view === 'publicProfile' && selectedProfileUserId != null) {
      return { route: 'publicProfile', userId: String(selectedProfileUserId) };
    }
    if (view === 'search' && searchQuery) {
      return { route: 'search', query: searchQuery };
    }
    return { route: view };
  }, [
    selectedListingId,
    view,
    selectedOwnerListingId,
    ownerListingFromView,
    selectedProfileUserId,
    searchQuery,
  ]);

  const applyRouteState = useCallback((routeState) => {
    const route = routeState?.route || 'feed';
    isApplyingHistoryRef.current = true;

    setSelectedListingId(null);
    setSelectedOwnerListingId(null);
    setSelectedProfileUserId(null);
    setInitialMessagesConversationId(null);

    if (route === 'listing' && routeState?.listingId) {
      setView('feed');
      setSelectedListingId(String(routeState.listingId));
      return;
    }
    if (route === 'ownerListing' && routeState?.listingId) {
      setView('ownerListing');
      setSelectedOwnerListingId(String(routeState.listingId));
      setOwnerListingFromView(routeState.from || 'feed');
      return;
    }
    if (route === 'publicProfile' && routeState?.userId) {
      setView('publicProfile');
      setSelectedProfileUserId(String(routeState.userId));
      return;
    }
    if (route === 'search' && routeState?.query) {
      setSearchQuery(String(routeState.query));
      setView('search');
      return;
    }

    setView(route);
    if (route === 'feed') {
      setSearchQuery('');
      setSearchResults([]);
      setSearchError(null);
    }
  }, []);

  useEffect(() => {
    const onPopState = (event) => {
      const routeState = event.state?.userHomeRoute;
      if (routeState) {
        applyRouteState(routeState);
      }
    };

    window.addEventListener('popstate', onPopState);
    window.history.replaceState({ userHomeRoute: getRouteState() }, '');

    return () => {
      window.removeEventListener('popstate', onPopState);
    };
  }, [applyRouteState, getRouteState]);

  useEffect(() => {
    if (isApplyingHistoryRef.current) {
      isApplyingHistoryRef.current = false;
      return;
    }
    window.history.pushState({ userHomeRoute: getRouteState() }, '');
  }, [getRouteState]);

  useEffect(() => {
    HERO_SLIDES.forEach((src) => { const img = new Image(); img.src = src; });
  }, []);
  useEffect(() => {
    const id = setInterval(() => setHeroIndex((i) => (i + 1) % HERO_SLIDES.length), 6000);
    return () => clearInterval(id);
  }, []);

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

  // Load search results whenever we have a query and are in the search view
  useEffect(() => {
    if (!searchQuery || view !== 'search') return;
    let cancelled = false;
    const run = async () => {
      setSearchLoading(true);
      setSearchError(null);
      try {
        const params = {
          search: searchQuery,
          status: 'available',
          sort: 'newest',
        };

        if (searchFilters.category) {
          params.category = searchFilters.category;
        }
        if (searchFilters.condition) {
          params.condition = searchFilters.condition;
        }
        if (searchFilters.minPrice) {
          const minNum = Number(searchFilters.minPrice);
          if (!Number.isNaN(minNum) && minNum >= 0) {
            params.min_price = minNum;
          }
        }
        if (searchFilters.maxPrice) {
          const maxNum = Number(searchFilters.maxPrice);
          if (!Number.isNaN(maxNum) && maxNum >= 0) {
            params.max_price = maxNum;
          }
        }
        if (searchFilters.location) {
          params.location = searchFilters.location;
        }

        const list = await getListings(params);
        if (!cancelled) {
          setSearchResults(Array.isArray(list) ? list.map(normalizeListing) : []);
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Search failed', err);
          setSearchError(err?.message || 'Failed to search listings');
          setSearchResults([]);
        }
      } finally {
        if (!cancelled) {
          setSearchLoading(false);
        }
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [searchQuery, view, searchFilters]);

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
    const trimmed = (q || '').trim();
    if (!trimmed) return;
    setSearchQuery(trimmed);
    setView('search');
    setSelectedListingId(null);
    setSelectedOwnerListingId(null);
    setSelectedProfileUserId(null);
  };

  const handleSell = () => {
    setView('sell');
    setSelectedListingId(null);
    setSelectedOwnerListingId(null);
    setSelectedProfileUserId(null);
    setEditingListing(null);
  };

  const handleMessages = useCallback(async (listingContext = null) => {
    const hasOfferIntent = Boolean(listingContext?.initialMessage);

    if (hasOfferIntent && !sendingOfferRef.current) {
      sendingOfferRef.current = true;
      try {
        const conversation = await findOrCreateConversation(
          listingContext.sellerId,
          listingContext.listingId
        );
        const conversationId = conversation?.conversation_id ?? null;
        if (conversationId) {
          const socket = getSocket();
          socket.emit('send_message', {
            conversationId,
            message: listingContext.initialMessage,
            image_url: null,
          });
          setInitialMessagesConversationId(conversationId);
        } else {
          setInitialMessagesConversationId(null);
        }
        setMessagesListingContext({
          sellerId: listingContext.sellerId,
          listingId: listingContext.listingId,
          listingTitle: listingContext.listingTitle,
        });
      } catch (err) {
        console.error('Failed to send offer from listing', err);
        setInitialMessagesConversationId(null);
        setMessagesListingContext({
          sellerId: listingContext.sellerId,
          listingId: listingContext.listingId,
          listingTitle: listingContext.listingTitle,
        });
      } finally {
        sendingOfferRef.current = false;
      }
    } else {
      setInitialMessagesConversationId(listingContext?.conversationId ?? null);
      setMessagesListingContext(listingContext);
    }

    setView('messages');
    setSelectedListingId(null);
    setSelectedOwnerListingId(null);
    setSelectedProfileUserId(null);
  }, []);

  const handleMyListings = () => {
    setView('myListings');
    setSelectedOwnerListingId(null);
  };

  const handleViewAllNotifications = () => {
    setView('notifications');
    setSelectedListingId(null);
    setSelectedOwnerListingId(null);
    setSelectedProfileUserId(null);
  };

  const handleNotificationClick = (notification) => {
    const { type, data } = notification;
    if (type === 'new_message' && data?.conversationId) {
      setInitialMessagesConversationId(data.conversationId);
      setView('messages');
      setSelectedListingId(null);
      setSelectedOwnerListingId(null);
      setSelectedProfileUserId(null);
      return;
    }
    if (
      (type === 'favorite_sold' ||
        type === 'favorite_status_changed' ||
        type === 'listing_favorited' ||
        type === 'followed_new_listing') &&
      data?.listing_id
    ) {
      openListingById(data.listing_id);
      return;
    }
    if (type === 'new_follower' && data?.follower_id) {
      setSelectedProfileUserId(String(data.follower_id));
      setView('publicProfile');
      setSelectedListingId(null);
      setSelectedOwnerListingId(null);
      return;
    }
    if (type === 'rating_received') {
      setView('profile');
      setSelectedListingId(null);
      setSelectedOwnerListingId(null);
      setSelectedProfileUserId(null);
      return;
    }
  };

  const handleOpenMessages = (conversationId) => {
    if (conversationId) setInitialMessagesConversationId(conversationId);
    setMessagesListingContext(null);
    setView('messages');
    setSelectedListingId(null);
    setSelectedOwnerListingId(null);
    setSelectedProfileUserId(null);
  };

  const handleOpenUserProfile = (userId) => {
    setSelectedProfileUserId(String(userId));
    setView('publicProfile');
    setSelectedListingId(null);
    setSelectedOwnerListingId(null);
  };

  const handleProfile = () => {
    // No longer used; dropdown uses onOpenProfile / onLogout
  };

  const handleOpenProfile = () => {
    setView('profile');
  };

  const handleLogout = () => setLogoutModalOpen(true);
  const confirmLogout = () => {
    setLogoutModalOpen(false);
    logout();
  };

  const handleGoHome = () => {
    setView('feed');
    setSelectedListingId(null);
    setSelectedOwnerListingId(null);
    setSelectedProfileUserId(null);
    setSearchQuery('');
    setSearchResults([]);
    setSearchError(null);
    setMessagesListingContext(null);
    setInitialMessagesConversationId(null);
    setSearchFilters({
      category: null,
      condition: null,
      minPrice: '',
      maxPrice: '',
      location: '',
    });
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

  const openListingById = useCallback(
    async (listingId) => {
      const idStr = String(listingId);
      const fromMemory =
        [...recent, ...recommended, ...saved, ...searchResults].find(
          (l) => String(l.listing_id ?? l.id) === idStr
        ) || null;

      if (fromMemory) {
        handleListingClick(fromMemory);
        return;
      }

      try {
        const fetched = await getListingById(idStr);
        if (!fetched) return;
        const normalized = normalizeListing(fetched);
        handleListingClick(normalized);
      } catch (err) {
        console.error('Failed to open listing by id', listingId, err);
      }
    },
    [recent, recommended, saved, searchResults, handleListingClick]
  );

  const handlePublicProfileFollowUser = useCallback(async (targetUserId, shouldFollow) => {
    if (!targetUserId) return;
    if (shouldFollow) {
      await followUser(targetUserId);
      return;
    }
    await unfollowUser(targetUserId);
  }, []);

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
          onViewAllNotifications={handleViewAllNotifications}
          onNotificationClick={handleNotificationClick}
          onOpenProfile={handleOpenProfile}
          onLogout={handleLogout}
          onGoHome={handleGoHome}
          onEditProfile={async () => {
            await refreshProfile();
          }}
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
          onViewAllNotifications={handleViewAllNotifications}
          onNotificationClick={handleNotificationClick}
          onOpenProfile={handleOpenProfile}
          onLogout={handleLogout}
          onGoHome={handleGoHome}
          onFollowUser={handlePublicProfileFollowUser}
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
          onViewAllNotifications={handleViewAllNotifications}
          onNotificationClick={handleNotificationClick}
          onOpenProfile={handleOpenProfile}
          onLogout={handleLogout}
          onGoHome={handleGoHome}
          onEditListing={(listing) => {
            setEditingListing(listing);
            setView('editListing');
          }}
        />
      ) : view === 'search' && searchQuery ? (
        <SearchResultsPage
          user={user}
          query={searchQuery}
          results={searchResults}
          loading={searchLoading}
          error={searchError}
          filters={searchFilters}
          onFiltersChange={setSearchFilters}
          onBack={handleGoHome}
          onSearch={handleSearch}
          onSell={handleSell}
          onMessages={handleMessages}
          onMyListings={handleMyListings}
          onNotifications={() => {}}
          onViewAllNotifications={handleViewAllNotifications}
          onNotificationClick={handleNotificationClick}
          onOpenProfile={handleOpenProfile}
          onLogout={handleLogout}
          onGoHome={handleGoHome}
          onViewListing={openListingById}
        />
      ) : view === 'notifications' ? (
        <NotificationsPage
          user={user}
          onBack={() => setView('feed')}
          onSearch={handleSearch}
          onSell={handleSell}
          onMessages={handleMessages}
          onMyListings={handleMyListings}
          onNotifications={() => {}}
          onViewAllNotifications={handleViewAllNotifications}
          onNotificationClick={handleNotificationClick}
          onOpenProfile={handleOpenProfile}
          onLogout={handleLogout}
          onGoHome={handleGoHome}
          onViewListing={openListingById}
          onOpenMessages={handleOpenMessages}
          onOpenUserProfile={handleOpenUserProfile}
        />
      ) : view === 'messages' ? (
        <MessagesPage
          user={user}
          onSearch={handleSearch}
          onSell={handleSell}
          onMessages={handleMessages}
          onMyListings={handleMyListings}
          onNotifications={() => {}}
          onViewAllNotifications={handleViewAllNotifications}
          onNotificationClick={handleNotificationClick}
          onOpenProfile={handleOpenProfile}
          onLogout={handleLogout}
          onGoHome={handleGoHome}
          listingContext={messagesListingContext}
          onViewListing={openListingById}
          initialConversationId={initialMessagesConversationId}
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
          onViewAllNotifications={handleViewAllNotifications}
          onNotificationClick={handleNotificationClick}
          onOpenProfile={handleOpenProfile}
          onLogout={handleLogout}
          onGoHome={handleGoHome}
        />
      ) : view === 'sell' ? (
        <SellListingPage
          user={user}
          onSearch={handleSearch}
          onSell={handleSell}
          onMessages={handleMessages}
          onMyListings={handleMyListings}
          onNotifications={() => {}}
          onOpenProfile={handleOpenProfile}
          onLogout={handleLogout}
          onGoHome={handleGoHome}
          onListingCreated={async (_created, status) => {
            await loadData();
            setView(status === 'pending' ? 'myListings' : 'feed');
          }}
        />
      ) : view === 'editListing' && editingListing ? (
        <SellListingPage
          user={user}
          mode="edit"
          initialListing={editingListing}
          onSearch={handleSearch}
          onSell={handleSell}
          onMessages={handleMessages}
          onMyListings={handleMyListings}
          onNotifications={() => {}}
          onOpenProfile={handleOpenProfile}
          onLogout={handleLogout}
          onGoHome={handleGoHome}
          onBack={() => setView('ownerListing')}
          onListingUpdated={async (updated) => {
            await loadData();
            if (updated?.listing_id || updated?.id) {
              setSelectedOwnerListingId(String(updated.listing_id ?? updated.id));
            }
            setView('ownerListing');
          }}
        />
      ) : view === 'recommendedAll' ? (
        <>
          <UserHeader
            user={user}
            onSearch={handleSearch}
            onSell={handleSell}
            onMessages={handleMessages}
            onMyListings={handleMyListings}
            onNotifications={() => {}}
            onViewAllNotifications={handleViewAllNotifications}
            onNotificationClick={handleNotificationClick}
            onOpenProfile={handleOpenProfile}
            onLogout={handleLogout}
            onGoHome={handleGoHome}
          />
          <main className="user-home-main">
            <div className="user-home-container user-home-list-page">
              <Button variant="ghost" size="sm" className="user-home-list-back" onClick={handleGoHome}>
                Back to feed
              </Button>
              <section className="user-home-section">
                <header className="user-home-section-head">
                  <span className="user-home-section-label">Picked for you</span>
                  <h2 className="user-home-section-title">All Recommendations</h2>
                </header>
                <div className="user-home-grid">
                  {recommended.length === 0 ? (
                    <p className="user-home-empty user-home-empty-grid">No recommendations yet. Check out recent posts.</p>
                  ) : (
                    recommended.map((listing) => (
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
            </div>
          </main>
        </>
      ) : view === 'recentAll' ? (
        <>
          <UserHeader
            user={user}
            onSearch={handleSearch}
            onSell={handleSell}
            onMessages={handleMessages}
            onMyListings={handleMyListings}
            onNotifications={() => {}}
            onViewAllNotifications={handleViewAllNotifications}
            onNotificationClick={handleNotificationClick}
            onOpenProfile={handleOpenProfile}
            onLogout={handleLogout}
            onGoHome={handleGoHome}
          />
          <main className="user-home-main">
            <div className="user-home-container user-home-list-page">
              <Button variant="ghost" size="sm" className="user-home-list-back" onClick={handleGoHome}>
                Back to feed
              </Button>
              <section className="user-home-section">
                <header className="user-home-section-head">
                  <span className="user-home-section-label">Latest arrivals</span>
                  <h2 className="user-home-section-title">All Recently Posted</h2>
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
            </div>
          </main>
        </>
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
          onViewAllNotifications={handleViewAllNotifications}
          onNotificationClick={handleNotificationClick}
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
        onViewAllNotifications={handleViewAllNotifications}
        onNotificationClick={handleNotificationClick}
        onOpenProfile={handleOpenProfile}
        onLogout={handleLogout}
        onGoHome={handleGoHome}
      />

      <main className="user-home-main">
          {!loading && (
            <section className="user-home-hero-wrap" aria-label="Featured">
              <div className="user-home-hero-slides" aria-hidden="true">
                {HERO_SLIDES.map((src, i) => (
                  <div
                    key={src}
                    className={`user-home-hero-slide ${i === heroIndex ? 'user-home-hero-slide-active' : ''}`}
                    style={{ backgroundImage: `url('${src}')` }}
                  />
                ))}
              </div>
              <div className="user-home-hero-overlay" aria-hidden="true" />
              <div className="user-home-hero-content">
                <p className="user-home-hero-label">Pre-owned golf gear</p>
                <h2 className="user-home-hero-text">Find your next club</h2>
                <p className="user-home-hero-sub">
                  Browse listings from sellers in your community. Make an offer and get fitted for your game.
                </p>
                <Button
                  size="lg"
                  className="user-home-hero-cta"
                  onClick={() => document.getElementById('user-home-recent')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Browse listings
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </section>
          )}

        <div className="user-home-container">
          {error && (
            <Alert variant="destructive" className="user-home-error" role="alert">
              {error}
            </Alert>
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
                <div className="user-home-scroll">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-[280px] w-[220px] shrink-0 rounded-xl" />
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
                  {recommendedPreview.length === 0 ? (
                    <p className="user-home-empty">No recommendations yet. Check out recently posted below.</p>
                  ) : (
                    <>
                      {recommendedPreview.map((listing) => (
                        <ListingCard
                          key={listing.listing_id ?? listing.id}
                          listing={listing}
                          tagline={listing.seller_name}
                          onFavorite={handleFavorite}
                          isFavorite={savedIds.has(String(listing.listing_id ?? listing.id))}
                          onClick={() => handleListingClick(listing)}
                        />
                      ))}
                      {recommended.length > previewLimit && (
                        <button
                          type="button"
                          className="user-home-more-card"
                          onClick={() => setView('recommendedAll')}
                        >
                          <span className="user-home-more-title">More Recommendations</span>
                          <span className="user-home-more-subtitle">See all picks for you</span>
                          <ChevronRight className="user-home-more-icon" />
                        </button>
                      )}
                    </>
                  )}
                </div>
              </section>

              <section id="user-home-recent" className="user-home-section user-home-section-recent">
                <header className="user-home-section-head">
                  <span className="user-home-section-label">Latest arrivals</span>
                  <h2 className="user-home-section-title">Recently Posted</h2>
                </header>
                <div className="user-home-scroll">
                  {latestArrivals.length === 0 ? (
                    <p className="user-home-empty">No listings yet. List something to get started.</p>
                  ) : (
                    <>
                      {latestArrivals.map((listing) => (
                        <ListingCard
                          key={listing.listing_id ?? listing.id}
                          listing={listing}
                          tagline={listing.seller_name}
                          onFavorite={handleFavorite}
                          isFavorite={savedIds.has(String(listing.listing_id ?? listing.id))}
                          onClick={() => handleListingClick(listing)}
                        />
                      ))}
                      {recent.length > previewLimit && (
                        <button
                          type="button"
                          className="user-home-more-card"
                          onClick={() => setView('recentAll')}
                        >
                          <span className="user-home-more-title">More Recent Posts</span>
                          <span className="user-home-more-subtitle">Browse all latest arrivals</span>
                          <ChevronRight className="user-home-more-icon" />
                        </button>
                      )}
                    </>
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
      <LogoutConfirmModal
        open={logoutModalOpen}
        roleLabel="user"
        onCancel={() => setLogoutModalOpen(false)}
        onConfirm={confirmLogout}
      />
    </div>
  );
}

export default UserHome;
