# Radhe Consultancy - Codebase Index

*Last Updated: December 2024*

## Project Overview

Radhe Consultancy is a comprehensive CRM (Customer Relationship Management) system for insurance and compliance services. The application consists of a Node.js/Express backend with MySQL database and a React frontend with Vite build system.

## Architecture

### Backend Architecture

- **Framework**: Node.js with Express.js
- **Database**: MySQL with Sequelize ORM
- **Authentication**: JWT with role-based access control
- **File Upload**: Multer for handling file uploads
- **Email**: Nodemailer for email notifications
- **WhatsApp Integration**: Custom OTP verification system

### Frontend Architecture

- **Framework**: React 18 with Vite
- **Routing**: React Router DOM v6
- **State Management**: React Context API
- **UI Components**: Ant Design, Heroicons, Lucide React
- **Styling**: Tailwind CSS with custom components
- **Authentication**: Google OAuth integration

## Project Structure

### Backend Structure (`/Backend/`)

#### Core Configuration

```
Backend/
├── config/
│   ├── config.js          # Environment-based configuration
│   ├── cors.js            # CORS and security headers
│   ├── db.js              # Database connection setup
│   └── multerConfig.js    # File upload configuration
├── server.js              # Main server entry point
└── package.json           # Dependencies and scripts
```

#### Models (Database Schema)

```
Backend/models/
├── index.js                           # Model associations and exports
├── userModel.js                       # User authentication and profiles
├── roleModel.js                       # Role definitions
├── userRoleModel.js                   # User-role mappings
├── permissionModel.js                 # Permission system
├── rolePermissionModel.js             # Role-permission mappings
├── companyModel.js                    # Company profiles
├── consumerModel.js                   # Consumer profiles
├── insuranceCompanyModel.js           # Insurance providers
├── employeeCompensationPolicyModel.js # ECP policies
├── vehiclePolicyModel.js              # Vehicle insurance
├── healthPolicyModel.js               # Health insurance
├── firePolicyModel.js                 # Fire insurance
├── lifePolicyModel.js                 # Life insurance
├── dscModel.js                        # Digital Signature Certificates
├── dscLogModel.js                     # DSC activity logs
├── factoryQuotationModel.js           # Factory quotation data
├── userRoleWorkLogModel.js            # User role work logs
└── reminderLogModel.js                # Policy renewal reminders
```

#### Controllers (Business Logic)

```
Backend/controllers/
├── authController.js                   # Authentication & authorization
├── userController.js                   # User management
├── roleController.js                   # Role management
├── companyController.js                # Company operations
├── consumerController.js               # Consumer operations
├── adminDashboardController.js         # Admin dashboard data
├── insuranceCompanyController.js       # Insurance company management
├── employeeCompensationController.js   # ECP policy management
├── vehiclePolicyController.js          # Vehicle policy operations
├── healthPolicyController.js           # Health policy operations
├── firePolicyController.js             # Fire policy operations
├── lifePolicyController.js             # Life policy operations
├── dscController.js                    # DSC management
├── dscLogController.js                 # DSC log management
├── factoryQuotationController.js       # Factory quotation management
├── userRoleWorkLogController.js        # User role work log management
└── renewalController.js                # Policy renewal management
```

#### Routes (API Endpoints)

```
Backend/routes/
├── index.js                           # Route registration
├── authRoutes.js                      # Authentication endpoints
├── userRoutes.js                      # User management endpoints
├── roleRoutes.js                      # Role management endpoints
├── companyRoutes.js                   # Company endpoints
├── consumerRoutes.js                  # Consumer endpoints
├── adminDashboardRoutes.js            # Admin dashboard endpoints
├── insuranceCompanyRoutes.js          # Insurance company endpoints
├── employeeCompensationRoutes.js      # ECP policy endpoints
├── vehiclePolicyRoutes.js             # Vehicle policy endpoints
├── healthPolicyRoutes.js              # Health policy endpoints
├── firePolicyRoutes.js                # Fire policy endpoints
├── lifePolicyRoutes.js                # Life policy endpoints
├── dscRoutes.js                       # DSC endpoints
├── dscLogRoutes.js                    # DSC log endpoints
├── factoryQuotationRoutes.js          # Factory quotation endpoints
├── userRoleWorkLogRoutes.js           # User role work log endpoints
└── renewalRoutes.js                   # Renewal endpoints
```

#### Middleware (Request Processing)

```
Backend/middleware/
├── auth.js                            # JWT authentication
├── checkOwnership.js                  # Resource ownership validation
├── checkPermission.js                 # Permission checking
├── checkUserRole.js                   # Role-based access control
├── checkVendorAccess.js               # Vendor access validation
└── validation.js                      # Request validation
```

#### Services (Business Services)

