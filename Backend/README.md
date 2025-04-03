# CRM Backend

This is the backend for a Customer Relationship Management (CRM) system that allows managing users, roles, and vendors (both companies and consumers) with Google OAuth integration.

## Features

- User Management with Role-Based Access Control
- Vendor Management (Company and Consumer)
- Google OAuth Integration
- File Upload for Profile Images
- JWT Authentication
- MySQL Database with Sequelize ORM

## Prerequisites

- Node.js (v14 or higher)
- MySQL (v8 or higher)
- npm or yarn

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=3000
   NODE_ENV=development
   DB_HOST=localhost
   DB_USER=your_mysql_username
   DB_PASSWORD=your_mysql_password
   DB_NAME=radhe_consultancy_crm
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRES_IN=24h
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   UPLOAD_PATH=uploads/profile-images
   MAX_FILE_SIZE=5242880
   ```

4. Create the MySQL database:
   ```sql
   CREATE DATABASE radhe_consultancy_crm;
   ```

5. Create the uploads directory:
   ```bash
   mkdir -p uploads/profile-images
   ```

6. Start the server:
   ```bash
   npm start
   ```

For development with auto-reload:
```bash
npm run dev
```

## API Endpoints

### Authentication
- POST `/api/auth/login` - Regular login
- POST `/api/auth/google-login` - Google OAuth login
- POST `/api/auth/register` - Register new user

### Users
- GET `/api/users` - Get all users
- GET `/api/users/:userId` - Get user by ID
- POST `/api/users` - Create new user
- PUT `/api/users/:userId` - Update user
- DELETE `/api/users/:userId` - Delete user
- POST `/api/users/:userId/profile-image` - Update profile image
- GET `/api/users/:userId/permissions` - Get user permissions

### Vendors
- POST `/api/vendors` - Create new vendor
- GET `/api/vendors` - Get all vendors
- GET `/api/vendors/:vendorId` - Get vendor by ID
- PUT `/api/vendors/:vendorId` - Update vendor
- DELETE `/api/vendors/:vendorId` - Delete vendor
- POST `/api/vendors/google-login` - Google login for vendors

## Database Schema

The application uses the following main tables:
- Users
- Roles
- RolePermissions
- Vendors
- CompanyVendors
- ConsumerVendors

## Security

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control
- Input validation
- File upload restrictions

## Error Handling

The application includes comprehensive error handling for:
- Authentication errors
- Database errors
- File upload errors
- Validation errors

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request 