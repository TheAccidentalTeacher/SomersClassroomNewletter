import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { SupabaseProvider } from './contexts/SupabaseContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import NewsletterEditor from './pages/NewsletterEditor';
import Templates from './pages/Templates';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import Login from './pages/Login';
import './App.css';

function App() {
  return (
    <SupabaseProvider>
      <AuthProvider>
        <Router>
          <div className="App">
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#4ade80',
                    secondary: '#fff',
                  },
                },
                error: {
                  duration: 5000,
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
            
            <Routes>
              <Route path="/login" element={<Login />} />
              
              <Route path="/" element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/editor/:id?" element={
                <ProtectedRoute>
                  <Layout>
                    <NewsletterEditor />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/templates" element={
                <ProtectedRoute>
                  <Layout>
                    <Templates />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Layout>
                    <Profile />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/admin" element={
                <ProtectedRoute requireAdmin>
                  <Layout>
                    <Admin />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </SupabaseProvider>
  );
}

export default App;