```
Backend/services/
├── authService.js                     # Authentication business logic
├── roleService.js                     # Role management services
├── userService.js                     # User management services
└── vendorService.js                   # Vendor operations
```

#### Utilities (Helper Functions)

```
Backend/utils/
├── email.js                           # Email sending utilities
├── helperFunctions.js                 # General helper functions
├── otp.js                             # OTP generation and verification
├── roleDetermination.js               # User role determination
└── whatsapp.js                        # WhatsApp integration
```

#### Scripts (Automation)

```
Backend/scripts/
├── serverSetup.js                     # Initial server setup
└── sendRenewalReminders.js            # Automated renewal reminders
```

### Frontend Structure (`/frontend/`)

#### Core Application

```
frontend/
├── src/
│   ├── App.jsx                        # Main application component
│   ├── main.jsx                       # Application entry point
│   ├── index.jsx                      # Root component
│   └── index.css                      # Global styles
├── package.json                       # Dependencies and scripts
├── vite.config.js                     # Vite configuration
└── tailwind.config.js                 # Tailwind CSS configuration
```

#### Context Providers (State Management)

```
frontend/src/contexts/
├── AuthContext.jsx                    # Authentication state
└── DataContext.jsx                    # Global data state
```

#### Layouts (Page Structure)

```
frontend/src/layouts/
├── AuthLayout.jsx                     # Authentication pages layout
├── DashboardLayout.jsx                # Dashboard pages layout
└── PublicLayout.jsx                   # Public pages layout
```

#### Pages (Route Components)

```
frontend/src/pages/
├── Home.jsx                           # Landing page
├── About.jsx                          # About page
├── Insurance.jsx                      # Insurance services
├── Compliance.jsx                     # Compliance services
├── Contact.jsx                        # Contact page
├── Blog.jsx                           # Blog listing
├── Bloginner.jsx                      # Blog detail
├── ComingSoon.jsx                     # Coming soon page
├── NotFound.jsx                       # 404 page
└── dashboard/                         # Dashboard pages
    ├── auth/                          # Authentication pages
    │   ├── Login.jsx
    │   ├── Register.jsx
    │   ├── ForgotPassword.jsx
    │   ├── ResetPassword.jsx
    │   ├── ChangePassword.jsx
    │   └── Unauthorized.jsx
    ├── home/
    │   └── CombinedDashboard.jsx      # Main dashboard
    ├── users/                         # User management
    │   ├── CompanyUsers.jsx
    │   ├── ConsumerUsers.jsx
    │   └── OtherUsers.jsx
    ├── companies/
    │   └── CompanyList.jsx
    ├── consumers/
    │   └── ConsumerList.jsx
    ├── roles/
    │   └── RoleManagement.jsx
    ├── insurance/                     # Insurance management
    │   ├── Companies.jsx
    │   ├── ECP.jsx
    │   ├── Health.jsx
    │   ├── Fire.jsx
    │   ├── Life.jsx
    │   └── Vehicle.jsx
    ├── compliance/                    # Compliance management
    │   ├── FactoryAct.jsx
    │   ├── LabourInspection.jsx
    │   └── LabourLicense.jsx
    ├── dsc/
    │   └── DSC.jsx
    ├── logs/                          # Log management
    │   └── DSCLogs.jsx
    ├── renewals/                      # Renewal management
    │   ├── RenewalList.jsx
    │   ├── RenewalLog.jsx
    │   └── RenewalManager.jsx
    ├── profile/
    │   └── Profile.jsx
    ├── support/
    │   └── Support.jsx
    └── widget/
        └── widget.jsx
```

#### Components (Reusable UI)

```
frontend/src/components/
├── common/                            # Common components
│   ├── ActionButton/
│   ├── Button/
│   ├── DatePicker/
│   ├── Dropdown/
│   ├── FilterButton/
│   ├── Input/
│   ├── Loader/
│   ├── Modal/
│   ├── Pagination/
│   ├── SearchBar/
│   ├── Sidebar/
│   ├── Table/
│   ├── LazyImage.jsx
│   ├── RoleBasedNav.jsx
│   └── profile/
│       └── ProfileCard.jsx
├── dashboard/                         # Dashboard components
│   ├── Header.jsx
│   ├── Sidebar.jsx
│   └── Footer.jsx
├── ErrorBoundary.jsx                  # Error handling
├── ProtectedRoute.jsx                 # Route protection
├── Header.jsx                         # Public header
├── Footer.jsx                         # Public footer
├── Contact.jsx                        # Contact component
├── Testimonial.jsx                    # Testimonials
├── Workingwith.jsx                    # Partners/working with
├── NewsUpdates.jsx                    # News updates
├── Casestudy.jsx                      # Case studies
└── Icons.jsx                          # Icon components
```

#### Services (API Integration)

```
frontend/src/services/
└── api.js                             # API service layer
```

