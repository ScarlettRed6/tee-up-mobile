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

