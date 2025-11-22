import React, { useEffect, useState, useMemo, useCallback, memo } from "react";
import { factoryQuotationAPI } from "../../../services/api";
import Loader from "../../../components/common/Loader/Loader";
import TableWithControl from "../../../components/common/Table/TableWithControl";
import { toast } from "react-toastify";
import { BiErrorCircle, BiDownload } from "react-icons/bi";
import "../../../styles/pages/dashboard/home/CombinedDashboard.css";

const FactoryQuotationRenewal = memo(() => {
  const [renewals, setRenewals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 10,
    totalPages: 1,
    totalItems: 0,
  });

  const fetchRenewals = useCallback(async (page = 1, pageSize = 10) => {
    setLoading(true);
    setError(null);
    try {
      const response = await factoryQuotationAPI.getAllQuotations({ page, pageSize, status: 'renewal' });
      if (response && response.quotations && Array.isArray(response.quotations)) {
        setRenewals(response.quotations);
        setPagination({
          currentPage: response.currentPage || page,
          pageSize: response.pageSize || pageSize,
          totalPages: response.totalPages || 1,
          totalItems: response.totalItems || 0,
        });
      } else if (response.data && Array.isArray(response.data)) {
        const renewalQuotations = response.data.filter(quotation => quotation.status === 'renewal');
        setRenewals(renewalQuotations);
        setPagination((prev) => ({ ...prev, currentPage: page }));
      } else {
        setRenewals([]);
      }
    } catch (err) {
      setError("Failed to fetch renewals");
      setRenewals([]);
      toast.error("Failed to fetch renewals");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRenewals(1, 10);
  }, [fetchRenewals]);

  const handlePageChange = async (page) => {
    await fetchRenewals(page, pagination.pageSize);
  };

  const handlePageSizeChange = async (newPageSize) => {
    setPagination((prev) => ({
      ...prev,
      currentPage: 1,
      pageSize: newPageSize,
    }));
    await fetchRenewals(1, newPageSize);
  };

  const formatDate = useCallback((dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB");
  }, []);

  // Handle PDF download for factory quotation
  const handleDownloadPDF = useCallback(async (quotation) => {
    try {
      const response = await factoryQuotationAPI.downloadPDF(quotation.id);
      
      // Create blob and download
      const blob = new Blob([response], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `factory-quotation-${quotation.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Factory quotation PDF downloaded successfully');
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast.error('Failed to download factory quotation PDF');
    }
  }, []);

  // Memoize columns to prevent recreation on every render
  const columns = useMemo(() => [
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
    {
      key: "actions",
      label: "Actions",
      sortable: false,
      render: (_, quotation) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleDownloadPDF(quotation)}
            className="action-button action-button-secondary action-button-small"
            title="Download Factory Quotation PDF"
          >
            <BiDownload className="download-icon" />
          </button>
        </div>
      ),
    },
  ], [formatDate, handleDownloadPDF]);

  return (
    <div className="insurance">
      <div className="insurance-container">
        <div className="insurance-content">
          <div className="insurance-header">
            <h1 className="insurance-title">Factory Quotation Renewals</h1>
          </div>

          {error && (
            <div className="insurance-error">
              <BiErrorCircle className="inline mr-2" /> {error}
            </div>
          )}

        {loading ? (
          <Loader size="large" color="primary" />
        ) : (
          <TableWithControl
            data={renewals}
            columns={columns}
            defaultPageSize={pagination.pageSize}
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            totalItems={pagination.totalItems}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            serverSidePagination={true}
          />
        )}
        </div>
      </div>
    </div>
  );
});

FactoryQuotationRenewal.displayName = 'FactoryQuotationRenewal';

export default FactoryQuotationRenewal; 
