/**
 * Routes Index
 * This file centralizes all route imports and exports them as a single object
 */

const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const roleRoutes = require('./roleRoutes');
const companyRoutes = require('./companyRoutes');
const consumerRoutes = require('./consumerRoutes');
const adminDashboardRoutes = require('./adminDashboardRoutes');
const employeeCompensationRoutes = require('./employeeCompensationRoutes');
const insuranceCompanyRoutes = require('./insuranceCompanyRoutes');
const vehiclePolicyRoutes = require('./vehiclePolicyRoutes');
const healthPolicyRoutes = require('./healthPolicyRoutes');
const firePolicyRoutes = require('./firePolicyRoutes');
const lifePolicyRoutes = require('./lifePolicyRoutes');
const dscRoutes = require('./dscRoutes');

// Route configuration object
const routes = {
  auth: {
    path: '/auth',
    router: authRoutes
  },
  users: {
    path: '/users',
    router: userRoutes
  },
  roles: {
    path: '/roles',
    router: roleRoutes
  },
  companies: {
    path: '/companies',
    router: companyRoutes
  },
  consumers: {
    path: '/consumers',
    router: consumerRoutes
  },
  adminDashboard: {
    path: '/admin-dashboard',
    router: adminDashboardRoutes
  },
  employeeCompensation: {
    path: '/employee-compensation',
    router: employeeCompensationRoutes
  },
  insuranceCompanies: {
    path: '/insurance-companies',
    router: insuranceCompanyRoutes
  },
  vehiclePolicies: {
    path: '/vehicle-policies',
    router: vehiclePolicyRoutes
  },
  healthPolicies: {
    path: '/health-policies',
    router: healthPolicyRoutes
  },
  firePolicies: {
    path: '/fire-policies',
    router: firePolicyRoutes
  },
  lifePolicies: {
    path: '/life-policies',
    router: lifePolicyRoutes
  },
  dsc: {
    path: '/dsc',
    router: dscRoutes
  }
};

/**
 * Register all routes with the Express app
 * @param {Express} app - Express application instance
 */
const registerRoutes = (app) => {
  // Register each route under /api
  Object.values(routes).forEach(({ path, router }) => {
    const fullPath = `/api${path}`;
    app.use(fullPath, router);
    console.log(`Registered routes for: ${fullPath}`);
  });
};

module.exports = {
  routes,
  registerRoutes
}; 