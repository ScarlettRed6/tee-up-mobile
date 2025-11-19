import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

let refreshTokenMemory = null;
let isRefreshing = false;
let failedQueue = [];

export const setRefreshToken = (token) => {
    refreshTokenMemory = token;
};

export const getRefreshToken = () => refreshTokenMemory;

const API_BASE_URL = 'http://192.168.1.20:5000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: { 'Content-Type': 'application/json' },
});

async function getAccessToken(){
    return await AsyncStorage.getItem("accessToken");
}

const processQueue = (error, token = null) => {
    failedQueue.forEach((prom) => {
        if (error) prom.reject(error);
        else prom.resolve(token);
    });
    failedQueue = [];
};

api.interceptors.request.use(async (config) => {
    const token = await getAccessToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        if(error.response?.status === 401 && !originalRequest._retry){
            originalRequest._retry = true;

            if(isRefreshing){
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then((token) => {
                    originalRequest.headers.Authorization = "Bearer " + token;
                    return api(originalRequest);
                }).catch((err) => {
                    return Promise.reject(err);
                });
            }

            isRefreshing = true;
            const refreshToken = getRefreshToken();

            if(!refreshToken){
                console.log("No refresh token available");
                return Promise.reject(error);
            }

            try{
                const res = await axios.post(`${API_BASE_URL}/auth/refresh`, {
                    refreshToken: refreshToken,
                });

                const newAccessToken = res.data.token;
                await AsyncStorage.setItem("accessToken", newAccessToken);

                api.defaults.headers.Authorization = `Bearer ${newAccessToken}`;
                processQueue(null, newAccessToken);
                isRefreshing = false;

                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                return api(originalRequest);
            }catch(err){
                processQueue(err, null);
                isRefreshing = false;
                return Promise.reject(err);
            }

        }//end of if statement for checking unauthorized and or not already retrying
    }//End of async arrow function
);


export default api;
