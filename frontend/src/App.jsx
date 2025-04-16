import React, { Suspense } from "react";
import { optimizeImage } from "./utils/imageOptimizer";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import "./App.css";
import { GoogleOAuthProvider } from "@react-oauth/google";
import MainLayout from "./layouts/MainLayout";
import AuthLayout from "./layouts/AuthLayout";
import ComingSoon from "./pages/ComingSoon";
import Login from "./pages/dashboard/auth/Login";
import Register from "./pages/dashboard/auth/Register";
import Dashboard from "./pages/dashboard/home/Dashboard";
import Unauthorized from "./pages/dashboard/auth/Unauthorized";
import ProtectedRoute from "./components/ProtectedRoute";
import Loader from "./components/common/Loader/Loader";

const LazyImage = React.lazy(() => import("./components/common/LazyImage"));

// Create router outside of component to avoid recreation on each render
const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <ComingSoon />,
      },
      {
        path: 'unauthorized',
        element: <Unauthorized />,
      },
    ],
  },
  {
    path: '/',
    element: <AuthLayout />,
    children: [
      {
        path: 'login',
        element: <Login />,
      },
      {
        path: 'register',
        element: <Register />,
      },
    ],
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
  },
]);

function App() {
  const imageData = optimizeImage("/images/hero.jpg", [400, 800, 1200]);

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <Suspense fallback={<Loader />}>
          <RouterProvider router={router} />
        </Suspense>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
