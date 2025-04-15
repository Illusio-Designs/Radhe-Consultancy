import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const RoleBasedNav = () => {
  const { user } = useAuth();
  const role = user?.role?.role_name;

  const getNavItems = () => {
    switch (role) {
      case 'admin':
        return [
          { path: '/dashboard', label: 'Dashboard' },
          { path: '/users', label: 'Users' },
          { path: '/companies', label: 'Companies' },
          { path: '/consumers', label: 'Consumers' }
        ];
      case 'vendor_manager':
        return [
          { path: '/dashboard', label: 'Dashboard' },
          { path: '/companies', label: 'Companies' }
        ];
      case 'user_manager':
        return [
          { path: '/dashboard', label: 'Dashboard' },
          { path: '/users', label: 'Users' },
          { path: '/consumers', label: 'Consumers' }
        ];
      case 'company':
        return [
          { path: '/dashboard', label: 'Dashboard' },
          { path: '/company-profile', label: 'Company Profile' }
        ];
      case 'consumer':
        return [
          { path: '/dashboard', label: 'Dashboard' },
          { path: '/consumer-profile', label: 'Profile' }
        ];
      default:
        return [
          { path: '/dashboard', label: 'Dashboard' }
        ];
    }
  };

  const navItems = getNavItems();

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-xl font-bold text-gray-800">
                Radhe Consultancy
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 hover:text-gray-500"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default RoleBasedNav; 