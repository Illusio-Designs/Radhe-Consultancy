import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FiPackage,
  FiUsers,
  FiDollarSign,
  FiTrendingUp,
  FiRefreshCw,
  FiCalendar,
  FiClock,
} from "react-icons/fi";
import "../../../styles/pages/dashboard/home/Dashboard.css";
import { toast } from 'react-toastify';

const StatCard = ({ icon: Icon, title, value, change }) => (
  <div className="stat-card">
    <div className="stat-card-content">
      <div className="stat-card-header">
        <div className="stat-icon-container">
          <Icon className="stat-icon" />
        </div>
        <div className="stat-info">
          <h3 className="stat-title">{title}</h3>
          <div className="stat-value">{value}</div>
        </div>
      </div>
      <div className={`stat-change ${change >= 0 ? "positive" : "negative"}`}>
        {change >= 0 ? "+" : ""}
        {change}%<span className="stat-change-indicator"></span>
      </div>
    </div>
  </div>
);

const CompanyDashboard = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [timeFilter, setTimeFilter] = useState("7days");
  const [lastUpdated, setLastUpdated] = useState(new Date().toLocaleTimeString());
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    activeProducts: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/company/stats");
        const data = await response.json();
        setStats(data);
        toast.success("Dashboard data loaded successfully!");
      } catch (error) {
        console.error("Error fetching company stats:", error);
        toast.error("Failed to load dashboard data. Please try again.");
      }
    };

    fetchStats();
  }, []);



  const companyStats = [
    {
      id: 1,
      title: "Total Products",
      value: stats.totalProducts,
      change: 5.2,
      icon: FiPackage,
    },
    {
      id: 2,
      title: "Total Orders",
      value: stats.totalOrders,
      change: 12.8,
      icon: FiUsers,
    },
    {
      id: 3,
      title: "Active Products",
      value: stats.activeProducts,
      change: -1.4,
      icon: FiTrendingUp,
    },
    {
      id: 4,
      title: "Total Revenue",
      value: `$${stats.totalRevenue.toLocaleString()}`,
      change: 8.5,
      icon: FiDollarSign,
    },
  ];

  const recentOrders = [
    {
      id: 1,
      text: "New order #1234 from John Doe",
      time: "1 hour ago",
      status: "pending",
      amount: "$150.00",
    },
    {
      id: 2,
      text: "Order #1233 completed",
      time: "3 hours ago",
      status: "completed",
      amount: "$75.50",
    },
    {
      id: 3,
      text: "Order #1232 cancelled",
      time: "5 hours ago",
      status: "cancelled",
      amount: "$200.00",
    },
  ];

  const upcomingDeliveries = [
    {
      id: 1,
      text: "Delivery for Order #1234",
      date: "Today, 3:00 PM",
      status: "in-transit",
    },
    {
      id: 2,
      text: "Delivery for Order #1235",
      date: "Tomorrow, 10:00 AM",
      status: "scheduled",
    },
    {
      id: 3,
      text: "Delivery for Order #1236",
      date: "Wed, 2:00 PM",
      status: "pending",
    },
  ];

  const handleRefresh = () => {
    setIsLoading(true);
    toast.info("Refreshing dashboard data...");
    // Simulate data refresh
    setTimeout(() => {
      setIsLoading(false);
      setLastUpdated(new Date().toLocaleTimeString());
      toast.success("Dashboard refreshed successfully!");
    }, 800);
  };

  const handleFilterChange = (e) => {
    setTimeFilter(e.target.value);
    handleRefresh();
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div className="dashboard-title-area">
          <h1>Company Dashboard</h1>
          <div className="dashboard-meta">
            <span className="last-updated">
              <FiClock className="meta-icon" /> Last updated: {lastUpdated}
            </span>
            <button
              className={`refresh-button ${isLoading ? "refreshing" : ""}`}
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <FiRefreshCw className="refresh-icon" />
              {isLoading ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>
        <div className="date-filter">
          <FiCalendar className="filter-icon" />
          <select value={timeFilter} onChange={handleFilterChange}>
            <option value="7days">Last 7 days</option>
            <option value="30days">Last 30 days</option>
            <option value="90days">Last 3 months</option>
          </select>
        </div>
      </div>

      <div className="stats-grid">
        {companyStats.map((stat) => (
          <StatCard
            key={stat.id}
            icon={stat.icon}
            title={stat.title}
            value={stat.value}
            change={stat.change}
          />
        ))}
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card orders-card">
          <div className="card-header">
            <h2>Recent Orders</h2>
            <span className="card-count">{recentOrders.length} orders</span>
          </div>
          <ul className="order-list">
            {recentOrders.map((order) => (
              <li
                key={order.id}
                className={`order-item status-${order.status}`}
              >
                <div className="order-content">
                  <span className="order-text">{order.text}</span>
                  <div className="order-meta">
                    <span className="order-amount">{order.amount}</span>
                    <span className="order-time">{order.time}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="dashboard-card deliveries-card">
          <div className="card-header">
            <h2>Upcoming Deliveries</h2>
            <span className="card-count">
              {upcomingDeliveries.length} deliveries
            </span>
          </div>
          <ul className="delivery-list">
            {upcomingDeliveries.map((delivery) => (
              <li
                key={delivery.id}
                className={`delivery-item status-${delivery.status}`}
              >
                <div className="delivery-content">
                  <span className="delivery-text">{delivery.text}</span>
                  <div className="delivery-meta">
                    <span className="delivery-status">{delivery.status}</span>
                    <span className="delivery-date">{delivery.date}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="company-actions">
        <h2>Quick Actions</h2>
        <div className="action-buttons">
          <Link to="/dashboard/products" className="action-button">
            Manage Products
          </Link>
          <Link to="/dashboard/orders" className="action-button">
            View Orders
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CompanyDashboard;