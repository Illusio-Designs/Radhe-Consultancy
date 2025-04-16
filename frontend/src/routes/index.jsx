import { createBrowserRouter } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import PublicLayout from "../layouts/PublicLayout";
import AuthLayout from "../layouts/AuthLayout";
import ComingSoon from "../pages/ComingSoon";
import Login from "../pages/dashboard/auth/Login";
import Register from "../pages/dashboard/auth/Register";
import Dashboard from "../pages/dashboard/home/Dashboard";
import AdminDashboard from "../pages/dashboard/home/AdminDashboard";
import CompanyDashboard from "../pages/dashboard/home/CompanyDashboard";
import ConsumerDashboard from "../pages/dashboard/home/ConsumerDashboard";
import Unauthorized from "../pages/dashboard/auth/Unauthorized";
import RoleManagement from "../pages/dashboard/roles/RoleManagement";
import CompanyUsers from "../pages/dashboard/users/CompanyUsers";
import ConsumerUsers from "../pages/dashboard/users/ConsumerUsers";
import OtherUsers from "../pages/dashboard/users/OtherUsers";
import CompanyList from "../pages/dashboard/companies/CompanyList";
import ConsumerList from "../pages/dashboard/consumers/ConsumerList";
import ProtectedRoute from "../components/ProtectedRoute";

const router = createBrowserRouter([
  // Public Routes
  {
    path: "/",
    element: <PublicLayout />,
    children: [
      {
        index: true,
        element: <ComingSoon />,
      },
      {
        path: "unauthorized",
        element: <Unauthorized />,
      },
    ],
  },
  // Auth Routes
  {
    path: "/",
    element: <AuthLayout />,
    children: [
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "register",
        element: <Register />,
      },
    ],
  },
  // Dashboard Routes (Protected)
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      // Role-based Dashboard Routes
      {
        path: "admin",
        element: <AdminDashboard />,
      },
      {
        path: "company",
        element: <CompanyDashboard />,
      },
      {
        path: "consumer",
        element: <ConsumerDashboard />,
      },
      // Admin Management Routes
      {
        path: "roles",
        element: (
          <ProtectedRoute allowedRoles={['admin']}>
            <RoleManagement />
          </ProtectedRoute>
        ),
      },
      // User Management Routes
      {
        path: "users/company",
        element: <CompanyUsers />,
      },
      {
        path: "users/consumer",
        element: <ConsumerUsers />,
      },
      {
        path: "users/other",
        element: <OtherUsers />,
      },
      // Vendor Management Routes
      {
        path: "companies",
        element: (
          <ProtectedRoute allowedRoles={['admin']}>
            <CompanyList />
          </ProtectedRoute>
        ),
      },
      {
        path: "consumers",
        element: (
          <ProtectedRoute allowedRoles={['admin']}>
            <ConsumerList />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);

export default router;
