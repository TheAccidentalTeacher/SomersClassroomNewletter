// Debug Logger - Enhanced logging system for development and production monitoring
class DebugLogger {
  constructor() {
    this.logs = [];
    this.maxLogs = 1000;
    this.enabled = true;
    this.logLevels = {
      ERROR: { level: 0, color: '#ff4444', emoji: '🚨' },
      WARN: { level: 1, color: '#ffaa00', emoji: '⚠️' },
      INFO: { level: 2, color: '#0088ff', emoji: 'ℹ️' },
      DEBUG: { level: 3, color: '#888888', emoji: '🔍' },
      SUCCESS: { level: 2, color: '#00aa00', emoji: '✅' },
      API: { level: 2, color: '#aa00aa', emoji: '🌐' },
      USER: { level: 2, color: '#00aaaa', emoji: '👤' }
    };
    this.currentLevel = 3; // Show all logs by default
    
    // Store original console methods
    this.originalConsole = {
      log: console.log,
      error: console.error,
      warn: console.warn,
      info: console.info
    };

    this.setupConsoleInterception();
    this.setupGlobalErrorHandling();
    this.setupF12Handler();
    
    this.log('DEBUG', 'Debug Logger initialized');
  }

  setupConsoleInterception() {
    // Intercept console methods to capture all logs
    console.log = (...args) => {
      this.log('DEBUG', args.join(' '));
      this.originalConsole.log(...args);
    };

    console.error = (...args) => {
      this.log('ERROR', args.join(' '));
      this.originalConsole.error(...args);
    };

    console.warn = (...args) => {
      this.log('WARN', args.join(' '));
      this.originalConsole.warn(...args);
    };

    console.info = (...args) => {
      this.log('INFO', args.join(' '));
      this.originalConsole.info(...args);
    };
  }

