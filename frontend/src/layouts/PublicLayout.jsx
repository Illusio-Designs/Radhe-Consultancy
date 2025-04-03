import { Outlet } from 'react-router-dom';
import './PublicLayout.css';

function PublicLayout() {
  return (
    <div className="public-layout">
      <header className="public-header">
        <nav className="public-nav">
          <div className="nav-brand">Radhe Consultancy</div>
          <ul className="nav-links">
            <li><a href="/">Home</a></li>
            <li><a href="/about">About</a></li>
            <li><a href="/services">Services</a></li>
            <li><a href="/contact">Contact</a></li>
            <li className="nav-auth"><a href="/auth/login">Login</a></li>
          </ul>
        </nav>
      </header>
      <main className="public-main">
        <Outlet />
      </main>
      <footer className="public-footer">
        <p>&copy; 2024 Radhe Consultancy. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default PublicLayout;