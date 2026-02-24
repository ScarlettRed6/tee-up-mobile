import axiosInstance from './axiosInstance';

/**
 * Admin: fetch all listings with optional filters.
 * Backend: GET /listings/admin/all?search=&category=&condition=&status=&location=
 */
export const getAdminListings = async (params = {}) => {
  const { search, category, condition, status, location } = params;
  const query = {};
  if (search && search.trim()) query.search = search.trim();
  if (category && category !== 'all') query.category = category;
  if (condition && condition !== 'all') query.condition = condition;
  if (status && status !== 'all') query.status = status;
  if (location && location !== 'all') query.location = location;

  const response = await axiosInstance.get('/listings/admin/all', { params: query });
  return response.data;
};

/**
 * Admin: fetch single listing by id for detail view.
 * Backend: GET /listings/admin/listing/:id
 */
export const getAdminListingById = async (listingId) => {
  const response = await axiosInstance.get(`/listings/admin/listing/${listingId}`);
  return response.data;
};

/**
 * Admin: update listing status (e.g. pending -> active, active -> sold).
 * Backend: PUT /listings/admin/status/:id  body: { status }
 */
export const updateAdminListingStatus = async (listingId, status) => {
  const response = await axiosInstance.put(`/listings/admin/status/${listingId}`, { status });
  return response.data;
};

/**
 * Admin: delete a listing.
 * Backend: DELETE /listings/admin/delete/:id
 */
export const deleteAdminListing = async (listingId) => {
  const response = await axiosInstance.delete(`/listings/admin/delete/${listingId}`);
  return response.data;
};
