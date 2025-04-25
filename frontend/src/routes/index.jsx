import { createBrowserRouter } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import PublicLayout from "../layouts/PublicLayout";
import AuthLayout from "../layouts/AuthLayout";
import ComingSoon from "../pages/ComingSoon";
import Login from "../pages/dashboard/auth/Login";
import Register from "../pages/dashboard/auth/Register";
import ForgotPassword from "../pages/dashboard/auth/ForgotPassword";
import ResetPassword from "../pages/dashboard/auth/ResetPassword";
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
import Profile from "../pages/dashboard/profile/Profile";
import ChangePassword from "../pages/dashboard/auth/ChangePassword";
import Support from "../pages/dashboard/support/Support";
import Widget from "../pages/dashboard/widget/widget"
import ECP from "../pages/dashboard/insurance/ECP";
import Health from "../pages/dashboard/insurance/Health";
import Marine from "../pages/dashboard/insurance/Marine";
import Fire from "../pages/dashboard/insurance/Fire";
import Vehicle from "../pages/dashboard/insurance/Vehicle";
import FactoryAct from "../pages/dashboard/compliance/FactoryAct";
import LabourInspection from "../pages/dashboard/compliance/LabourInspection";
import LabourLicense from "../pages/dashboard/compliance/LabourLicense";
import DSC from "../pages/dashboard/dsc/DSC";

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
      {
        path: "forgot-password",
        element: <ForgotPassword />,
      },
      {
        path: "reset-password",
        element: <ResetPassword />,
      }
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
      {
        path: "profile",
        element: <Profile />,
      },  
      {
        path: "change-password",
        element: <ChangePassword />,
      },
      {
        path: "support",
        element: <Support />,
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
      // Widget Routes  
      {
        path: "widget",
        element: <Widget />,
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
      // Insurance Routes
      {
        path: "insurance/ECP",
        element: <ECP />,
      },
      {
        path: "insurance/health",
        element: <Health />,
      },
      {
        path: "insurance/marine",
        element: <Marine />,
      },
      {
        path: "insurance/fire",
        element: <Fire />,
      },
      {
        path: "insurance/vehicle",
        element: <Vehicle />,
      },
      // Compliance Routes
      {
        path: "compliance/factory-act",
        element: <FactoryAct />,
      },
      {
        path: "compliance/labour-inspection",
        element: <LabourInspection />,
      },
      {
        path: "compliance/labour-license",
        element: <LabourLicense />,
      },
      // DSC Route
      {
        path: "dsc",
        element: <DSC />,
      },
      // Profile Routes
     
    ],
  },
]);

export default router;
