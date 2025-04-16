import { Outlet } from "react-router-dom";
import "../styles/layout/PublicLayout.css";

const PublicLayout = () => {
  return (
    <div className="public-layout">
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default PublicLayout;
