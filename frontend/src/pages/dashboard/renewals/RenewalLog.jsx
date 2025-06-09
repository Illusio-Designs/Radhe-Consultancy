import React, { useEffect, useState } from "react";
import { renewalAPI } from "../../../services/api";
import Loader from "../../../components/common/Loader/Loader";
import "../../../styles/pages/dashboard/home/CombinedDashboard.css";

const RenewalLog = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await renewalAPI.getLog();
        setLogs(response.data || []);
      } catch (err) {
        setError("Failed to fetch renewal logs");
        console.error("Error fetching logs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  return (
    <div className="dashboard-page">
      <h2>Renewal Reminder Log</h2>
      <div style={{ background: "#fff", borderRadius: 16, padding: 32, boxShadow: "0 2px 8px rgba(0,0,0,0.04)", minHeight: 400 }}>
        {loading ? (
          <Loader />
        ) : error ? (
          <div style={{ color: "red", textAlign: "center" }}>{error}</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ fontWeight: 600, fontSize: 18 }}>
                <th style={{ textAlign: "left", padding: 12 }}>Policy Type</th>
                <th style={{ textAlign: "left", padding: 12 }}>Policy ID</th>
                <th style={{ textAlign: "left", padding: 12 }}>Email</th>
                <th style={{ textAlign: "left", padding: 12 }}>Sent At</th>
                <th style={{ textAlign: "left", padding: 12 }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", color: "#888", padding: 24 }}>
                    No reminder logs found.
                  </td>
                </tr>
              ) : (
                logs.map((log, index) => (
                  <tr key={index} style={{ borderBottom: "1px solid #e5e7eb" }}>
                    <td style={{ padding: 12 }}>{log.policy_type}</td>
                    <td style={{ padding: 12 }}>{log.policy_id}</td>
                    <td style={{ padding: 12 }}>{log.email}</td>
                    <td style={{ padding: 12 }}>{new Date(log.sent_at).toLocaleString()}</td>
                    <td style={{ padding: 12 }}>
                      <span style={{
                        padding: "4px 8px",
                        borderRadius: 4,
                        backgroundColor: log.status === "success" ? "#dcfce7" : "#fee2e2",
                        color: log.status === "success" ? "#166534" : "#991b1b"
                      }}>
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default RenewalLog; 