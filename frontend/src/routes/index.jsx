import { createBrowserRouter } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import PublicLayout from "../layouts/PublicLayout";
import AuthLayout from "../layouts/AuthLayout";
import ComingSoon from "../pages/ComingSoon";
import Login from "../pages/dashboard/auth/Login";
import Register from "../pages/dashboard/auth/Register";
import Dashboard from "../pages/dashboard/home/Dashboard";
import Unauthorized from "../pages/dashboard/auth/Unauthorized";
import UserRoleManagement from "../pages/dashboard/users/UserRoleManagement";
import CompanyUsers from "../pages/dashboard/users/CompanyUsers";
import ConsumerUsers from "../pages/dashboard/users/ConsumerUsers";
import CompanyList from "../pages/dashboard/companies/CompanyList"; // Added CompanyList route
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
      // Admin Routes
      {
        path: "users",
        element: <UserRoleManagement />,
      },
      {
        path: "roles",
        element: <UserRoleManagement />,
      },
      // Company Management Routes
      {
        path: "companies",
        element: <CompanyUsers />,
      },
      {
        path: "companies/:companyId",
        element: <CompanyUsers />,
      },
      {
        path: "companies/:companyId/edit",
        element: <CompanyUsers />,
      },
      // Company List Route
      {
        path: "companylist",
        element: <CompanyList />,
      },
      // Consumer Management Routes
      {
        path: "consumers",
        element: <ConsumerUsers />,
      },
      {
        path: "consumers/:consumerId",
        element: <ConsumerUsers />,
      },
      {
        path: "consumers/:consumerId/edit",
        element: <ConsumerUsers />,
      },
    ],
  },
]);

export default router;
