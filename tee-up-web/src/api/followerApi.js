import axiosInstance from './axiosInstance';

export const followUser = async (userId) => {
  const response = await axiosInstance.post(`/following/follow/${userId}`);
  return response.data;
};

export const unfollowUser = async (userId) => {
  const response = await axiosInstance.delete(`/following/unfollow/${userId}`);
  return response.data;
};

export const getFollowStatus = async (userId) => {
  const response = await axiosInstance.get(`/following/status/${userId}`);
  return response.data;
};
