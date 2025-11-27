import api from './axiosInstance';

export const followUser = async (userId) => {
  const response = await api.post(`/following/follow/${userId}`);
  return response.data;
};

export const unfollowUser = async (userId) => {
  const response = await api.delete(`/following/unfollow/${userId}`);
  return response.data;
};

export const getFollowerCount = async (userId) => {
  const endpoint = userId ? `/following/followers/${userId}` : '/following/followers';
  const response = await api.get(endpoint);
  return response.data;
};

export const getFollowStatus = async (userId) => {
  const response = await api.get(`/following/status/${userId}`);
  return response.data;
};

