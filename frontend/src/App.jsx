import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import './App.css';
import { GoogleOAuthProvider } from '@react-oauth/google';

// Layouts
import DashboardLayout from './layouts/DashboardLayout';

// Components
import ProtectedRoute from './components/ProtectedRoute';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import Profile from './pages/auth/Profile';

// Public Pages
import Home from './pages/Home';

// Dashboard Pages
import Dashboard from './pages/dashboard/Dashboard';
import ChangePassword from './pages/auth/ChangePassword';

// Vendor Pages
import VendorList from './pages/dashboard/vendor/VendorList';
import VendorCreate from './pages/dashboard/vendor/VendorCreate';

function App() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
              <Route index element={<Home />} />
              <Route path="about" element={<div>About Page</div>} />
              <Route path="services" element={<div>Services Page</div>} />
              <Route path="contact" element={<div>Contact Page</div>} />

            {/* Auth Routes */}
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/register" element={<Register />} />
            <Route path="/auth/forgot-password" element={<ForgotPassword />} />
            <Route path="/auth/reset-password/:token" element={<ResetPassword />} />

            {/* Protected Dashboard Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="customers" element={<div>Customers Page</div>} />
              <Route path="leads" element={<div>Leads Page</div>} />
              <Route path="reports" element={<div>Reports Page</div>} />
              <Route path="settings" element={<div>Settings Page</div>} />
              <Route path="vendors" element={<VendorList />} />
              <Route path="vendors/create" element={<VendorCreate />} />
              <Route path="change-password" element={<ChangePassword />} />
              <Route path="profile" element={<Profile />} />
            </Route>

            {/* Redirect to home for unknown routes */}
            <Route path="*" element={<Home />} />
          </Routes>
        </Router>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
