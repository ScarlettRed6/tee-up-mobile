import api from "./axiosInstance.js";

export const getUserProfile = async () => {
    const res = await api.get("/user/profile");
    return res.data;
};
