import { Navigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import AdminDashboard from "./AdminDashboard";
import CompanyDashboard from "./CompanyDashboard";
import ConsumerDashboard from "./ConsumerDashboard";
import "../../../styles/pages/dashboard/home/Dashboard.css";

const Dashboard = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  switch (user.role) {
    case "admin":
      return <AdminDashboard />;
    case "company":
      return <CompanyDashboard />;
    case "consumer":
      return <ConsumerDashboard />;
    default:
      return <Navigate to="/unauthorized" replace />;
  }
};

export default Dashboard;
