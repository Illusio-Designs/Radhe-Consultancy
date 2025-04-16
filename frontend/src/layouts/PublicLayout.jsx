import { Outlet } from 'react-router-dom';

const PublicLayout = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100">
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default PublicLayout; 