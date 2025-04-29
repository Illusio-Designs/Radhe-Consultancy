# Frontend Documentation

## Directory Structure
```
frontend/
├── public/           # Static files
│   ├── index.html
│   └── assets/
├── src/
│   ├── assets/      # Images, fonts, etc.
│   ├── components/  # Reusable components
│   │   ├── common/  # Shared components
│   │   ├── forms/   # Form components
│   │   └── layout/  # Layout components
│   ├── pages/       # Page components
│   │   ├── auth/    # Authentication pages
│   │   ├── dashboard/
│   │   └── profile/
│   ├── services/    # API services
│   │   ├── api.js
│   │   └── auth.js
│   ├── styles/      # CSS styles
│   │   ├── components/
│   │   └── pages/
│   ├── utils/       # Utility functions
│   ├── App.jsx      # Main App component
│   └── main.jsx     # Entry point
├── package.json     # Dependencies and scripts
└── vite.config.js   # Vite configuration
```

## Features
- React-based Single Page Application
- Responsive Design
- Role-Based Access Control
- Form Validation
- File Uploads
- Real-time Updates
- Error Handling
- Loading States

## Pages

### Authentication
- Login
- Register
- Forgot Password
- Reset Password

### Dashboard
- Admin Dashboard
- Company Dashboard
- Consumer Dashboard

### Profile
- User Profile
- Company Profile
- Settings

## Components

### Common
- Button
- Input
- Modal
- Table
- Card
- Alert
- Loader

### Forms
- LoginForm
- RegisterForm
- ProfileForm
- CompanyForm

### Layout
- Header
- Sidebar
- Footer
- Navigation

## State Management
- React Context API
- Local Storage
- API State Management

## API Integration
- Axios for HTTP requests
- Interceptors for auth
- Error handling
- Loading states

## Styling
- CSS Modules
- Responsive Design
- Component-specific styles
- Theme support

## Environment Variables
```env
VITE_API_URL=http://localhost:5000
VITE_APP_NAME=Radhe Consultancy
VITE_APP_VERSION=1.0.0
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

4. Start the development server:
   ```bash
   npm run dev
   ```

## Development
- Run in development mode:
  ```bash
  npm run dev
  ```

- Build for production:
  ```bash
  npm run build
  ```

- Preview production build:
  ```bash
  npm run preview
  ```

## Testing
- Run unit tests:
  ```bash
  npm test
  ```

- Run tests with coverage:
  ```bash
  npm run test:coverage
  ```

## Best Practices
- Component-based architecture
- Reusable components
- Proper error handling
- Loading states
- Form validation
- Responsive design
- Accessibility
- Performance optimization

## Deployment
- Build the application:
  ```bash
  npm run build
  ```

- Deploy the contents of the `dist` directory to your hosting service

## Browser Support
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance
- Code splitting
- Lazy loading
- Image optimization
- Bundle size optimization
- Caching strategies
