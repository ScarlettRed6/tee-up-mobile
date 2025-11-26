import api from "./axiosInstance.js";

export const rateUser = async (ratedUserId, payload) => {
    const res = await api.post(`/ratings/${ratedUserId}`, payload);
    return res.data;
};

export const fetchUserRatings = async (userId) => {
    const res = await api.get(`/ratings/${userId}`);
    return res.data;
};

export const fetchUserRatingSummary = async (userId) => {
    const res = await api.get(`/ratings/${userId}/summary`);
    return res.data;
};

