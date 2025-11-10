import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://192.168.254.119:5000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(async (config) => {
    const token = await getToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

const getToken = async () => {
    try{
        return await AsyncStorage.getItem('token');
    }catch(err){
        console.log('Error getting token: ', err);
        return null;
    }
};

export default api;
