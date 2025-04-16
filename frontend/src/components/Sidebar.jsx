import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Sidebar = ({ user }) => {
  const location = useLocation();
  const { isAdmin, isCompany, isConsumer } = useAuth();

  const isActive = (path) => location.pathname === path;

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        {isAdmin && (
          <>
            <Link to="/admin" className={isActive('/admin') ? 'active' : ''}>
              Admin Dashboard
            </Link>
            <Link to="/admin/users" className={isActive('/admin/users') ? 'active' : ''}>
              Manage Users
            </Link>
            <Link to="/admin/companies" className={isActive('/admin/companies') ? 'active' : ''}>
              Manage Companies
            </Link>
            <Link to="/admin/consumers" className={isActive('/admin/consumers') ? 'active' : ''}>
              Manage Consumers
            </Link>
          </>
        )}

        {isCompany && (
          <>
            <Link to="/company" className={isActive('/company') ? 'active' : ''}>
              Company Dashboard
            </Link>
            <Link to="/company/products" className={isActive('/company/products') ? 'active' : ''}>
              Products
            </Link>
            <Link to="/company/orders" className={isActive('/company/orders') ? 'active' : ''}>
              Orders
            </Link>
            <Link to="/company/profile" className={isActive('/company/profile') ? 'active' : ''}>
              Profile
            </Link>
          </>
        )}

        {isConsumer && (
          <>
            <Link to="/consumer" className={isActive('/consumer') ? 'active' : ''}>
              Consumer Dashboard
            </Link>
            <Link to="/consumer/orders" className={isActive('/consumer/orders') ? 'active' : ''}>
              My Orders
            </Link>
            <Link to="/consumer/wishlist" className={isActive('/consumer/wishlist') ? 'active' : ''}>
              Wishlist
            </Link>
            <Link to="/consumer/profile" className={isActive('/consumer/profile') ? 'active' : ''}>
              Profile
            </Link>
          </>
        )}
      </nav>
    </aside>
  );
};

export default Sidebar; 