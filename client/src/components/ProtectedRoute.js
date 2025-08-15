import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  // Show loading while checking authentication
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh' 
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check admin requirement
  if (requireAdmin && user?.role !== 'admin') {
    return (
      <div style={{ 
        padding: '2rem', 
        textAlign: 'center',
        color: '#721c24',
        backgroundColor: '#f8d7da',
        border: '1px solid #f5c6cb',
        borderRadius: '4px',
        margin: '2rem'
      }}>
        <h2>Access Denied</h2>
        <p>You need administrator privileges to access this page.</p>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
