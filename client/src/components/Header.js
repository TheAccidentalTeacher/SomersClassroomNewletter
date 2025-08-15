import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import debugLogger from '../utils/debugLogger';

const Header = () => {
  const { user, logout, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    debugLogger.trackComponent('Header', 'mounted');
    
    return () => {
      debugLogger.trackComponent('Header', 'unmounted');
    };
  }, []);

  const handleTitleClick = () => {
    debugLogger.trackUserAction('Header title clicked');
    navigate('/');
  };

  const handleLogout = async () => {
    debugLogger.trackUserAction('User logged out');
    await logout();
    navigate('/');
  };

  const handleLogin = () => {
    debugLogger.trackUserAction('Login button clicked');
    navigate('/login');
  };

  const handleRegister = () => {
    debugLogger.trackUserAction('Register button clicked');
    navigate('/register');
  };

  const handleDashboard = () => {
    debugLogger.trackUserAction('Dashboard button clicked');
    navigate('/dashboard');
  };

  return (
    <header style={{ 
      padding: '1rem', 
      backgroundColor: '#3B82F6', 
      color: 'white',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <h1 
        onClick={handleTitleClick}
        style={{ margin: 0, cursor: 'pointer' }}
      >
        Somers Classroom Newsletter Generator
      </h1>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {!loading && (
          <>
            {isAuthenticated ? (
              <>
                <span style={{ fontSize: '14px' }}>
                  Welcome, {user?.displayName || user?.email}
                </span>
                <button
                  onClick={handleDashboard}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Dashboard
                </button>
                <button
                  onClick={handleLogout}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleLogin}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Login
                </button>
                <button
                  onClick={handleRegister}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Register
                </button>
              </>
            )}
          </>
        )}
        
        <div style={{ fontSize: '12px', opacity: 0.8 }}>
          Debug: F12 | Env: {process.env.NODE_ENV || 'dev'}
        </div>
      </div>
    </header>
  );
};

export default Header;
