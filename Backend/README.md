# Backend Documentation

## Directory Structure
```
Backend/
├── config/           # Configuration files
│   ├── db.js        # Database configuration
│   └── jwt.js       # JWT configuration
├── controllers/      # Route controllers
│   ├── authController.js
│   ├── userController.js
│   ├── companyController.js
│   └── adminController.js
├── middleware/       # Custom middleware
│   ├── auth.js      # Authentication middleware
│   └── error.js     # Error handling middleware
├── models/          # Database models
│   ├── User.js
│   ├── Company.js
│   └── Role.js
├── routes/          # API routes
│   ├── auth.js
│   ├── user.js
│   ├── company.js
│   └── admin.js
├── services/        # Business logic
│   ├── authService.js
│   └── userService.js
├── utils/           # Utility functions
│   ├── validators.js
│   └── helpers.js
├── uploads/         # File uploads directory
├── scripts/         # Database and setup scripts
├── server.js        # Main application file
└── package.json     # Dependencies and scripts
```

## API Endpoints

### Authentication
- POST /api/auth/login
- POST /api/auth/register
- POST /api/auth/logout
- GET /api/auth/me

### Users
- GET /api/users
- GET /api/users/:id
- POST /api/users
- PUT /api/users/:id
- DELETE /api/users/:id

### Companies
- GET /api/companies
- GET /api/companies/:id
- POST /api/companies
- PUT /api/companies/:id
- DELETE /api/companies/:id

### Admin
- GET /api/admin/stats
- GET /api/admin/users
- GET /api/admin/companies

## Environment Variables
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=password
DB_NAME=radhe_consultancy
DB_PORT=3306

JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=24h

PORT=5000
NODE_ENV=development
```

## Setup Instructions
1. Install dependencies:
   ```bash
   npm install
   ```

2. Create .env file:
   ```bash
   cp .env.example .env
   ```

3. Update environment variables in .env

4. Start the server:
   ```bash
   npm start
   ```

## Development
- Run in development mode:
  ```bash
  npm run dev
  ```

- Run tests:
  ```bash
  npm test
  ```

## Database
- MySQL database is used
- Sequelize ORM for database operations
- Models are defined in the models directory
- Migrations are handled through scripts

## Security
- JWT authentication
- Password hashing with bcrypt
- Input validation
- Error handling middleware
- CORS configuration
- Rate limiting

## Error Handling
- Custom error middleware
- Standardized error responses
- Logging of errors
- Request logging

## File Uploads
- Multer middleware for file handling
- Uploads stored in /uploads directory
- File type validation
- Size limits enforced

## Logging
- Console logging in development
- File logging in production
- Error logging
- Request logging 