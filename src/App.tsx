import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import AssetManagement from './pages/AssetManagement';
import TemplateManagement from './pages/TemplateManagement';
import ContentGeneration from './pages/ContentGeneration';
import VisualMatrixPage from './pages/VisualMatrixPage';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          
          {/* Protected routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/assets" 
            element={
              <ProtectedRoute>
                <AssetManagement />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/templates" 
            element={
              <ProtectedRoute>
                <TemplateManagement />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/content" 
            element={
              <ProtectedRoute>
                <ContentGeneration />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/visual-matrix" 
            element={
              <ProtectedRoute>
                <VisualMatrixPage />
              </ProtectedRoute>
            } 
          />
          
          {/* Redirect to dashboard if authenticated, otherwise to login */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* Catch all - redirect to dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
