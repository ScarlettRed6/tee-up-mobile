import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const ThemeContext = createContext();

const THEME_STORAGE_KEY = '@theme_preference';

// Theme colors
const lightTheme = {
  mode: 'light',
  background: '#F6EDE2',
  backgroundAlt: '#FAF1E6',
  card: '#FFFFFF',
  text: '#000000',
  textSecondary: '#333333',
  textMuted: '#666666',
  textDisabled: '#999999',
  border: '#E0E0E0',
  lightGray: '#F3F3F3',
  primary: '#FF6B35',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
};

const darkTheme = {
  mode: 'dark',
  background: '#1A1A1A',
  backgroundAlt: '#242424',
  card: '#2A2A2A',
  text: '#FFFFFF',
  textSecondary: '#E0E0E0',
  textMuted: '#B0B0B0',
  textDisabled: '#808080',
  border: '#404040',
  lightGray: '#333333',
  primary: '#FF6B35',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(lightTheme);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme) {
        setTheme(savedTheme === 'dark' ? darkTheme : lightTheme);
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTheme = async () => {
    try {
      const newTheme = theme.mode === 'light' ? darkTheme : lightTheme;
      setTheme(newTheme);
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme.mode);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const setThemeMode = async (mode) => {
    try {
      const newTheme = mode === 'dark' ? darkTheme : lightTheme;
      setTheme(newTheme);
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setThemeMode, isLoading }}>
      {children}
    </ThemeContext.Provider>
  );
};

