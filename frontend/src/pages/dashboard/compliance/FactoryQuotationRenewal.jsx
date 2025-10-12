import React, { useEffect, useState, useMemo, useCallback, memo } from "react";
import { factoryQuotationAPI } from "../../../services/api";
import Loader from "../../../components/common/Loader/Loader";
import TableWithControl from "../../../components/common/Table/TableWithControl";
import { toast } from "react-toastify";
import { BiErrorCircle } from "react-icons/bi";
import "../../../styles/pages/dashboard/home/CombinedDashboard.css";
import DocumentDownload from "../../../components/common/DocumentDownload/DocumentDownload";

const FactoryQuotationRenewal = memo(() => {
  const [renewals, setRenewals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState(null);

  // Memoize fetchRenewals to prevent recreation on every render
  const fetchRenewals = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    fetchRenewals();
  }, [fetchRenewals]);

  // Memoize formatDate function
  const formatDate = useCallback((dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB");
  }, []);

  // Memoize handleDownloadDocuments
  const handleDownloadDocuments = useCallback((quotation) => {
    setSelectedQuotation(quotation);
    setShowDocumentModal(true);
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
          <DocumentDownload
            system="renewal-status"
            recordId={quotation.id}
            buttonText=""
            buttonClass="action-button action-button-secondary action-button-small"
            showIcon={true}
            filePath={quotation.upload_option ? `/uploads/renewal_status/${quotation.upload_option}` : null}
            fileName={quotation.upload_option || 'renewal-document.pdf'}
          />
        </div>
      ),
    },
  ], [formatDate]);

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
              defaultPageSize={10}
            />
          )}
        </div>

        {/* Document Download Modal */}
        {showDocumentModal && selectedQuotation && (
          <DocumentDownload
            isOpen={showDocumentModal}
            onClose={() => setShowDocumentModal(false)}
            system="renewal-status"
            recordId={selectedQuotation.id}
            recordName={selectedQuotation.companyName || selectedQuotation.company?.company_name}
          />
        )}
      </div>
    </div>
  );
});

FactoryQuotationRenewal.displayName = 'FactoryQuotationRenewal';

export default FactoryQuotationRenewal; 
