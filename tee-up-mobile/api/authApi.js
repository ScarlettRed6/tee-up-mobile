import api from "./axiosInstance.js";

export const registerUser = async (userData) => {
    const res = await api.post("/auth/register", userData);
    return res.data;
};

export const loginUser = async (creds) => {
    console.log("Sending login payload:", creds);
    try {
        const res = await api.post("/auth/login", creds);
        console.log("Login response:", res.data);
        return res.data;
    } catch (err) {
        console.log("Login error:", err.response?.data || err.message);
        throw err;
    }
};

