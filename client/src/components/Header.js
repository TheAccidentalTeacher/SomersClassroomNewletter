import React, { useEffect } from 'react';
import debugLogger from '../utils/debugLogger';

const Header = () => {
  useEffect(() => {
    debugLogger.trackComponent('Header', 'mounted');
    
    return () => {
      debugLogger.trackComponent('Header', 'unmounted');
    };
  }, []);

  const handleTitleClick = () => {
    debugLogger.trackUserAction('Header title clicked');
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
      <div style={{ fontSize: '12px', opacity: 0.8 }}>
        Debug: F12 | Env: {process.env.NODE_ENV || 'dev'}
      </div>
    </header>
  );
};

export default Header;
