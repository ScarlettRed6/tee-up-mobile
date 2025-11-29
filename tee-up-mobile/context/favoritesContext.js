import React, { createContext, useContext, useCallback, useState, useMemo } from 'react';
import { Alert } from 'react-native';
import { fetchFavoritesApi, addFavoriteApi, removeFavoriteApi } from '../api/favoritesApi';
import { authContext } from './authContext';

export const favoritesContext = createContext({
  favorites: [],
  favoritesLoading: false,
  favoriteIds: new Set(),
  isFavorite: () => false,
  refreshFavorites: () => Promise.resolve(),
  toggleFavorite: () => Promise.resolve(),
});

export function FavoritesProvider({ children }) {
  const { accessToken } = useContext(authContext);
  const [favorites, setFavorites] = useState([]);
  const [favoritesLoading, setFavoritesLoading] = useState(false);
  const [pendingActions, setPendingActions] = useState({});

  const loadFavorites = useCallback(async () => {
    if (!accessToken) {
      setFavorites([]);
      return;
    }
    setFavoritesLoading(true);
    try {
      const res = await fetchFavoritesApi();
      setFavorites(Array.isArray(res?.favorites) ? res.favorites : []);
    } catch (error) {
      console.error('Failed to fetch favorites:', error.response?.data || error.message);
    } finally {
      setFavoritesLoading(false);
    }
  }, [accessToken]);

  React.useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  const favoriteIdsSet = useMemo(() => {
    const ids = new Set();
    favorites.forEach((fav) => {
      const id = fav.listing_id || fav.id;
      if (id !== undefined && id !== null) {
        ids.add(id.toString());
      }
    });
    return ids;
  }, [favorites]);

  const isFavorite = useCallback(
    (listingId) => {
      if (listingId === undefined || listingId === null) return false;
      return favoriteIdsSet.has(listingId.toString());
    },
    [favoriteIdsSet]
  );

  const toggleFavorite = useCallback(
    async (listingId) => {
      if (!accessToken) {
        Alert.alert('Login required', 'Please login to save listings.');
        return;
      }
      if (listingId === undefined || listingId === null) return;
      const listingKey = listingId.toString();
      setPendingActions((prev) => ({ ...prev, [listingKey]: true }));

      try {
        if (favoriteIdsSet.has(listingKey)) {
          await removeFavoriteApi(listingId);
        } else {
          await addFavoriteApi(listingId);
        }
        await loadFavorites();
      } catch (error) {
        console.error('Failed to toggle favorite:', error.response?.data || error.message);
        Alert.alert('Error', error.response?.data?.message || 'Failed to update favorites.');
      } finally {
        setPendingActions((prev) => {
          const next = { ...prev };
          delete next[listingKey];
          return next;
        });
      }
    },
    [accessToken, favoriteIdsSet, loadFavorites]
  );

  const value = useMemo(
    () => ({
      favorites,
      favoritesLoading,
      favoriteIds: favoriteIdsSet,
      pendingActions,
      isFavorite,
      refreshFavorites: loadFavorites,
      toggleFavorite,
    }),
    [favorites, favoritesLoading, favoriteIdsSet, pendingActions, isFavorite, loadFavorites, toggleFavorite]
  );

  return (
    <favoritesContext.Provider value={value}>
      {children}
    </favoritesContext.Provider>
  );
}


