import React, { useEffect, useState } from "react";
import { renewalAPI } from "../../../services/api";
import Loader from "../../../components/common/Loader/Loader";
import "../../../styles/pages/dashboard/home/CombinedDashboard.css";

const categories = [
  { label: "Insurance", active: true },
  { label: "Compliance & licensing" },
  { label: "DSC" },
  { label: "Labour" },
];

const types = ["ECP", "Health", "Fire", "Vehicles"];
const periods = ["week", "month", "year"];

const RenewalManager = () => {
  const [counts, setCounts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("Insurance");

  useEffect(() => {
    const fetchCounts = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await renewalAPI.getCounts();
        setCounts(response.data);
      } catch (err) {
        setError("Failed to fetch renewal counts");
        console.error("Error fetching counts:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCounts();
  }, []);

  const getTotalCount = (period) => {
    if (!counts) return 0;
    if (selectedCategory === "DSC") {
      return counts[period]?.dsc || 0;
    }
    return types.reduce((sum, type) => {
      const typeLower = type.toLowerCase();
      return sum + (counts[period]?.[typeLower] || 0);
    }, 0);
  };

  // Render content based on selected category
  let content = null;
  if (selectedCategory === "Insurance") {
    content = (
      <>
        <div style={{ display: "flex", fontWeight: 600, fontSize: 20, marginBottom: 24 }}>
          <div style={{ flex: 2 }}>Policy Type</div>
          <div style={{ flex: 1, textAlign: "center" }}>Week ({getTotalCount("week")})</div>
          <div style={{ flex: 1, textAlign: "center" }}>Month ({getTotalCount("month")})</div>
          <div style={{ flex: 1, textAlign: "center" }}>Year ({getTotalCount("year")})</div>
        </div>
        {loading ? (
          <Loader />
        ) : error ? (
          <div style={{ color: "red", textAlign: "center" }}>{error}</div>
        ) : (
          types.map((type, idx) => (
            <div 
              key={type} 
              style={{ 
                display: "flex", 
                alignItems: "center", 
                borderBottom: idx < types.length - 1 ? "1px solid #e5e7eb" : "none", 
                padding: "16px 0",
                transition: "background-color 0.2s",
                ":hover": {
                  backgroundColor: "#f9fafb"
                }
              }}
            >
              <div style={{ flex: 2, fontWeight: 500, fontSize: 18 }}>{type}</div>
              <div style={{ flex: 1, textAlign: "center", fontSize: 18 }}>
                <span style={{
                  padding: "4px 8px",
                  borderRadius: 4,
                  backgroundColor: (counts?.week?.[type.toLowerCase()] > 0) ? "#fee2e2" : "#f3f4f6",
                  color: (counts?.week?.[type.toLowerCase()] > 0) ? "#991b1b" : "#6b7280"
                }}>
                  {counts?.week?.[type.toLowerCase()] ?? 0}
                </span>
              </div>
              <div style={{ flex: 1, textAlign: "center", fontSize: 18 }}>
                <span style={{
                  padding: "4px 8px",
                  borderRadius: 4,
                  backgroundColor: (counts?.month?.[type.toLowerCase()] > 0) ? "#fef3c7" : "#f3f4f6",
                  color: (counts?.month?.[type.toLowerCase()] > 0) ? "#92400e" : "#6b7280"
                }}>
                  {counts?.month?.[type.toLowerCase()] ?? 0}
                </span>
              </div>
              <div style={{ flex: 1, textAlign: "center", fontSize: 18 }}>
                <span style={{
                  padding: "4px 8px",
                  borderRadius: 4,
                  backgroundColor: (counts?.year?.[type.toLowerCase()] > 0) ? "#dcfce7" : "#f3f4f6",
                  color: (counts?.year?.[type.toLowerCase()] > 0) ? "#166534" : "#6b7280"
                }}>
                  {counts?.year?.[type.toLowerCase()] ?? 0}
                </span>
              </div>
            </div>
          ))
        )}
      </>
    );
  } else if (selectedCategory === "Compliance & licensing") {
    content = (
      <div style={{ textAlign: "center", fontSize: 20, color: "#92400e", padding: 40 }}>
        Pending compliance & licensing work will be displayed here.
      </div>
    );
  } else if (selectedCategory === "DSC") {
    content = (
      <>
        <div style={{ display: "flex", fontWeight: 600, fontSize: 20, marginBottom: 24 }}>
          <div style={{ flex: 2 }}>DSC</div>
          <div style={{ flex: 1, textAlign: "center" }}>Week ({getTotalCount("week")})</div>
          <div style={{ flex: 1, textAlign: "center" }}>Month ({getTotalCount("month")})</div>
          <div style={{ flex: 1, textAlign: "center" }}>Year ({getTotalCount("year")})</div>
        </div>
        {loading ? (
          <Loader />
        ) : error ? (
          <div style={{ color: "red", textAlign: "center" }}>{error}</div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", padding: "16px 0" }}>
            <div style={{ flex: 2, fontWeight: 500, fontSize: 18 }}>DSC</div>
            <div style={{ flex: 1, textAlign: "center", fontSize: 18 }}>
              <span style={{
                padding: "4px 8px",
                borderRadius: 4,
                backgroundColor: counts?.week?.dsc > 0 ? "#fee2e2" : "#f3f4f6",
                color: counts?.week?.dsc > 0 ? "#991b1b" : "#6b7280"
              }}>
                {counts?.week?.dsc ?? 0}
              </span>
            </div>
            <div style={{ flex: 1, textAlign: "center", fontSize: 18 }}>
              <span style={{
                padding: "4px 8px",
                borderRadius: 4,
                backgroundColor: counts?.month?.dsc > 0 ? "#fef3c7" : "#f3f4f6",
                color: counts?.month?.dsc > 0 ? "#92400e" : "#6b7280"
              }}>
                {counts?.month?.dsc ?? 0}
              </span>
            </div>
            <div style={{ flex: 1, textAlign: "center", fontSize: 18 }}>
              <span style={{
                padding: "4px 8px",
                borderRadius: 4,
                backgroundColor: counts?.year?.dsc > 0 ? "#dcfce7" : "#f3f4f6",
                color: counts?.year?.dsc > 0 ? "#166534" : "#6b7280"
              }}>
                {counts?.year?.dsc ?? 0}
              </span>
            </div>
          </div>
        )}
      </>
    );
  } else if (selectedCategory === "Labour") {
    content = (
      <div style={{ textAlign: "center", fontSize: 20, color: "#92400e", padding: 40 }}>
        Pending labour work will be displayed here.
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div style={{ display: "flex", gap: 16, marginBottom: 32 }}>
        {categories.map((cat) => (
          <div
            key={cat.label}
            onClick={() => setSelectedCategory(cat.label)}
            style={{
              flex: 1,
              background: selectedCategory === cat.label ? "#fff" : "#e5e7eb",
              color: "#222",
              borderRadius: 12,
              padding: "32px 0",
              textAlign: "center",
              fontWeight: 600,
              fontSize: 24,
              boxShadow: selectedCategory === cat.label ? "0 2px 8px rgba(0,0,0,0.04)" : "none",
              border: selectedCategory === cat.label ? "2px solid #d1d5db" : "none",
              transition: "all 0.2s",
              cursor: "pointer"
            }}
          >
            {cat.label}
          </div>
        ))}
      </div>
      <div style={{ background: "#fff", borderRadius: 16, padding: 32, boxShadow: "0 2px 8px rgba(0,0,0,0.04)", minHeight: 400 }}>
        {content}
      </div>
    </div>
  );
};

export default RenewalManager; 