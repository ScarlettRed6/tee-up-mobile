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
 * Get distinct categories from backend (for filter dropdowns).
 * Backend: GET /listings/categories
 */
export const getListingCategories = async () => {
  const response = await axiosInstance.get('/listings/categories');
  return response.data.categories || [];
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
 * Fetch a single listing by id (for buyer view).
 * Backend: GET /listings/:id
 */
export const getListingById = async (listingId) => {
  const response = await axiosInstance.get(`/listings/${listingId}`);
  return response.data?.result ?? null;
};

/**
 * Remove listing from favorites (auth required).
 * Backend: DELETE /favorites/:listing_id
 */
export const removeFavorite = async (listingId) => {
  const response = await axiosInstance.delete(`/favorites/${listingId}`);
  return response.data;
};

/**
 * Update listing status (owner, auth required).
 * Backend: PATCH /listings/:listing_id/status
 */
export const updateListingStatus = async (listingId, status) => {
  const response = await axiosInstance.patch(`/listings/${listingId}/status`, { status });
  return response.data;
};

/**
 * Delete a listing (owner, auth required).
 * Backend: DELETE /listings/:id
 */
export const deleteListing = async (listingId) => {
  const response = await axiosInstance.delete(`/listings/${listingId}`);
  return response.data;
};
