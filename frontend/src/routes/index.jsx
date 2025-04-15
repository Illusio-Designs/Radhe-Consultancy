import { Routes, Route } from 'react-router-dom';
import { lazy, Suspense, useState, useEffect } from 'react';
import ProtectedRoute from '../components/ProtectedRoute';
import DashboardLayout from '../layouts/DashboardLayout';
import CookieConsent from "react-cookie-consent";
import Loader from '../components/common/Loader/Loader';
import { Navigate } from 'react-router-dom';

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
    <>
      <Suspense fallback={<Loader />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/coming-soon" element={<ComingSoon />} />

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

              {/* User Management Routes */}
              <Route path="/users">
                <Route path="company" element={
                  <ProtectedRoute allowedRoles={['admin', 'user_manager']}>
                    <CompanyUsers />
                  </ProtectedRoute>
                } />
                <Route path="consumer" element={
                  <ProtectedRoute allowedRoles={['admin', 'user_manager']}>
                    <ConsumerUsers />
                  </ProtectedRoute>
                } />
              </Route>

              {/* Company Routes */}
              <Route path="/companies">
                <Route index element={
                  <ProtectedRoute allowedRoles={['admin', 'vendor_manager']}>
                    <CompanyList />
                  </ProtectedRoute>
                } />
              </Route>

              {/* Consumer Routes */}
              <Route path="/consumers">
                <Route index element={
                  <ProtectedRoute allowedRoles={['admin', 'user_manager']}>
                    <ConsumerList />
                  </ProtectedRoute>
                } />
              </Route>
            </Route>
          </Route>

          {/* 404 Route - Must be last */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      
      <CookieConsent
        location="bottom"
        buttonText="Accept"
        declineButtonText="Decline"
        enableDeclineButton
        cookieName="mySiteCookieConsent"
        style={{ background: "#2B373B" }}
        buttonStyle={{ color: "#4e503b", fontSize: "13px" }}
        declineButtonStyle={{ color: "#fff", background: "#c00", fontSize: "13px" }}
        expires={365}
        onAccept={() => {
          console.log("Cookies accepted");
        }}
        onDecline={() => {
          console.log("Cookies declined");
        }}
      >
        This website uses cookies to ensure you get the best experience on our website.
        <a href="/privacy-policy" style={{ color: "#ffd700" }}> Learn more</a>
      </CookieConsent>
    </>
  );
};

export default AppRoutes;