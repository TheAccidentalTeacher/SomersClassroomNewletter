import React, { useState, useEffect, useRef } from 'react';
import debugLogger from '../utils/debugLogger';

const DebugConsole = ({ isOpen, onClose }) => {
  const [logs, setLogs] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [autoScroll, setAutoScroll] = useState(true);
  const logContainerRef = useRef();

  useEffect(() => {
    if (isOpen) {
      // Get initial logs
      setLogs(debugLogger.getLogs());
      
      // Set up polling for new logs (in a real app, you might use events)
      const interval = setInterval(() => {
        setLogs(debugLogger.getLogs());
      }, 500);

      return () => clearInterval(interval);
    }
  }, [isOpen]);

  useEffect(() => {
    if (autoScroll && logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  const filteredLogs = logs.filter(log => 
    filter === 'ALL' || log.level === filter
  );

  const clearLogs = () => {
    debugLogger.clearLogs();
    setLogs([]);
  };

  const downloadLogs = () => {
    const logText = logs.map(log => 
      `[${log.timestamp}] ${log.level}: ${log.message}${log.data ? '\nData: ' + JSON.stringify(log.data, null, 2) : ''}`
    ).join('\n\n');
    
    const blob = new Blob([logText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `debug-logs-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const testFeatures = () => {
    debugLogger.info('Testing debug console features');
    debugLogger.warn('This is a test warning');
    debugLogger.error('This is a test error');
    debugLogger.success('Feature test completed successfully');
    debugLogger.api('Test API call logged', { method: 'GET', url: '/api/test' });
    debugLogger.user('Test user action logged', { action: 'debug_test' });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-end">
      <div className="bg-gray-900 text-white w-full h-2/3 flex flex-col">
        {/* Header */}
        <div className="bg-gray-800 p-4 flex justify-between items-center border-b border-gray-700">
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-semibold">🐛 Debug Console</h3>
            <div className="flex gap-2">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="bg-gray-700 text-white px-2 py-1 rounded text-sm"
              >
                <option value="ALL">All Logs</option>
                <option value="ERROR">Errors</option>
                <option value="WARN">Warnings</option>
                <option value="INFO">Info</option>
                <option value="DEBUG">Debug</option>
                <option value="SUCCESS">Success</option>
                <option value="API">API</option>
                <option value="USER">User</option>
              </select>
              
              <label className="flex items-center gap-1 text-sm">
                <input
                  type="checkbox"
                  checked={autoScroll}
                  onChange={(e) => setAutoScroll(e.target.checked)}
                  className="w-4 h-4"
                />
                Auto-scroll
              </label>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={testFeatures}
              className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm"
            >
              Test
            </button>
            <button
              onClick={clearLogs}
              className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm"
            >
              Clear
            </button>
            <button
              onClick={downloadLogs}
              className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-sm"
            >
              Download
            </button>
            <button
              onClick={onClose}
              className="bg-gray-600 hover:bg-gray-700 px-3 py-1 rounded text-sm"
            >
              Close
            </button>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="bg-gray-800 px-4 py-2 text-sm border-b border-gray-700">
          <div className="flex gap-4">
            <span>Total: {logs.length}</span>
            <span className="text-red-400">Errors: {logs.filter(l => l.level === 'ERROR').length}</span>
            <span className="text-yellow-400">Warnings: {logs.filter(l => l.level === 'WARN').length}</span>
            <span className="text-blue-400">Info: {logs.filter(l => l.level === 'INFO').length}</span>
            <span className="text-green-400">Success: {logs.filter(l => l.level === 'SUCCESS').length}</span>
          </div>
        </div>

        {/* Log Content */}
        <div 
          ref={logContainerRef}
          className="flex-1 overflow-y-auto p-2 font-mono text-sm"
        >
          {filteredLogs.length === 0 ? (
            <div className="text-gray-400 text-center py-8">
              {filter === 'ALL' ? 'No logs yet' : `No ${filter.toLowerCase()} logs`}
            </div>
          ) : (
            filteredLogs.map((log, index) => (
              <div 
                key={index} 
                className={`mb-2 p-2 rounded border-l-4 ${
                  log.level === 'ERROR' ? 'bg-red-900 border-red-500 text-red-100' :
                  log.level === 'WARN' ? 'bg-yellow-900 border-yellow-500 text-yellow-100' :
                  log.level === 'SUCCESS' ? 'bg-green-900 border-green-500 text-green-100' :
                  log.level === 'API' ? 'bg-purple-900 border-purple-500 text-purple-100' :
                  log.level === 'USER' ? 'bg-blue-900 border-blue-500 text-blue-100' :
                  'bg-gray-800 border-gray-500 text-gray-100'
                }`}
              >
                <div className="flex items-start gap-2">
                  <span className="text-xs opacity-75 min-w-[60px]">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                  <span className="text-xs font-bold min-w-[50px]">
                    {log.level}
                  </span>
                  <div className="flex-1">
                    <div>{log.message}</div>
                    {log.data && (
                      <details className="mt-1">
                        <summary className="text-xs opacity-75 cursor-pointer">
                          Data ({typeof log.data === 'object' ? Object.keys(log.data).length + ' properties' : typeof log.data})
                        </summary>
                        <pre className="mt-1 text-xs bg-black bg-opacity-25 p-2 rounded overflow-x-auto">
                          {JSON.stringify(log.data, null, 2)}
                        </pre>
                      </details>
                    )}
                    {log.stack && (
                      <details className="mt-1">
                        <summary className="text-xs opacity-75 cursor-pointer">
                          Stack Trace
                        </summary>
                        <pre className="mt-1 text-xs bg-black bg-opacity-25 p-2 rounded overflow-x-auto">
                          {log.stack}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-800 px-4 py-2 text-xs border-t border-gray-700">
          <div className="flex justify-between items-center">
            <span>Press F12 to toggle this console</span>
            <span>Debug Logger v1.0</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DebugConsole;
