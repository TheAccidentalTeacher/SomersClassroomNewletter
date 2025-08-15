import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check for existing token on app load
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (token) {
          // Set token in API service
          api.setToken(token);
          
          // Verify token is still valid by calling getCurrentUser
          const response = await api.getCurrentUser();
          if (response.success && response.data) {
            setUser(response.data.user);
            setIsAuthenticated(true);
          } else {
            // Token invalid, clear it
            api.setToken(null);
          }
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
        // Clear invalid token
        api.setToken(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (credentials) => {
    try {
      setLoading(true);
      const response = await api.login(credentials);
      
      if (response.success && response.data) {
        const { user, accessToken } = response.data;
        
        // Store token in API service
        api.setToken(accessToken);
        
        // Update state
        setUser(user);
        setIsAuthenticated(true);
        
        return { success: true, user };
      } else {
        return { success: false, message: response.message || 'Login failed' };
      }
    } catch (error) {
      console.error('Login failed:', error);
      return { 
        success: false, 
        message: error.message || 'Login failed. Please try again.' 
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      const response = await api.register(userData);
      
      if (response.success && response.data) {
        const { user, accessToken } = response.data;
        
        // Store token in API service
        api.setToken(accessToken);
        
        // Update state
        setUser(user);
        setIsAuthenticated(true);
        
        return { success: true, user };
      } else {
        return { success: false, message: response.message || 'Registration failed' };
      }
    } catch (error) {
      console.error('Registration failed:', error);
      return { 
        success: false, 
        message: error.message || 'Registration failed. Please try again.' 
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Call logout endpoint to invalidate token
      await api.logout();
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      // Clear token from API service
      api.setToken(null);
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
