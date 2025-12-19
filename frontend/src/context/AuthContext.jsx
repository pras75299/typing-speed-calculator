import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import websocketService from '../services/websocket';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => authService.getCurrentUser());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated on mount
    const checkAuth = async () => {
      if (authService.isAuthenticated()) {
        try {
          const userData = await authService.getMe();
          setUser(userData);
          
          // Connect WebSocket if authenticated
          const token = authService.getToken();
          if (token) {
            websocketService.connect(token).catch(console.error);
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          authService.logout();
          setUser(null);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const data = await authService.login(email, password);
      setUser(data.user);
      
      // Connect WebSocket after login
      if (data.token) {
        await websocketService.connect(data.token);
      }
      
      return data;
    } catch (error) {
      throw error;
    }
  };

  const register = async (username, email, password) => {
    try {
      const data = await authService.register(username, email, password);
      setUser(data.user);
      
      // Connect WebSocket after registration
      if (data.token) {
        await websocketService.connect(data.token);
      }
      
      return data;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    websocketService.disconnect();
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

