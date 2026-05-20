import axiosInstance from './axiosInstance';

export async function rateUser(ratedUserId, payload) {
  const res = await axiosInstance.post(`/ratings/${ratedUserId}`, payload);
  return res.data;
}

export async function fetchUserRatings(userId) {
  const res = await axiosInstance.get(`/ratings/${userId}`);
  return res.data?.ratings ?? [];
}
