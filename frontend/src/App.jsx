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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Main Application Layout Wrapper */}
        <Route element={<AppLayout />}>
          {/* Landing route opens the AI Assistant RAG dashboard directly */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/history" element={<History />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/documents/:id" element={<DocumentDetails />} />
          <Route path="/sources" element={<Sources />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/about" element={<About />} />
        </Route>

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
