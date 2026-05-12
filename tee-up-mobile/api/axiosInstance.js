import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import  { API_BASE_URL } from '@env';
import Constants from 'expo-constants';

let refreshTokenMemory = null;
let isRefreshing = false;
let failedQueue = [];

export const setRefreshToken = (token) => {
    refreshTokenMemory = token;
};

const debuggerHost = Constants.expoConfig?.hostUri || Constants.manifest2?.extra?.expoGo?.debuggerHost;
const localHost = debuggerHost ? debuggerHost.split(':')[0] : 'localhost'; 

export const getRefreshToken = () => refreshTokenMemory;

const api = axios.create({
    baseURL: `http://${localHost}:5000/api`,
    headers: { 'Content-Type': 'application/json' },
    timeout: 30000, // 30 second timeout (increased for slower connections)
});

// Log API_BASE_URL for debugging
console.log('API_BASE_URL:', `http://${localHost}:5000/api`);

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
            // Skip logging for login endpoint to avoid cluttering console
            const isLoginEndpoint = error.config?.url?.includes('/auth/login');
            if (!isLoginEndpoint) {
            console.error('[API Response Error]', {
                status: error.response.status,
                statusText: error.response.statusText,
                url: error.config?.url,
                data: error.response?.data
            });
            }
        } else {
            // Skip logging for login endpoint
            const isLoginEndpoint = error.config?.url?.includes('/auth/login');
            if (!isLoginEndpoint) {
            console.error('[API Error]', error.message);
            }
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

        return Promise.reject(error);
    }//End of async arrow function
);


export default api;
