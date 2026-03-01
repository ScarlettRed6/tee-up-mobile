import axiosInstance from './axiosInstance';

/**
 * Public listings (no auth required).
 * Backend: GET /listings?sort=&category=&search=...
 */
export const getListings = async (params = {}) => {
  const response = await axiosInstance.get('/listings', { params });
  return response.data.result || [];
};

/**
 * Personalized recommendations (auth required).
 * Backend: GET /listings/recommendations?preferredCategory=&preferredBrand=&preferredPrice=
 */
export const getRecommendations = async (params = {}) => {
  const response = await axiosInstance.get('/listings/recommendations', { params });
  return response.data.recommendations || [];
};

/**
 * User's saved/favorite listings (auth required).
 * Backend: GET /favorites
 */
export const getFavorites = async () => {
  const response = await axiosInstance.get('/favorites');
  return response.data.favorites || [];
};

/**
 * Add listing to favorites (auth required).
 * Backend: POST /favorites/:listing_id
 */
export const addFavorite = async (listingId) => {
  const response = await axiosInstance.post(`/favorites/${listingId}`);
  return response.data;
};

/**
 * Remove listing from favorites (auth required).
 * Backend: DELETE /favorites/:listing_id
 */
export const removeFavorite = async (listingId) => {
  const response = await axiosInstance.delete(`/favorites/${listingId}`);
  return response.data;
};
