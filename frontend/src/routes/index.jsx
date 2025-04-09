import { Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import ProtectedRoute from '../components/ProtectedRoute';
import DashboardLayout from '../layouts/DashboardLayout';

// Lazy load auth pages
const Login = lazy(() => import('../pages/dashboard/auth/Login'));
const Register = lazy(() => import('../pages/dashboard/auth/Register'));
const ForgotPassword = lazy(() => import('../pages/dashboard/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('../pages/dashboard/auth/ResetPassword'));
const Profile = lazy(() => import('../pages/dashboard/auth/Profile'));
const ChangePassword = lazy(() => import('../pages/dashboard/auth/ChangePassword'));

// Lazy load other pages
const Home = lazy(() => import('../pages/Home'));
const About = lazy(() => import('../pages/About'));
const Services = lazy(() => import('../pages/Services'));
const Contact = lazy(() => import('../pages/Contact'));
const Dashboard = lazy(() => import('../pages/dashboard/home/Dashboard'));
const User = lazy(() => import('../pages/dashboard/users/User'));
const Company = lazy(() => import('../pages/dashboard/vendors/Company'));
const Consumer = lazy(() => import('../pages/dashboard/vendors/Consumer'));

const AppRoutes = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/services" element={<Services />} />
        <Route path="/contact" element={<Contact />} />

        {/* Auth Routes */}
        <Route path="/auth">
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="reset-password/:token" element={<ResetPassword />} />
        </Route>

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/change-password" element={<ChangePassword />} />
            <Route path="/users" element={<User />} />
            <Route path="/vendors/company" element={<Company />} />
            <Route path="/vendors/consumer" element={<Consumer />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;