import { createContext, useState, useContext, useEffect } from 'react';
import * as authService from '../services/authService';
import { setAuthToken } from '../services/apiClient';

const AuthContext = createContext(null);

const TOKEN_KEY = 'documind_token';
const USER_KEY = 'documind_user';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem(USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  });
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || null);
  const [loading, setLoading] = useState(false);

  // Rehydrate the API client token on app load
  useEffect(() => {
    if (token) {
      setAuthToken(token);
    }
  }, []);

  const persistAuth = (tokenValue, userData) => {
    setToken(tokenValue);
    setUser(userData);
    setAuthToken(tokenValue);
    localStorage.setItem(TOKEN_KEY, tokenValue);
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
  };

  const handleLogin = async (email, password) => {
    setLoading(true);
    try {
      const data = await authService.login(email, password);
      // Set token first so the /me call is authenticated
      setAuthToken(data.token);
      // Fetch full profile (includes phone_number, avatar_url)
      let fullUser = data.user;
      try {
        fullUser = await authService.getMe();
      } catch (_) {
        // fallback to login response user if /me fails
      }
      persistAuth(data.token, fullUser);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Login failed' 
      };
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (name, email, password) => {
    setLoading(true);
    try {
      const data = await authService.register(name, email, password);
      setAuthToken(data.token);
      let fullUser = data.user;
      try {
        fullUser = await authService.getMe();
      } catch (_) {
        // fallback
      }
      persistAuth(data.token, fullUser);
      return { success: true };
    } catch (error) {
      // Handle Zod validation arrays if they come back
      const errorMsg = error.response?.data?.error;
      const details = error.response?.data?.details;
      let finalMsg = errorMsg || 'Registration failed';
      if (details && details.length > 0) finalMsg = details[0].message;
      
      return { success: false, error: finalMsg };
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (name, phone, avatar) => {
    setLoading(true);
    try {
      const data = await authService.updateProfile(name, phone, avatar);
      setUser(data);
      localStorage.setItem(USER_KEY, JSON.stringify(data));
      return { success: true, user: data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Profile update failed' 
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setAuthToken(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, token, login: handleLogin, register: handleRegister, updateProfile: handleUpdateProfile, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
