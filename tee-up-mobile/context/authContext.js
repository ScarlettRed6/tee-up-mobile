import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginUser, registerUser, googleSignIn, changePasswordApi } from '../api/authApi';
import jwtDecode from 'jwt-decode';
import { setRefreshToken } from '../api/axiosInstance';

export const authContext = createContext();

export const AuthProvider = ({ children }) => { 
    const [accessToken, setAccessToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadToken = async () => {
            const storedToken = await AsyncStorage.getItem('accessToken');
            const storedRefresh = await AsyncStorage.getItem("refreshToken");
            
            if (storedRefresh) setRefreshToken(storedRefresh);

            if (storedToken) {
                try{
                    const decoded = jwtDecode(storedToken);
                    console.log("Decoded token:", decoded);
                    const currentTime = Date.now() / 1000;

                    if(decoded.exp > currentTime){
                        setAccessToken(storedToken);
                    }else {
                        console.log("Access Token expired. Removing from storage.");
                        await AsyncStorage.removeItem('accessToken');
                    }

                }catch(err){
                    console.log("Invalid token:", err.message);
                    await AsyncStorage.removeItem('accessToken');
                }
            }
            
            setLoading(false);
        };
        loadToken();
    }, []);

    const login = async (email, password) => {
        const data = await loginUser({ email, password });
        await AsyncStorage.setItem('accessToken', data.token);
        await AsyncStorage.setItem("refreshToken", data.refreshToken);
        setAccessToken(data.token);
        setRefreshToken(data.refreshToken);
    };

    const loginWithGoogle = async (idToken) => {
        const data = await googleSignIn(idToken);
        await AsyncStorage.setItem('accessToken', data.token);
        if (data.refreshToken) {
            await AsyncStorage.setItem("refreshToken", data.refreshToken);
            setRefreshToken(data.refreshToken);
        }
        setAccessToken(data.token);
    };

    const logout = async () => {
        await AsyncStorage.removeItem('accessToken');
        await AsyncStorage.removeItem('refreshToken');
        setAccessToken(null);
        setRefreshToken(null);
    };

    const register = async (userData) => {
        const data = await registerUser(userData);
        return data;
    };

    const changePassword = async (payload) => {
        return changePasswordApi(payload);
    };

    return (
        <authContext.Provider value={{ accessToken, login, loginWithGoogle, logout, register, changePassword, loading }}>
            {children}
        </authContext.Provider>
    );

};

