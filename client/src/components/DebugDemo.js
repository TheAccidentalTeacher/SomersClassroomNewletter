import React, { useState, useEffect } from 'react';
import debugLogger from '../utils/debugLogger';
import apiService from '../services/api';

const DebugDemo = () => {
  const [testResults, setTestResults] = useState([]);

  useEffect(() => {
    debugLogger.trackComponent('DebugDemo', 'mounted');
    debugLogger.info('Debug Demo component loaded - ready for testing');
    
    return () => {
      debugLogger.trackComponent('DebugDemo', 'unmounted');
    };
  }, []);

  const runDemoTests = async () => {
    debugLogger.user('Started debug demo tests');
    setTestResults([]);
    
    const tests = [
      {
        name: 'Log Different Levels',
        action: () => {
          debugLogger.error('This is an error message');
          debugLogger.warn('This is a warning message');
          debugLogger.info('This is an info message');
          debugLogger.debug('This is a debug message');
          debugLogger.success('This is a success message');
        }
      },
      {
        name: 'Test API Health Check',
        action: async () => {
          try {
            await apiService.healthCheck();
            return 'API health check successful';
          } catch (error) {
            return `API health check failed: ${error.message}`;
          }
        }
      },
      {
        name: 'Test Performance Monitoring',
        action: () => {
          const timer = debugLogger.startPerformanceTimer('Demo Operation');
          // Simulate some work
          const start = Date.now();
          while (Date.now() - start < 50) {
            // Busy wait for 50ms
          }
          timer.end();
          return 'Performance test completed';
        }
      },
      {
        name: 'Test Error Handling',
        action: () => {
          try {
            throw new Error('This is a test error for demonstration');
          } catch (error) {
            debugLogger.error('Caught test error', { error: error.message, stack: error.stack });
            return 'Error was caught and logged';
          }
        }
      },
      {
        name: 'Test User Action Tracking',
        action: () => {
          debugLogger.trackUserAction('Demo button clicked', { 
            timestamp: new Date().toISOString(),
            testData: { foo: 'bar', count: 42 }
          });
          return 'User action tracked';
        }
      }
    ];

    const results = [];
    for (const test of tests) {
      try {
        debugLogger.info(`Running test: ${test.name}`);
        const result = await test.action();
        results.push({ name: test.name, status: 'success', result });
        debugLogger.success(`Test completed: ${test.name}`);
      } catch (error) {
        results.push({ name: test.name, status: 'error', result: error.message });
        debugLogger.error(`Test failed: ${test.name}`, error);
      }
    }
    
    setTestResults(results);
    debugLogger.success('All debug demo tests completed');
  };

  return (
    <div style={{ 
      padding: '2rem',
      maxWidth: '800px',
      margin: '0 auto'
    }}>
      <h2>🔧 Debug System Demo</h2>
      
      <div style={{ 
        background: '#f0f8ff',
        padding: '1rem',
        borderRadius: '0.5rem',
        marginBottom: '2rem',
        border: '2px solid #3B82F6'
      }}>
        <h3>How to Use the Debug Panel:</h3>
        <ul>
          <li><strong>Press F12</strong> or <strong>Ctrl+Shift+D</strong> to open/close the debug panel</li>
          <li>Use the <strong>Log Level</strong> dropdown to filter messages</li>
          <li>Click <strong>Clear</strong> to clear all logs</li>
          <li>Click <strong>Export</strong> to download logs as JSON</li>
          <li>Click <strong>Environment</strong> to see system information</li>
          <li>Click <strong>Test API</strong> to check server connection</li>
        </ul>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <button
          onClick={runDemoTests}
          style={{
            padding: '1rem 2rem',
            backgroundColor: '#10B981',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold'
          }}
        >
          Run Debug Demo Tests
        </button>
      </div>

      {testResults.length > 0 && (
        <div style={{ 
          background: '#f8f9fa',
          padding: '1rem',
          borderRadius: '0.5rem',
          border: '1px solid #ddd'
        }}>
          <h3>Test Results:</h3>
          {testResults.map((result, index) => (
            <div 
              key={index}
              style={{
                padding: '0.5rem',
                margin: '0.5rem 0',
                borderLeft: `4px solid ${result.status === 'success' ? '#10B981' : '#EF4444'}`,
                background: result.status === 'success' ? '#f0f9ff' : '#fef2f2'
              }}
            >
              <strong>{result.name}:</strong> {result.result}
            </div>
          ))}
        </div>
      )}

      <div style={{ 
        marginTop: '2rem',
        padding: '1rem',
        background: '#fff3cd',
        border: '1px solid #ffeaa7',
        borderRadius: '0.5rem'
      }}>
        <h4>💡 Tips:</h4>
        <ul>
          <li>The debug panel captures all console.log, console.error, console.warn messages</li>
          <li>API calls are automatically tracked with timing and response data</li>
          <li>Unhandled errors and promise rejections are caught automatically</li>
          <li>You can use <code>window.debug</code> in the browser console for manual logging</li>
          <li>All logs include timestamps and can be exported for analysis</li>
        </ul>
      </div>
    </div>
  );
};

export default DebugDemo;
