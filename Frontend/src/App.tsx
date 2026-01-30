import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { Toaster } from 'react-hot-toast';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ProjectView from './pages/ProjectView';
import Tasks from './pages/Tasks';
import NotFound from './pages/NotFound';

// Components
import ProtectedRoute from './components/layout/ProtectedRoute';
import ModalManager from './components/modals/ModalManager';
import OfflineIndicator from './components/common/OfflineIndicator';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';

const AppContent: React.FC = () => {
  useKeyboardShortcuts();

  return (
    <>
      <OfflineIndicator />
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
                style: {
                  background: '#10b981',
                },
              },
              error: {
                duration: 4000,
                style: {
                  background: '#ef4444',
                },
              },
            }}
          />
          <ModalManager />
          
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/projects" element={<Navigate to="/dashboard" replace />} />
              <Route path="/projects/:projectId" element={<ProjectView />} />
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/team" element={<div>Team Page</div>} />
              <Route path="/calendar" element={<div>Calendar Page</div>} />
              <Route path="/reports" element={<div>Reports Page</div>} />
              <Route path="/settings" element={<div>Settings Page</div>} />
            </Route>
            
            {/* Default Redirect */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
        {/* 404 Page - Must be last */}
        <Route path="*" element={<NotFound />} />
          </Routes>
    </>
  );
};

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <Router>
        <div className="App">
          <AppContent />
        </div>
      </Router>
    </Provider>
  );
};

export default App;