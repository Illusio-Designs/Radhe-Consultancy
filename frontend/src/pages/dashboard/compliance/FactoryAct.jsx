import React from "react";
import "../../../styles/pages/dashboard/compliance/Compliance.css";
import { toast } from "react-toastify";

const FactoryAct = () => {
  return (
    <div className="compliance-container">
      <h1 className="compliance-title">Factory Act License</h1>
      {/* Example usage after a successful compliance action: */}
      {/* toast.success("Compliance action completed successfully!"); */}
      {/* Example usage for error: */}
      {/* toast.error("An error occurred. Please try again."); */}
    </div>
  );
};

export default FactoryAct;
