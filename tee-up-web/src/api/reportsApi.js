import axiosInstance from './axiosInstance';

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

