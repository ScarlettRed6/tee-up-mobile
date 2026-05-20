import axiosInstance from './axiosInstance';

function buildReportFormData(reason, photoFile) {
  const formData = new FormData();
  formData.append('reason', reason);
  if (photoFile) {
    formData.append('photo', photoFile);
  }
  return formData;
}

/**
 * Submit a listing report (authenticated marketplace user).
 * @param {number|string} listingId
 * @param {string} reason
 * @param {File|null} photoFile
 */
export const submitReportListing = async (listingId, reason, photoFile = null) => {
  const response = await axiosInstance.post(
    `/reports/listing/${listingId}`,
    buildReportFormData(reason, photoFile),
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
  return response.data;
};

/**
 * Submit a user report (authenticated marketplace user).
 * @param {number|string} userId
 * @param {string} reason
 * @param {File|null} photoFile
 */
export const submitReportUser = async (userId, reason, photoFile = null) => {
  const response = await axiosInstance.post(
    `/reports/user/${userId}`,
    buildReportFormData(reason, photoFile),
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
  return response.data;
};

/**
 * Reports submitted by the logged-in user (for Settings → My tickets).
 */
export const fetchMyReports = async () => {
  const response = await axiosInstance.get('/reports/mine');
  return response.data?.reports ?? [];
};

/**
 * Get all reports with optional filters
 * @param {string} search - Search term for report ID, reason, or reporter name
 * @param {string} status - Filter by status: 'pending', 'reviewed', 'resolved', 'dismissed'
 * @param {string} type - Filter by type: 'Listing' or 'User'
 * @returns {Promise} API response with reports array
 */
export const getAllReports = async (search = '', status = '', type = '') => {
  const params = {};
  if (search) params.search = search;
  if (status && status !== 'all' && status !== 'All Status') params.status = status;
  if (type && type !== 'all' && type !== 'All Types') params.type = type;

  const response = await axiosInstance.get('/reports/admin/all', { params });
  return response.data;
};

/**
 * Review/update a report status
 * @param {number} reportId - The ID of the report to update
 * @param {string} status - New status: 'resolved' or 'dismissed'
 * @returns {Promise} API response with updated report
 */
export const reviewReport = async (reportId, status) => {
  const response = await axiosInstance.put(`/reports/admin/review/${reportId}`, { status });
  return response.data;
};