#### Routes (Navigation)

```
frontend/src/routes/
└── index.jsx                          # Route definitions
```

#### Styles (CSS/SCSS)

```
frontend/src/styles/
├── components/                        # Component styles
│   ├── common/                        # Common component styles
│   ├── dashboard/                     # Dashboard styles
│   ├── Contact.css
│   ├── Footer.css
│   ├── Header.css
│   ├── NewsUpdates.css
│   ├── Testimonial.css
│   └── Workingwith.css
├── layout/                            # Layout styles
│   ├── DashboardLayout.css
│   ├── MainLayout.css
│   └── PublicLayout.css
├── pages/                             # Page styles
│   ├── dashboard/                     # Dashboard page styles
│   ├── About.css
│   ├── Blog.css
│   ├── Bloginner.css
│   ├── ComingSoon.css
│   ├── Compliance.css
│   ├── Contact.css
│   ├── Home.css
│   └── Insurance.css
└── icons.css                          # Icon styles
```

#### Assets (Static Files)

```
frontend/src/assets/
├── @RADHE CONSULTANCY LOGO.png        # Company logos
├── Background.png                     # Background images
├── blog-*.png                         # Blog images
├── gallery-*.png                      # Gallery images
├── hero-*.png                         # Hero section images
├── Animation-*.json                   # Lottie animations
└── react.svg                          # React logo
```

## Key Features

### Authentication & Authorization

- JWT-based authentication
- Role-based access control (Admin, Company, Consumer)
- Google OAuth integration
- WhatsApp OTP verification
- Password reset functionality

### User Management

- Multi-role user system
- Company and consumer profiles
- User role management
- Permission-based access control

### Insurance Management

- Employee Compensation Policies (ECP)
- Vehicle Insurance
- Health Insurance
- Fire Insurance
- Life Insurance
- Insurance company management

### Compliance Services

- Factory Act compliance
- Labour inspection management
- Labour license management
- Digital Signature Certificates (DSC)
- Factory quotation management
- DSC activity logging and tracking

### Dashboard & Analytics

- Role-specific dashboards
- Policy management
- Renewal tracking
- Admin statistics
- Recent activities
- User role work activity tracking
- DSC activity logs

### Communication

- Email notifications
- WhatsApp integration
- Renewal reminders
- OTP verification

## API Endpoints

### Authentication

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/google` - Google OAuth login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/forgot-password` - Forgot password
- `POST /api/auth/reset-password/:token` - Reset password
- `POST /api/auth/whatsapp/send-otp` - Send WhatsApp OTP
- `POST /api/auth/whatsapp/verify-otp` - Verify WhatsApp OTP

### User Management

- `GET /api/users` - Get users
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Role Management

- `GET /api/roles` - Get roles
- `POST /api/roles` - Create role
- `PUT /api/roles/:id` - Update role
- `DELETE /api/roles/:id` - Delete role

### Company Management

- `GET /api/companies` - Get companies
- `POST /api/companies` - Create company
- `PUT /api/companies/:id` - Update company
- `DELETE /api/companies/:id` - Delete company

### Consumer Management

- `GET /api/consumers` - Get consumers
- `POST /api/consumers` - Create consumer
- `PUT /api/consumers/:id` - Update consumer
- `DELETE /api/consumers/:id` - Delete consumer

### Insurance Management

- `GET /api/insurance-companies` - Get insurance companies
- `GET /api/employee-compensation` - Get ECP policies
- `GET /api/vehicle-policies` - Get vehicle policies
- `GET /api/health-policies` - Get health policies
- `GET /api/fire-policies` - Get fire policies
- `GET /api/life-policies` - Get life policies

### Renewal Management

- `GET /api/renewals` - Get renewals
- `POST /api/renewals` - Create renewal
- `PUT /api/renewals/:id` - Update renewal

### DSC Management

- `GET /api/dsc` - Get DSC records
- `POST /api/dsc` - Create DSC record
- `PUT /api/dsc/:id` - Update DSC record
- `DELETE /api/dsc/:id` - Delete DSC record
- `GET /api/dsc-logs` - Get DSC activity logs

### Factory Quotation

- `GET /api/factory-quotations` - Get factory quotations
- `POST /api/factory-quotations` - Create factory quotation

### User Role Work Logs

- `GET /api/user-role-work-logs` - Get user role work logs
- `POST /api/user-role-work-logs` - Create user role work log

### Admin Dashboard

- `GET /api/admin-dashboard/stats` - Get admin statistics
- `GET /api/admin-dashboard/activities` - Get recent activities

## Database Schema

### Core Tables

- `Users` - User accounts and authentication
  - `user_id` (PK), `username`, `email`, `contact_number`, `password` (hashed), `google_id`, `profile_image`, `reset_token`, `reset_token_expiry`
  - Password hashing with bcrypt, Google OAuth support, password reset functionality
