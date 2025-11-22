import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import  { API_BASE_URL } from '@env';

let refreshTokenMemory = null;
let isRefreshing = false;
let failedQueue = [];

export const setRefreshToken = (token) => {
    refreshTokenMemory = token;
};

export const getRefreshToken = () => refreshTokenMemory;

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: { 'Content-Type': 'application/json' },
    timeout: 10000, // 10 second timeout
});

// Log API_BASE_URL for debugging
console.log('API_BASE_URL:', API_BASE_URL);

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
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
}, (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
});

api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        // Enhanced error logging
        if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND' || error.code === 'ETIMEDOUT') {
            console.error('[API Network Error]', {
                code: error.code,
                message: error.message,
                url: error.config?.url,
                baseURL: error.config?.baseURL
            });
        } else if (error.response) {
            console.error('[API Response Error]', {
                status: error.response.status,
                statusText: error.response.statusText,
                url: error.config?.url,
                data: error.response.data
            });
        } else {
            console.error('[API Error]', error.message);
        }
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
