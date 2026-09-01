import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { Dashboard } from './pages/Dashboard';
import { History } from './pages/History';
import { Documents } from './pages/Documents';
import { DocumentDetails } from './pages/DocumentDetails';
import { Sources } from './pages/Sources';
import { Settings } from './pages/Settings';
import { About } from './pages/About';

// Auth & Protection imports
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Login } from './pages/auth/Login';
import { Signup } from './pages/auth/Signup';
import { ForgotPassword } from './pages/auth/ForgotPassword';
import { ResetPassword } from './pages/auth/ResetPassword';

// Admin page imports
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminEmployees } from './pages/admin/AdminEmployees';
import { AdminDocuments } from './pages/admin/AdminDocuments';
import { AdminStatistics } from './pages/admin/AdminStatistics';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Auth routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Protected Application Routes Wrapper (Accessible by both Employees and Admins) */}
          <Route element={<ProtectedRoute allowedRoles={['admin', 'employee']}><AppLayout /></ProtectedRoute>}>
            {/* Landing redirects based on role via ProtectedRoute */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/history" element={<History />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/documents/:id" element={<DocumentDetails />} />
            <Route path="/sources" element={<Sources />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/about" element={<About />} />

            {/* Admin-Only Protected Workspace */}
            <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/employees" element={<ProtectedRoute allowedRoles={['admin']}><AdminEmployees /></ProtectedRoute>} />
            <Route path="/admin/documents" element={<ProtectedRoute allowedRoles={['admin']}><AdminDocuments /></ProtectedRoute>} />
            <Route path="/admin/statistics" element={<ProtectedRoute allowedRoles={['admin']}><AdminStatistics /></ProtectedRoute>} />
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
