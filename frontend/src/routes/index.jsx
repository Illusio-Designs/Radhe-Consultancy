import { Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import ProtectedRoute from '../components/ProtectedRoute';
import DashboardLayout from '../layouts/DashboardLayout';
import Loader from '../components/common/Loader/Loader';

// Lazy load auth pages
const Login = lazy(() => import('../pages/dashboard/auth/Login'));
const Register = lazy(() => import('../pages/dashboard/auth/Register'));
const ForgotPassword = lazy(() => import('../pages/dashboard/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('../pages/dashboard/auth/ResetPassword'));
const ChangePassword = lazy(() => import('../pages/dashboard/auth/ChangePassword'));

// Lazy load public pages
const Home = lazy(() => import('../pages/Home'));
const About = lazy(() => import('../pages/About'));
const Services = lazy(() => import('../pages/Services'));
const Contact = lazy(() => import('../pages/Contact'));
const NotFound = lazy(() => import('../pages/NotFound'));
const ComingSoon = lazy(() => import('../pages/ComingSoon'));

// Lazy load dashboard pages
const Dashboard = lazy(() => import('../pages/dashboard/home/Dashboard'));
const Profile = lazy(() => import('../pages/dashboard/profile/Profile'));

// Lazy load user management pages
const CompanyUsers = lazy(() => import('../pages/dashboard/users/CompanyUsers'));
const ConsumerUsers = lazy(() => import('../pages/dashboard/users/ConsumerUsers'));
const RoleManagement = lazy(() => import('../pages/dashboard/roles/RoleManagement'));

// Lazy load company pages
const CompanyList = lazy(() => import('../pages/dashboard/companies/CompanyList'));

// Lazy load consumer pages
const ConsumerList = lazy(() => import('../pages/dashboard/consumers/ConsumerList'));

const AppRoutes = () => {
  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/services" element={<Services />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/coming-soon" element={<ComingSoon />} />

        {/* Auth Routes */}
        <Route path="/login" element={<Navigate to="/auth/login" replace />} />
        <Route path="/auth">
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="reset-password/:token" element={<ResetPassword />} />
        </Route>

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            {/* Common Routes */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/change-password" element={<ChangePassword />} />

            {/* Admin Routes */}
            <Route path="/roles" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <RoleManagement />
              </ProtectedRoute>
            } />

            {/* Company Routes */}
            <Route path="/companies" element={
              <ProtectedRoute allowedRoles={['admin', 'company']}>
                <CompanyList />
              </ProtectedRoute>
            } />
            <Route path="/company-users" element={
              <ProtectedRoute allowedRoles={['admin', 'company']}>
                <CompanyUsers />
              </ProtectedRoute>
            } />

            {/* Consumer Routes */}
            <Route path="/consumers" element={
              <ProtectedRoute allowedRoles={['admin', 'consumer']}>
                <ConsumerList />
              </ProtectedRoute>
            } />
            <Route path="/consumer-users" element={
              <ProtectedRoute allowedRoles={['admin', 'consumer']}>
                <ConsumerUsers />
              </ProtectedRoute>
            } />
          </Route>
        </Route>

        {/* 404 Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;