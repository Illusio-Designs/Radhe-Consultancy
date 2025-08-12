const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();
const sequelize = require("./config/db");
const helmet = require("helmet");
const morgan = require("morgan");
const {
  setupRolesAndPermissions,
  setupAdminUser,
} = require("./scripts/serverSetup");
const {
  corsOptions,
  allowedOrigins,
  securityHeadersMiddleware,
} = require("./config/cors");
const { registerRoutes } = require("./routes");
const config = require("./config/config");

// Initialize Express app
const app = express();

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Disable CSP temporarily
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// CORS configuration (must come before other middlewares and routes)
app.use(cors(corsOptions));
// Explicitly handle preflight for all routes
app.options('*', cors(corsOptions));

// Apply security headers middleware (after CORS so headers are not overridden)
app.use(securityHeadersMiddleware);

// Add cache control headers
app.use((req, res, next) => {
  res.header(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate"
  );
  res.header("Pragma", "no-cache");
  res.header("Expires", "0");
  next();
});

// Static files setup
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Root path handler
app.get("/", (req, res) => {
  res.json({
    status: "UP",
    message: "Welcome to Radhe Consultancy API",
    version: "1.0.0",
    documentation: "/api/docs",
    health: "/api/health",
  });
});

// API root path handler
app.get("/api", (req, res) => {
  res.json({
    status: "UP",
    message: "Radhe Consultancy API is running",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      users: "/api/users",
      roles: "/api/roles",
      companies: "/api/companies",
      consumers: "/api/consumers",
      adminDashboard: "/api/admin-dashboard",
      employeeCompensation: "/api/employee-compensation",
      insuranceCompanies: "/api/insurance-companies",
    },
  });
});

// Health check endpoint
app.get("/api/health", async (req, res) => {
  try {
    const dbStatus = await sequelize
      .authenticate()
      .then(() => "UP")
      .catch(() => "DOWN");

    res.status(200).json({
      status: "UP",
      message: "Server is running",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      version: "1.0.0",
      uptime: process.uptime(),
      services: { database: dbStatus, api: "UP" },
    });
  } catch (error) {
    res.status(500).json({
      status: "DOWN",
      error: "Internal Server Error",
      message: error.message,
    });
  }
});

// API request logging middleware
app.use("/api", (req, res, next) => {
  console.log(`API Request: ${req.method} ${req.originalUrl}`);
  next();
});

// Register routes
registerRoutes(app);

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: "Route not found",
    path: req.originalUrl,
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({
    error: {
      message: err.message || "Internal Server Error",
      ...(config.server.nodeEnv === "development" && { stack: err.stack }),
    },
  });
});

// Start server
const startServer = async () => {
  try {
    // Setup database and roles before starting server
    const {
      setupDatabase,
      setupRolesAndPermissions,
      setupAdminUser,
      setupPlanManagers,
      setupStabilityManagers,
      verifyRequiredRoles,
    } = require("./scripts/serverSetup");

    // Import account creation functions
    const {
      createAllAccounts
    } = require("./scripts/createAccounts");

    console.log("🚀 Starting complete server setup...");
    
    // Step 1: Database Setup
    console.log("📊 Setting up database structure...");
    const dbSetup = await setupDatabase();
    if (!dbSetup) {
      throw new Error("Database setup failed");
    }
    console.log("✅ Database structure setup completed");

    // Step 2: Roles and Permissions
    console.log("🔐 Setting up roles and permissions...");
    const rolesSetup = await setupRolesAndPermissions();
    if (!rolesSetup) {
      throw new Error("Roles and permissions setup failed");
    }
    console.log("✅ Roles and permissions setup completed");

    // Step 3: Verify Required Roles
    console.log("✅ Verifying required roles exist...");
    const rolesVerified = await verifyRequiredRoles();
    if (!rolesVerified) {
      throw new Error("Required roles verification failed");
    }
    console.log("✅ All required roles verified");

    // Step 4: Create All User Accounts
    console.log("👥 Creating/updating all user accounts...");
    const accountsCreated = await createAllAccounts();
    if (!accountsCreated) {
      console.warn("⚠️  Warning: Account creation failed, but continuing...");
    } else {
      console.log("✅ All user accounts created/updated successfully");
    }

    console.log("🎉 Complete server setup completed successfully!");

    const port = config.server.port;
    app.listen(port, () => {
      console.log(`🚀 Server running on port ${port}`);
      console.log(`🌍 Environment: ${config.server.nodeEnv}`);
      console.log(`🔗 Backend URL: ${config.server.backendUrl}`);
      console.log("✨ All systems ready!");
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

// Handle process termination
const signals = ["SIGTERM", "SIGINT"];
signals.forEach((signal) => {
  process.on(signal, () => {
    console.log(`Received ${signal}. Starting graceful shutdown...`);
    process.exit(0);
  });
});

// Start the server
startServer();

module.exports = { app, startServer };