  setupGlobalErrorHandling() {
    // Capture unhandled errors
    window.addEventListener('error', (event) => {
      this.log('ERROR', `Unhandled Error: ${event.error?.message || event.message}`, {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack
      });
    });

    // Capture unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.log('ERROR', `Unhandled Promise Rejection: ${event.reason}`, {
        reason: event.reason,
        promise: event.promise
      });
    });
  }

  setupF12Handler() {
    // Listen for F12 key to toggle debug panel
    document.addEventListener('keydown', (event) => {
      if (event.key === 'F12') {
        event.preventDefault();
        this.toggleDebugPanel();
      }
    });

    // Also listen for Ctrl+Shift+D
    document.addEventListener('keydown', (event) => {
      if (event.ctrlKey && event.shiftKey && event.key === 'D') {
        event.preventDefault();
        this.toggleDebugPanel();
      }
    });
  }

  log(level, message, data = null) {
    if (!this.enabled) return;

    const levelInfo = this.logLevels[level] || this.logLevels.DEBUG;
    if (levelInfo.level > this.currentLevel) return;

    const logEntry = {
      id: Date.now() + Math.random(),
      timestamp: new Date(),
      level,
      message,
      data,
      stack: new Error().stack
    };

    this.logs.unshift(logEntry);
    
    // Keep only the most recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }

    // Update debug panel if it's open
    this.updateDebugPanel();
  }

  // Convenience methods
  error(message, data) { this.log('ERROR', message, data); }
  warn(message, data) { this.log('WARN', message, data); }
  info(message, data) { this.log('INFO', message, data); }
  debug(message, data) { this.log('DEBUG', message, data); }
  success(message, data) { this.log('SUCCESS', message, data); }
  api(message, data) { this.log('API', message, data); }
  user(message, data) { this.log('USER', message, data); }

  // API call tracking
  trackAPICall(url, method, status, duration, response = null, error = null) {
    const statusColor = status >= 200 && status < 300 ? 'SUCCESS' : 'ERROR';
    this.log(statusColor, `API ${method} ${url} - ${status} (${duration}ms)`, {
      url,
      method,
      status,
      duration,
      response: response ? JSON.stringify(response).substring(0, 200) + '...' : null,
      error: error?.message
    });
  }

  // Environment info
  getEnvironmentInfo() {
    return {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      screen: {
        width: screen.width,
        height: screen.height
      },
      location: {
        href: window.location.href,
        host: window.location.host,
        pathname: window.location.pathname
      },
      timestamp: new Date().toISOString()
    };
  }

  // Performance monitoring
  startPerformanceTimer(label) {
    const startTime = performance.now();
    return {
      end: () => {
        const duration = performance.now() - startTime;
        this.log('INFO', `Performance: ${label} took ${duration.toFixed(2)}ms`);
        return duration;
      }
    };
  }

  toggleDebugPanel() {
    let panel = document.getElementById('debug-panel');
    
    if (panel) {
      panel.remove();
    } else {
      this.createDebugPanel();
    }
  }

  createDebugPanel() {
    const panel = document.createElement('div');
    panel.id = 'debug-panel';
    panel.innerHTML = this.getDebugPanelHTML();
    document.body.appendChild(panel);
    
    this.setupDebugPanelEvents(panel);
    this.updateDebugPanel();
  }

  getDebugPanelHTML() {
    return `
      <div style="
        position: fixed;
        top: 0;
        right: 0;
        width: 400px;
        height: 100vh;
        background: rgba(0, 0, 0, 0.95);
        color: #fff;
        font-family: 'Courier New', monospace;
        font-size: 12px;
        z-index: 10000;
        display: flex;
        flex-direction: column;
        border-left: 2px solid #333;
      ">
        <div style="
          padding: 10px;
          background: #333;
          border-bottom: 1px solid #555;
          display: flex;
          justify-content: space-between;
          align-items: center;
        ">
          <strong>🔧 Debug Panel</strong>
          <div>
            <button id="debug-clear" style="
              background: #ff4444;
              color: white;
              border: none;
              padding: 5px 10px;
              margin-right: 5px;
              cursor: pointer;
              border-radius: 3px;
            ">Clear</button>
            <button id="debug-export" style="
              background: #0088ff;
              color: white;
              border: none;
              padding: 5px 10px;
              margin-right: 5px;
              cursor: pointer;
              border-radius: 3px;
            ">Export</button>
            <button id="debug-close" style="
              background: #666;
              color: white;
              border: none;
              padding: 5px 10px;
              cursor: pointer;
              border-radius: 3px;
            ">×</button>
          </div>
        </div>
        
        <div style="padding: 10px; border-bottom: 1px solid #555;">
          <div style="margin-bottom: 10px;">
            <strong>Log Level:</strong>
            <select id="debug-level" style="
              background: #444;
              color: white;
              border: 1px solid #666;
              padding: 2px;
              margin-left: 10px;
            ">
              <option value="0">ERROR</option>
              <option value="1">WARN+</option>
              <option value="2">INFO+</option>
              <option value="3" selected>DEBUG+</option>
            </select>
          </div>
          <div style="margin-bottom: 10px;">
            <strong>Total Logs:</strong> <span id="debug-count">0</span>
          </div>
          <div>
            <button id="debug-env" style="
              background: #00aa00;
              color: white;
              border: none;
              padding: 5px 10px;
              cursor: pointer;
              border-radius: 3px;
              margin-right: 5px;
            ">Environment</button>
            <button id="debug-api-test" style="
              background: #aa00aa;
              color: white;
              border: none;
              padding: 5px 10px;
              cursor: pointer;
              border-radius: 3px;
            ">Test API</button>
          </div>
        </div>
        
        <div id="debug-logs" style="
          flex: 1;
          overflow-y: auto;
          padding: 10px;
          line-height: 1.4;
        ">
          <!-- Logs will be populated here -->
        </div>
      </div>
    `;
  }

  setupDebugPanelEvents(panel) {
    // Close button
    panel.querySelector('#debug-close').addEventListener('click', () => {
      panel.remove();
    });

    // Clear button
    panel.querySelector('#debug-clear').addEventListener('click', () => {
      this.logs = [];
      this.updateDebugPanel();
    });

    // Export button
    panel.querySelector('#debug-export').addEventListener('click', () => {
      this.exportLogs();
    });

    // Log level selector
    panel.querySelector('#debug-level').addEventListener('change', (e) => {
      this.currentLevel = parseInt(e.target.value);
      this.updateDebugPanel();
    });

    // Environment button
    panel.querySelector('#debug-env').addEventListener('click', () => {
      const env = this.getEnvironmentInfo();
      this.info('Environment Info', env);
    });

    // API test button
    panel.querySelector('#debug-api-test').addEventListener('click', () => {
      this.testAPIConnection();
    });
  }

  updateDebugPanel() {
    const panel = document.getElementById('debug-panel');
    if (!panel) return;

    const logsContainer = panel.querySelector('#debug-logs');
    const countElement = panel.querySelector('#debug-count');
    
    if (countElement) {
      countElement.textContent = this.logs.length;
    }

    if (logsContainer) {
      const filteredLogs = this.logs.filter(log => 
        this.logLevels[log.level].level <= this.currentLevel
      );

      logsContainer.innerHTML = filteredLogs.map(log => {
        const levelInfo = this.logLevels[log.level];
        const time = log.timestamp.toLocaleTimeString();
        
        return `
          <div style="
            margin-bottom: 8px;
            padding: 5px;
            border-left: 3px solid ${levelInfo.color};
            background: rgba(255, 255, 255, 0.05);
          ">
            <div style="
              font-weight: bold;
              color: ${levelInfo.color};
              margin-bottom: 2px;
            ">
              ${levelInfo.emoji} ${log.level} - ${time}
            </div>
            <div style="color: #ccc;">
              ${log.message}
            </div>
            ${log.data ? `
              <details style="margin-top: 5px;">
                <summary style="cursor: pointer; color: #999;">Data</summary>
                <pre style="
                  background: rgba(0, 0, 0, 0.3);
                  padding: 5px;
                  margin: 5px 0;
                  border-radius: 3px;
                  overflow-x: auto;
                  font-size: 10px;
                ">${JSON.stringify(log.data, null, 2)}</pre>
              </details>
            ` : ''}
          </div>
        `;
      }).join('');

      // Auto-scroll to top (newest logs)
      logsContainer.scrollTop = 0;
    }
  }

  exportLogs() {
    const exportData = {
      timestamp: new Date().toISOString(),
      environment: this.getEnvironmentInfo(),
      logs: this.logs
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `debug-logs-${Date.now()}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
    this.success('Logs exported successfully');
  }

  async testAPIConnection() {
    this.info('Testing API connection...');
    
    try {
      const startTime = performance.now();
      const response = await fetch('/api/health');
      const duration = performance.now() - startTime;
      
      if (response.ok) {
        const data = await response.json();
        this.trackAPICall('/api/health', 'GET', response.status, duration, data);
        this.success('API connection successful');
      } else {
        this.trackAPICall('/api/health', 'GET', response.status, duration, null, new Error('API returned error status'));
        this.error('API returned error status: ' + response.status);
      }
    } catch (error) {
      this.error('API connection failed', error);
    }
  }

  // Method to be called from components for tracking user actions
  trackUserAction(action, data = null) {
    this.user(`User Action: ${action}`, data);
  }

  // Method to be called for component lifecycle events
  trackComponent(component, event, data = null) {
    this.debug(`Component ${component}: ${event}`, data);
  }
}

// Create global debug instance
const debugLogger = new DebugLogger();

// Make it available globally for easy access
window.debug = debugLogger;

export default debugLogger;
