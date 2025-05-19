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

// Route configuration object
const routes = {
  auth: {
    path: '/api/auth',
    router: authRoutes
  },
  users: {
    path: '/api/users',
    router: userRoutes
  },
  roles: {
    path: '/api/roles',
    router: roleRoutes
  },
  companies: {
    path: '/api/companies',
    router: companyRoutes
  },
  consumers: {
    path: '/api/consumers',
    router: consumerRoutes
  },
  adminDashboard: {
    path: '/api/admin-dashboard',
    router: adminDashboardRoutes
  },
  employeeCompensation: {
    path: '/api/employee-compensation',
    router: employeeCompensationRoutes
  },
  insuranceCompanies: {
    path: '/api/insurance-companies',
    router: insuranceCompanyRoutes
  }
};

/**
 * Register all routes with the Express app
 * @param {Express} app - Express application instance
 */
const registerRoutes = (app) => {
  Object.values(routes).forEach(({ path, router }) => {
    app.use(path, router);
    console.log(`Registered routes for: ${path}`);
  });
};

module.exports = {
  routes,
  registerRoutes
}; 