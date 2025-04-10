import { Routes, Route } from 'react-router-dom';
import { lazy, Suspense, useState, useEffect } from 'react'; // Add useState here
import ProtectedRoute from '../components/ProtectedRoute';
import DashboardLayout from '../layouts/DashboardLayout';
import CookieConsent from "react-cookie-consent";
import Loader from '../components/common/Loader/Loader';
import { Helmet } from 'react-helmet';

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
const RoleManagement = lazy(() => import('../pages/dashboard/roles/RoleManagement'));

const AppRoutes = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const consent = localStorage.getItem("mySiteCookieConsent");
    if (consent === "true") {
      // Load GA or any third-party scripts here
      const script = document.createElement("script");
      script.src = "https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID";
      script.async = true;
      document.body.appendChild(script);
      window.dataLayer = window.dataLayer || [];
      function gtag(){window.dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'GA_MEASUREMENT_ID');
    }
  }, []);

  if (loading) {
    return <Loader />;
  }

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
            <Route path="/roles" element={<RoleManagement />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;