- `Roles` - Role definitions
  - `id` (PK), `role_name`, `description`
  - Predefined roles: Admin, User, Vendor_manager, User_manager, Company, Consumer, Insurance_manager, Compliance_manager, DSC_manager
- `Permissions` - Permission definitions
  - `id` (PK), `permission_name`
  - Granular permissions for user, company, consumer, role, and policy management
- `RolePermissions` - Role-permission mappings (many-to-many)
  - `role_id`, `permission_id`
- `Companies` - Company profiles
  - `company_id` (PK), `company_name`, `owner_name`, `owner_address`, `designation`, `company_address`, `contact_number`, `company_email`, `gst_number`, `pan_number`, `firm_type`, `nature_of_work`, `factory_license_number`, `labour_license_number`, `type_of_company`, `status`, `gst_document`, `pan_document`, `user_id` (FK)
  - Support for different firm types: Proprietorship, Partnership, LLP, Private Limited, Limited, Trust
  - Company types: Industries, Contractor, School, Hospital, Service
- `Consumers` - Consumer profiles
  - `consumer_id` (PK), `user_id` (FK), `name`, `email`, `profile_image`, `phone_number`, `contact_address`, `status`
- `InsuranceCompanies` - Insurance providers
  - `id` (PK), `name`, `contact_info`, `status`

### Policy Tables

- `EmployeeCompensationPolicies` - ECP policies
  - `id` (PK), `business_type` (Fresh/New, Renewal/Rollover, Endorsement), `customer_type` (Organisation, Individual), `insurance_company_id` (FK), `company_id` (FK), `policy_number`, `email`, `mobile_number`, `policy_start_date`, `policy_end_date`, `medical_cover` (25k-5 lac options), `gst_number`, `pan_number`, `net_premium`, `gst`, `gross_premium`, `policy_document_path`, `remarks`, `status`
  - Comprehensive validation for dates, amounts, and document requirements
- `VehiclePolicies` - Vehicle insurance policies
- `HealthPolicies` - Health insurance policies
- `FirePolicies` - Fire insurance policies
- `LifePolicies` - Life insurance policies

### Supporting Tables

- `DSC` - Digital Signature Certificates
  - `id` (PK), `user_id` (FK), `dsc_type`, `valid_from`, `valid_to`, `status`, `document_path`
- `DSCLogs` - DSC activity logs
  - `id` (PK), `dsc_id` (FK), `action`, `performed_by`, `timestamp`
- `FactoryQuotations` - Factory quotation data
  - `id` (PK), `company_id` (FK), `quotation_details`, `status`
- `UserRoleWorkLogs` - User role work activity logs
  - `id` (PK), `user_id` (FK), `role_id` (FK), `action`, `details`, `timestamp`
- `ReminderLogs` - Policy renewal reminders
  - `policy_id`, `policy_type`, `sent_at`
  - Tracks reminder history to prevent spam

### Key Relationships

- Users can have multiple roles through a many-to-many relationship
- Companies and Consumers belong to Users (one-to-one)
- All policies reference InsuranceCompanies and either Companies or Consumers
- Role-based permissions system with granular access control

## Environment Configuration

### Backend Environment Variables

- `PORT` - Server port
- `NODE_ENV` - Environment (development/production)
- `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` - Database configuration
- `JWT_SECRET` - JWT signing secret
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` - Google OAuth
- `EMAIL_USER`, `EMAIL_PASSWORD` - Email configuration
- `ADMIN_EMAIL`, `ADMIN_PASSWORD` - Admin credentials

### Frontend Environment Variables

- `VITE_API_URL` - Backend API URL
- `VITE_GOOGLE_CLIENT_ID` - Google OAuth client ID

## Development Setup

### Backend Setup

```bash
cd Backend
npm install
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### Database Setup

- MySQL database required
- Run `npm run setup:permissions` to initialize roles and permissions
- Database tables are created automatically via Sequelize

## Security Features

- JWT authentication with role-based access
- CORS configuration
- Helmet security headers
- Input validation and sanitization
- File upload restrictions
- Password hashing with bcrypt
- Environment-based configuration

## Deployment

- Backend: Node.js server with PM2 or similar process manager
- Frontend: Static build with Vite
- Database: MySQL server
- Environment variables must be configured for production

## Key Technologies

### Backend

- Node.js 18+
- Express.js
- Sequelize ORM
- MySQL
- JWT
- bcryptjs
- multer
- nodemailer
- google-auth-library

### Frontend

- React 18
- Vite
- React Router DOM
- Tailwind CSS
- Ant Design
- Axios
- React Icons
- Lottie React

This codebase represents a comprehensive insurance and compliance management system with modern web technologies, robust authentication, and scalable architecture.
