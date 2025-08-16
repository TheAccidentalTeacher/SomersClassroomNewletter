import React, { createContext, useContext, useState, useCallback } from 'react';
import api from '../services/api';

const TemplateContext = createContext();

export const useTemplate = () => {
  const context = useContext(TemplateContext);
  if (!context) {
    throw new Error('useTemplate must be used within a TemplateProvider');
  }
  return context;
};

export const TemplateProvider = ({ children }) => {
  const [templates, setTemplates] = useState([]);
  const [currentTemplate, setCurrentTemplate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({});

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const fetchTemplates = useCallback(async (options = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.getTemplates(options);

      if (response.success) {
        setTemplates(response.data.templates);
        setStats(response.data.stats);
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch templates');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch templates';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPublicTemplates = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.getPublicTemplates();

      if (response.success) {
        return response.data.templates;
      } else {
        throw new Error(response.message || 'Failed to fetch public templates');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch public templates';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMyTemplates = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.getMyTemplates();

      if (response.success) {
        setTemplates(response.data.templates);
        setStats(response.data.stats);
        return response.data.templates;
      } else {
        throw new Error(response.message || 'Failed to fetch my templates');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch my templates';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createTemplate = useCallback(async (templateData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.createTemplate(templateData);

      if (response.success) {
        const newTemplate = response.data.template;
        setTemplates(prev => [newTemplate, ...prev]);
        setCurrentTemplate(newTemplate);
        return newTemplate;
      } else {
        throw new Error(response.message || 'Failed to create template');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to create template';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createTemplateFromNewsletter = useCallback(async (newsletterData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.createTemplateFromNewsletter(newsletterData);

      if (response.success) {
        const newTemplate = response.data.template;
        setTemplates(prev => [newTemplate, ...prev]);
        setCurrentTemplate(newTemplate);
        return newTemplate;
      } else {
        throw new Error(response.message || 'Failed to create template from newsletter');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to create template from newsletter';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateTemplate = useCallback(async (id, updateData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.updateTemplate(id, updateData);

      if (response.success) {
        const updatedTemplate = response.data.template;
        
        setTemplates(prev => 
          prev.map(template => 
            template.id === id ? updatedTemplate : template
          )
        );
        
        if (currentTemplate && currentTemplate.id === id) {
          setCurrentTemplate(updatedTemplate);
        }
        
        return updatedTemplate;
      } else {
        throw new Error(response.message || 'Failed to update template');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to update template';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentTemplate]);

  const deleteTemplate = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.deleteTemplate(id);

      if (response.success) {
        setTemplates(prev => prev.filter(template => template.id !== id));
        
        if (currentTemplate && currentTemplate.id === id) {
          setCurrentTemplate(null);
        }
        
        return true;
      } else {
        throw new Error(response.message || 'Failed to delete template');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to delete template';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentTemplate]);

  const getTemplate = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.getTemplate(id);

      if (response.success) {
        const template = response.data.template;
        setCurrentTemplate(template);
        return template;
      } else {
        throw new Error(response.message || 'Failed to fetch template');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch template';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const duplicateTemplate = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.duplicateTemplate(id);

      if (response.success) {
        const duplicate = response.data.template;
        setTemplates(prev => [duplicate, ...prev]);
        return duplicate;
      } else {
        throw new Error(response.message || 'Failed to duplicate template');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to duplicate template';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const value = {
    // State
    templates,
    currentTemplate,
    loading,
    error,
    stats,
    
    // Actions
    fetchTemplates,
    fetchPublicTemplates,
    fetchMyTemplates,
    createTemplate,
    createTemplateFromNewsletter,
    updateTemplate,
    deleteTemplate,
    getTemplate,
    duplicateTemplate,
    setCurrentTemplate,
    clearError
  };

  return (
    <TemplateContext.Provider value={value}>
      {children}
    </TemplateContext.Provider>
  );
};
