import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginUser, registerUser } from '../api/authApi';
import jwtDecode from 'jwt-decode';

export const authContext = createContext();

export const AuthProvider = ({ children }) => { 
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadToken = async () => {
            const storedToken = await AsyncStorage.getItem('token');
            if (storedToken) {
                try{
                    const decoded = jwtDecode(storedToken);
                    console.log("Decoded token:", decoded);
                    const currentTime = Date.now() / 1000;

                    if(decoded.exp > currentTime){
                        setToken(storedToken);
                    }else {
                        console.log("Token expired. Removing from storage.");
                        await AsyncStorage.removeItem('token');
                    }

                }catch(err){
                    console.log("Invalid token:", err.message);
                    await AsyncStorage.removeItem('token');
                }
            }
            setLoading(false);
        };
        loadToken();
    }, []);

    const login = async (email, password) => {
        const data = await loginUser({ email, password });
        await AsyncStorage.setItem('token', data.token);
        setToken(data.token);
    };

    const logout = async () => {
        await AsyncStorage.removeItem('token');
        setToken(null);
    };

    const register = async (userData) => {
        const data = await registerUser(userData);
        const token = data.token;
        if(token) {
            await AsyncStorage.setItem('token', token);
            setToken(token);
        }
    };

    return (
        <authContext.Provider value={{ token, login, logout, register, loading }}>
            {children}
        </authContext.Provider>
    );

};

