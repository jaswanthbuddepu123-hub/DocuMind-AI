import { createContext, useState, useContext } from 'react';
import * as authService from '../services/authService';
import { setAuthToken } from '../services/apiClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (email, password) => {
    setLoading(true);
    try {
      const data = await authService.login(email, password);
      setToken(data.token);
      setUser(data.user);
      setAuthToken(data.token);
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
      setToken(data.token);
      setUser(data.user);
      setAuthToken(data.token);
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

  const logout = () => {
    setUser(null);
    setToken(null);
    setAuthToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login: handleLogin, register: handleRegister, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
