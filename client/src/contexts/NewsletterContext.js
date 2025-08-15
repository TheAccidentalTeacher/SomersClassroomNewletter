import React, { createContext, useContext, useState, useCallback } from 'react';
import api from '../services/api';

const NewsletterContext = createContext();

export const useNewsletter = () => {
  const context = useContext(NewsletterContext);
  if (!context) {
    throw new Error('useNewsletter must be used within a NewsletterProvider');
  }
  return context;
};

export const NewsletterProvider = ({ children }) => {
  const [newsletters, setNewsletters] = useState([]);
  const [currentNewsletter, setCurrentNewsletter] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({});

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const fetchNewsletters = useCallback(async (options = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.getNewsletters(options);

      if (response.data.success) {
        setNewsletters(response.data.data.newsletters);
        setStats(response.data.data.stats);
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to fetch newsletters');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch newsletters';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);  const createNewsletter = useCallback(async (newsletterData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.post('/newsletters', newsletterData);

      if (response.data.success) {
        const newNewsletter = response.data.data.newsletter;
        setNewsletters(prev => [newNewsletter, ...prev]);
        setCurrentNewsletter(newNewsletter);
        return newNewsletter;
      } else {
        throw new Error(response.data.message || 'Failed to create newsletter');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to create newsletter';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateNewsletter = useCallback(async (id, updateData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.put(`/newsletters/${id}`, updateData);

      if (response.data.success) {
        const updatedNewsletter = response.data.data.newsletter;
        
        setNewsletters(prev => 
          prev.map(newsletter => 
            newsletter.id === id ? updatedNewsletter : newsletter
          )
        );
        
        if (currentNewsletter && currentNewsletter.id === id) {
          setCurrentNewsletter(updatedNewsletter);
        }
        
        return updatedNewsletter;
      } else {
        throw new Error(response.data.message || 'Failed to update newsletter');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to update newsletter';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentNewsletter]);

  const deleteNewsletter = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.delete(`/newsletters/${id}`);

      if (response.data.success) {
        setNewsletters(prev => prev.filter(newsletter => newsletter.id !== id));
        
        if (currentNewsletter && currentNewsletter.id === id) {
          setCurrentNewsletter(null);
        }
        
        return true;
      } else {
        throw new Error(response.data.message || 'Failed to delete newsletter');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to delete newsletter';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentNewsletter]);

  const getNewsletter = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.getNewsletter(id);

      if (response.data.success) {
        const newsletter = response.data.data.newsletter;
        setCurrentNewsletter(newsletter);
        return newsletter;
      } else {
        throw new Error(response.data.message || 'Failed to fetch newsletter');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch newsletter';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const duplicateNewsletter = useCallback(async (id) => {
    try {
      const original = await getNewsletter(id);
      const duplicateData = {
        title: `${original.title} (Copy)`,
        content: original.content,
        settings: original.settings,
        status: 'draft'
      };
      
      return await createNewsletter(duplicateData);
    } catch (err) {
      throw err;
    }
  }, [getNewsletter, createNewsletter]);

  const value = {
    // State
    newsletters,
    currentNewsletter,
    loading,
    error,
    stats,
    
    // Actions
    fetchNewsletters,
    createNewsletter,
    updateNewsletter,
    deleteNewsletter,
    getNewsletter,
    duplicateNewsletter,
    setCurrentNewsletter,
    clearError
  };

  return (
    <NewsletterContext.Provider value={value}>
      {children}
    </NewsletterContext.Provider>
  );
};
