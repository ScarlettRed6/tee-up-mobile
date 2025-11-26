import AsyncStorage from "@react-native-async-storage/async-storage";
import api, { setRefreshToken } from "./axiosInstance.js";

export const registerUser = async (userData) => {
    const res = await api.post("/auth/register", userData);
    return res.data;
};

export const loginUser = async (creds) => {
    console.log("Sending login payload:", creds);
    try {
        const res = await api.post("/auth/login", creds);
        //console.log("Login response:", res.data);

        await AsyncStorage.setItem("accessToken", res.data.token);

        setRefreshToken(res.data.refreshToken);

        return res.data;
    } catch (err) {
        console.log("Login error(AUTH API):", err.response?.data || err.message);
        throw err;
    }
};

export const googleSignIn = async (idToken) => {
    try {
        const res = await api.post("/auth/google", { idToken });
        
        await AsyncStorage.setItem("accessToken", res.data.token);
        if (res.data.refreshToken) {
            await AsyncStorage.setItem("refreshToken", res.data.refreshToken);
            setRefreshToken(res.data.refreshToken);
        }
        
        return res.data;
    } catch (err) {
        console.log("Google sign-in error:", err.response?.data || err.message);
        throw err;
    }
};

export const sendVerificationOtp = async (email) => {
    const res = await api.post("/auth/send-email-verification", { email });
    return res.data;
};

export const verifyEmailVerificationOtp = async (payload) => {
    const res = await api.post("/auth/verify-email-otp", payload);
    return res.data;
};

export const changePasswordApi = async (payload) => {
    const res = await api.put("/auth/change-password", payload);
    return res.data;
};

export const requestPasswordResetOtp = async (email) => {
    const res = await api.post("/auth/forget-password", { email });
    return res.data;
};

export const verifyPasswordResetOtp = async ({ email, otp }) => {
    const res = await api.post("/auth/verify-otp", { email, otp });
    return res.data;
};

export const resetPasswordWithOtp = async (payload) => {
    const res = await api.post("/auth/reset-password", payload);
    return res.data;
};

