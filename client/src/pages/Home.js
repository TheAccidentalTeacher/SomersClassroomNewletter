import React, { useEffect, useState } from 'react';
import debugLogger from '../utils/debugLogger';
import DebugDemo from '../components/DebugDemo';

const Home = () => {
  const [showDebugDemo, setShowDebugDemo] = useState(false);

  useEffect(() => {
    debugLogger.trackComponent('Home', 'mounted');
    
    return () => {
      debugLogger.trackComponent('Home', 'unmounted');
    };
  }, []);

  const handleGetStartedClick = () => {
    debugLogger.trackUserAction('Get Started button clicked');
    // Navigation will be handled by the link
  };

  const toggleDebugDemo = () => {
    setShowDebugDemo(!showDebugDemo);
    debugLogger.trackUserAction('Debug demo toggled', { visible: !showDebugDemo });
  };

  if (showDebugDemo) {
    return <DebugDemo />;
  }

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h2>Welcome to Somers Classroom Newsletter Generator</h2>
      <p>Create dynamic, beautiful newsletters for your classroom!</p>
      <p style={{ color: '#666', fontSize: '14px', marginTop: '1rem' }}>
        Press <kbd>F12</kbd> or <kbd>Ctrl+Shift+D</kbd> to open the debug panel
      </p>
      
      <div style={{ marginTop: '2rem' }}>
        <a 
          href="/login" 
          onClick={handleGetStartedClick}
          style={{ 
            padding: '1rem 2rem', 
            backgroundColor: '#3B82F6', 
            color: 'white', 
            textDecoration: 'none',
            borderRadius: '0.5rem',
            marginRight: '1rem'
          }}
        >
          Get Started
        </a>
        
        <button
          onClick={toggleDebugDemo}
          style={{
            padding: '1rem 2rem',
            backgroundColor: '#10B981',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            cursor: 'pointer'
          }}
        >
          🔧 Debug Demo
        </button>
      </div>

      <div style={{ 
        marginTop: '3rem',
        padding: '1rem',
        background: '#f8f9fa',
        borderRadius: '0.5rem',
        maxWidth: '600px',
        margin: '3rem auto 0'
      }}>
        <h3>🚀 Deployment Status</h3>
        <p>The app is deploying to Railway. You can monitor the debug panel for:</p>
        <ul style={{ textAlign: 'left', display: 'inline-block' }}>
          <li>API connection status</li>
          <li>Environment configuration</li>
          <li>Error messages and warnings</li>
          <li>Performance metrics</li>
          <li>User interaction tracking</li>
        </ul>
      </div>
    </div>
  );
};

export default Home;
