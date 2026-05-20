import { createContext, useContext, useState, useEffect } from 'react';
import { login as authLogin, getProfile, register as authRegister } from '../api/authApi';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const persistSession = (token, refreshToken, userData) => {
    localStorage.setItem('authToken', token);
    if (refreshToken) {
      localStorage.setItem('authRefreshToken', refreshToken);
    }
    localStorage.setItem('authUser', JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
  };

  useEffect(() => {
    const checkAuth = async () => {
      const pathname = window.location.pathname.replace(/\/$/, '') || '/';
      const params = new URLSearchParams(window.location.search);

      if (pathname === '/login-success') {
        const token = params.get('token');
        const refreshToken = params.get('refreshToken');
        const userParam = params.get('user');
        if (token && userParam) {
          try {
            const userData = JSON.parse(decodeURIComponent(userParam));
            persistSession(token, refreshToken, userData);
            window.history.replaceState({}, '', '/');
            setLoading(false);
            return;
          } catch {
            localStorage.removeItem('authToken');
            localStorage.removeItem('authRefreshToken');
            localStorage.removeItem('authUser');
          }
        }
        window.history.replaceState({}, '', '/?auth=login&error=google_callback_failed');
      }

      const token = localStorage.getItem('authToken');
      const storedUser = localStorage.getItem('authUser');

      if (token && storedUser) {
        try {
          const response = await getProfile();
          const parsed = JSON.parse(storedUser);
          setUser({ ...parsed, ...response });
          setIsAuthenticated(true);
        } catch (error) {
          localStorage.removeItem('authToken');
          localStorage.removeItem('authRefreshToken');
          localStorage.removeItem('authUser');
          setUser(null);
          setIsAuthenticated(false);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authLogin(email, password);
      const { token, refreshToken, user: userData } = response;

      persistSession(token, refreshToken, userData);
      return { success: true };
    } catch (error) {
      const status = error.response?.status;
      const message = error.response?.data?.message || 'Login failed';
      if (status === 403) {
        const lower = message.toLowerCase();
        if (lower.includes('suspended')) {
          return { success: false, error: message, accountSuspended: true };
        }
        if (lower.includes('not verified') || lower.includes('verify your email')) {
          return {
            success: false,
            error: message,
            needsEmailVerification: true,
            email: typeof email === 'string' ? email.trim() : email,
          };
        }
      }
      return { success: false, error: message };
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authRefreshToken');
    localStorage.removeItem('authUser');
    setUser(null);
    setIsAuthenticated(false);
  };

  const register = async (name, email, password, confirmPassword) => {
    try {
      await authRegister(name, email, password, confirmPassword);
      return { success: true, email: typeof email === 'string' ? email.trim() : email };
    } catch (error) {
      const message = error.response?.data?.message || error.response?.data?.error || 'Sign up failed';
      return { success: false, error: message };
    }
  };

  const refreshProfile = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) return null;
    const response = await getProfile();
    setUser((prev) => {
      const next = { ...(prev || {}), ...response };
      localStorage.setItem('authUser', JSON.stringify(next));
      return next;
    });
    return response;
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    register,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

