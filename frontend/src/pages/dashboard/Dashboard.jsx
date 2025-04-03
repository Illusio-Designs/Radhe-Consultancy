import './Dashboard.css';

function Dashboard() {
  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>Dashboard Overview</h1>
        <div className="date-filter">
          <select defaultValue="today">
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Customers</h3>
          <div className="stat-value">1,234</div>
          <div className="stat-change positive">+12% from last month</div>
        </div>
        <div className="stat-card">
          <h3>Active Leads</h3>
          <div className="stat-value">456</div>
          <div className="stat-change positive">+8% from last month</div>
        </div>
        <div className="stat-card">
          <h3>Revenue</h3>
          <div className="stat-value">$45,678</div>
          <div className="stat-change positive">+15% from last month</div>
        </div>
        <div className="stat-card">
          <h3>Pending Tasks</h3>
          <div className="stat-value">78</div>
          <div className="stat-change negative">-5% from last month</div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card recent-activity">
          <h2>Recent Activity</h2>
          <ul className="activity-list">
            <li>
              <span className="activity-time">2 hours ago</span>
              <span className="activity-text">New customer registration: John Doe</span>
            </li>
            <li>
              <span className="activity-time">4 hours ago</span>
              <span className="activity-text">Lead status updated: Meeting scheduled</span>
            </li>
            <li>
              <span className="activity-time">Yesterday</span>
              <span className="activity-text">Task completed: Follow-up call</span>
            </li>
          </ul>
        </div>

        <div className="dashboard-card tasks">
          <h2>Upcoming Tasks</h2>
          <ul className="task-list">
            <li>
              <input type="checkbox" id="task1" />
              <label htmlFor="task1">Call with potential client</label>
              <span className="task-date">Today</span>
            </li>
            <li>
              <input type="checkbox" id="task2" />
              <label htmlFor="task2">Send proposal to ABC Corp</label>
              <span className="task-date">Tomorrow</span>
            </li>
            <li>
              <input type="checkbox" id="task3" />
              <label htmlFor="task3">Review monthly reports</label>
              <span className="task-date">Next Week</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;