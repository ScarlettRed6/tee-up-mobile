import api from "./axiosInstance.js";

export const fetchFavoritesApi = async () => {
  const res = await api.get("/favorites");
  return res.data;
};

export const addFavoriteApi = async (listingId) => {
  const res = await api.post(`/favorites/${listingId}`);
  return res.data;
};

export const removeFavoriteApi = async (listingId) => {
  const res = await api.delete(`/favorites/${listingId}`);
  return res.data;
};


