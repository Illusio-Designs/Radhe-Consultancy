import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const ConsumerDashboard = () => {
  const { user } = useAuth();
  const [consumerData, setConsumerData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSpent: 0,
    activeOrders: 0
  });

  useEffect(() => {
    const fetchConsumerData = async () => {
      try {
        const response = await axios.get('/api/consumer/profile');
        setConsumerData(response.data);
        toast.success("Profile data loaded successfully!");
      } catch (error) {
        console.error('Error fetching consumer data:', error);
        toast.error("Failed to load profile data. Please try again.");
      }
    };

    const fetchOrders = async () => {
      try {
        const response = await axios.get('/api/consumer/orders');
        setOrders(response.data.orders);
        toast.success("Orders loaded successfully!");
      } catch (error) {
        console.error('Error fetching orders:', error);
        toast.error("Failed to load orders. Please try again.");
      }
    };

    const fetchStats = async () => {
      try {
        const response = await axios.get('/api/consumer/stats');
        setStats(response.data);
        toast.success("Statistics loaded successfully!");
      } catch (error) {
        console.error('Error fetching consumer stats:', error);
        toast.error("Failed to load statistics. Please try again.");
      }
    };

    Promise.all([fetchConsumerData(), fetchOrders(), fetchStats()])
      .then(() => toast.success("Dashboard loaded successfully!"))
      .catch(() => toast.error("Some dashboard data failed to load."));
  }, []);

  return (
    <div className="consumer-dashboard">
      <h1>Consumer Dashboard</h1>
      
      {consumerData && (
        <div className="consumer-profile">
          <h2>Profile</h2>
          <div className="profile-details">
            <p><strong>Name:</strong> {consumerData.name}</p>
            <p><strong>Email:</strong> {consumerData.email}</p>
            <p><strong>Phone:</strong> {consumerData.phone_number}</p>
            <p><strong>Address:</strong> {consumerData.contact_address}</p>
          </div>
        </div>
      )}

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Orders</h3>
          <p>{stats.totalOrders}</p>
        </div>
        <div className="stat-card">
          <h3>Total Spent</h3>
          <p>₹{stats.totalSpent.toLocaleString()}</p>
        </div>
        <div className="stat-card">
          <h3>Active Orders</h3>
          <p>{stats.activeOrders}</p>
        </div>
      </div>

      <div className="recent-orders">
        <h2>Recent Orders</h2>
        {orders.length > 0 ? (
          <div className="orders-list">
            {orders.map(order => (
              <div key={order.id} className="order-card">
                <h3>Order #{order.id}</h3>
                <p><strong>Date:</strong> {new Date(order.created_at).toLocaleDateString()}</p>
                <p><strong>Status:</strong> {order.status}</p>
                <p><strong>Total:</strong> ₹{order.total.toLocaleString()}</p>
              </div>
            ))}
          </div>
        ) : (
          <p>No orders yet</p>
        )}
      </div>

      <div className="consumer-actions">
        <h2>Quick Actions</h2>
        <div className="action-buttons">
          <button onClick={() => window.location.href = '/consumer/orders'}>
            View All Orders
          </button>
          <button onClick={() => window.location.href = '/consumer/profile'}>
            Edit Profile
          </button>
          <button onClick={() => window.location.href = '/consumer/wishlist'}>
            My Wishlist
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConsumerDashboard;