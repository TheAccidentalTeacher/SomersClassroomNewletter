import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { NewsletterProvider } from './contexts/NewsletterContext';
import Header from './components/Header';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import TestPage from './pages/TestPage';
import NewsletterEditor from './pages/NewsletterEditor';
import Templates from './pages/Templates';
import AdminPanel from './pages/AdminPanel';
import ProtectedRoute from './components/ProtectedRoute';
import debugLogger from './utils/debugLogger';
import './App.css';

function App() {
  useEffect(() => {
    // Initialize debug logger and log app startup
    debugLogger.success('Newsletter Generator App started');
    debugLogger.info('Environment:', {
      NODE_ENV: process.env.NODE_ENV,
      API_URL: process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:5000/api'
    });
    
    // Log initial performance metrics
    const timer = debugLogger.startPerformanceTimer('App Initial Load');
    
    // Simulate app load completion
    setTimeout(() => {
      timer.end();
      debugLogger.info('Press F12 or Ctrl+Shift+D to open debug panel');
    }, 100);

    // Track route changes
    const handleRouteChange = () => {
      debugLogger.user('Route changed', { path: window.location.pathname });
    };
    
    window.addEventListener('popstate', handleRouteChange);
    
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);

  return (
    <AuthProvider>
      <NewsletterProvider>
        <Router>
          <div className="App">
            <Header />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute>
                      <TestPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/editor/:id?" 
                  element={
                    <ProtectedRoute>
                      <NewsletterEditor />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/templates" 
                  element={
                    <ProtectedRoute>
                      <Templates />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin" 
                  element={
                    <ProtectedRoute requireAdmin>
                      <AdminPanel />
                    </ProtectedRoute>
                  } 
                />
              </Routes>
            </main>
          </div>
        </Router>
      </NewsletterProvider>
    </AuthProvider>
  );
}

export default App;
