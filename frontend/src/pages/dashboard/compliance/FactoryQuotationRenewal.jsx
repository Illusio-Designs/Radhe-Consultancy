import React, { useEffect, useState } from "react";
import { factoryQuotationAPI } from "../../../services/api";
import Loader from "../../../components/common/Loader/Loader";
import TableWithControl from "../../../components/common/Table/TableWithControl";
import { toast } from "react-toastify";
import { BiErrorCircle } from "react-icons/bi";
import "../../../styles/pages/dashboard/home/CombinedDashboard.css";

const FactoryQuotationRenewal = () => {
  const [renewals, setRenewals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRenewals();
  }, []);

  const fetchRenewals = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await factoryQuotationAPI.getAllQuotations();
      const renewalQuotations = response.data.filter(quotation => 
        quotation.status === 'renewal'
      );
      setRenewals(renewalQuotations);
    } catch (err) {
      setError("Failed to fetch renewals");
      setRenewals([]);
      toast.error("Failed to fetch renewals");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB");
  };

  const columns = [
    {
      key: "sr_no",
      label: "Sr No.",
      sortable: true,
      render: (_, __, index) => index + 1,
    },
    {
      key: "companyName",
      label: "Company Name",
      sortable: true,
      render: (_, quotation) => quotation.companyName || "-",
    },
    {
      key: "companyCode",
      label: "Company Code",
      sortable: true,
      render: (_, quotation) => {
        // Try to get company code from linked company
        if (quotation.company && quotation.company.company_code) {
          return quotation.company.company_code;
        }
        return "-";
      },
    },
    {
      key: "companyAddress",
      label: "Address",
      sortable: true,
      render: (_, quotation) => quotation.companyAddress || "-",
    },
    {
      key: "contact",
      label: "Contact Details",
      sortable: true,
      render: (_, quotation) => (
        <div>
          <div>{quotation.phone || "-"}</div>
          <div className="text-sm text-gray-600">{quotation.email || "-"}</div>
        </div>
      ),
    },
    {
      key: "totalAmount",
      label: "Original Amount",
      sortable: true,
      render: (_, quotation) => `₹${quotation.totalAmount?.toLocaleString() || "0"}`,
    },
    {
      key: "renewalDate",
      label: "Renewal Created",
      sortable: true,
      render: (_, quotation) => {
        // Try to get the most appropriate date
        const renewalDate = quotation.renewal_date || quotation.renewalDate || quotation.created_at;
        return formatDate(renewalDate);
      },
    },
  ];

  return (
    <div className="dsc">
      <div className="dsc-content">
        <div className="dsc-header">
          <h1 className="dsc-title">Factory Quotation Renewals</h1>
        </div>

        {error && (
          <div className="dsc-error">
            <BiErrorCircle className="inline mr-2" /> {error}
          </div>
        )}

        {loading ? (
          <Loader size="large" color="primary" />
        ) : (
          <TableWithControl
            data={renewals}
            columns={columns}
            defaultPageSize={10}
          />
        )}
      </div>
    </div>
  );
};

export default FactoryQuotationRenewal; 