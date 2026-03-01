import axiosInstance from './axiosInstance';

/**
 * Dashboard stats from backend admin endpoints.
 * All require admin auth.
 */

export const getTotalUsers = async () => {
  const response = await axiosInstance.get('/user/admin/total');
  return response.data.totalUsers ?? 0;
};

export const getActiveUsersCount = async () => {
  const response = await axiosInstance.get('/user/admin/active');
  return response.data.activeCount ?? 0;
};

export const getTotalListingsCount = async () => {
  const response = await axiosInstance.get('/listings/admin/count');
  return response.data.totalListings ?? 0;
};

export const getPendingReportsCount = async () => {
  const response = await axiosInstance.get('/reports/admin/pending');
  return response.data.reportCount ?? 0;
};

export const getCompletedReportsCount = async () => {
  const response = await axiosInstance.get('/reports/admin/completed');
  return response.data.reportCount ?? 0;
};

export const getTopSellers = async (limit = 10) => {
  const response = await axiosInstance.get('/user/admin/top-sellers', { params: { limit } });
  return response.data.topSellers ?? [];
};

/**
 * Fetch all dashboard data in parallel for the admin dashboard.
 */
export const getDashboardData = async () => {
  const [
    totalUsers,
    activeCount,
    totalListings,
    pendingReports,
    completedReports,
    topSellers,
  ] = await Promise.all([
    getTotalUsers(),
    getActiveUsersCount(),
    getTotalListingsCount(),
    getPendingReportsCount(),
    getCompletedReportsCount(),
    getTopSellers(10),
  ]);

  return {
    totalUsers: Number(totalUsers),
    activeUsers: Number(activeCount),
    totalListings: Number(totalListings),
    flaggedListings: {
      pending: Number(pendingReports),
      complete: Number(completedReports),
    },
    topSellers: Array.isArray(topSellers)
      ? topSellers.map((s) => ({
          name: s.name ?? 'Unknown',
          rating: Number(s.rating) || 0,
          sales: Number(s.total_sales) || 0,
        }))
      : [],
  };
};
