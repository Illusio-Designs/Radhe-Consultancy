import { createBrowserRouter } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import AuthLayout from '../layouts/AuthLayout';
import ComingSoon from '../pages/ComingSoon';
import Login from '../pages/dashboard/auth/Login';
import Register from '../pages/dashboard/auth/Register';
import Dashboard from '../pages/dashboard/home/Dashboard';
import Unauthorized from '../pages/dashboard/auth/Unauthorized';
import UserRoleManagement from '../pages/dashboard/users/UserRoleManagement';
import CompanyUsers from '../pages/dashboard/users/CompanyUsers';
import ConsumerUsers from '../pages/dashboard/users/ConsumerUsers';
import ProtectedRoute from '../components/ProtectedRoute';

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
  // Admin Routes
  {
    path: '/dashboard/users',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <UserRoleManagement />
      </ProtectedRoute>
    ),
  },
  {
    path: '/dashboard/roles',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <UserRoleManagement />
      </ProtectedRoute>
    ),
  },
  // Company Management Routes
  {
    path: '/dashboard/companies',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <CompanyUsers />
      </ProtectedRoute>
    ),
  },
  {
    path: '/dashboard/companies/:companyId',
    element: (
      <ProtectedRoute allowedRoles={['admin', 'company']}>
        <CompanyUsers />
      </ProtectedRoute>
    ),
  },
  {
    path: '/dashboard/companies/:companyId/edit',
    element: (
      <ProtectedRoute allowedRoles={['admin', 'company']}>
        <CompanyUsers />
      </ProtectedRoute>
    ),
  },
  // Consumer Management Routes
  {
    path: '/dashboard/consumers',
    element: (
      <ProtectedRoute allowedRoles={['admin', 'company']}>
        <ConsumerUsers />
      </ProtectedRoute>
    ),
  },
  {
    path: '/dashboard/consumers/:consumerId',
    element: (
      <ProtectedRoute allowedRoles={['admin', 'company']}>
        <ConsumerUsers />
      </ProtectedRoute>
    ),
  },
  {
    path: '/dashboard/consumers/:consumerId/edit',
    element: (
      <ProtectedRoute allowedRoles={['admin', 'company']}>
        <ConsumerUsers />
      </ProtectedRoute>
    ),
  },
]);

export default router;