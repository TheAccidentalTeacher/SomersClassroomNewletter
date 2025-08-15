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
          // Set token in API headers
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Verify token is still valid
          const response = await api.get('/auth/me');
          if (response.data.success) {
            setUser(response.data.user);
            setIsAuthenticated(true);
          } else {
            // Token invalid, clear it
            localStorage.removeItem('authToken');
            delete api.defaults.headers.common['Authorization'];
          }
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
        // Clear invalid token
        localStorage.removeItem('authToken');
        delete api.defaults.headers.common['Authorization'];
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (credentials) => {
    try {
      setLoading(true);
      const response = await api.post('/auth/login', credentials);
      
      if (response.data.success) {
        const { user, token } = response.data;
        
        // Store token
        localStorage.setItem('authToken', token);
        
        // Set token in API headers
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Update state
        setUser(user);
        setIsAuthenticated(true);
        
        return { success: true, user };
      } else {
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      console.error('Login failed:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed. Please try again.' 
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      const response = await api.post('/auth/register', userData);
      
      if (response.data.success) {
        const { user, token } = response.data;
        
        // Store token
        localStorage.setItem('authToken', token);
        
        // Set token in API headers
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Update state
        setUser(user);
        setIsAuthenticated(true);
        
        return { success: true, user };
      } else {
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      console.error('Registration failed:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Registration failed. Please try again.' 
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Call logout endpoint to invalidate token
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      // Clear local state regardless of API call result
      localStorage.removeItem('authToken');
      delete api.defaults.headers.common['Authorization'];
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
