import React, { useEffect, useState, useMemo, useCallback, memo } from "react";
import { factoryQuotationAPI } from "../../../services/api";
import Loader from "../../../components/common/Loader/Loader";
import TableWithControl from "../../../components/common/Table/TableWithControl";
import { toast } from "react-toastify";
import { BiErrorCircle, BiShow } from "react-icons/bi";
import "../../../styles/pages/dashboard/home/CombinedDashboard.css";
import DocumentDownload from "../../../components/common/DocumentDownload/DocumentDownload";
import Modal from "../../../components/common/Modal/Modal";
import ActionButton from "../../../components/common/ActionButton/ActionButton";
import "../../../styles/pages/dashboard/compliance/Compliance.css";

// View Quotation Modal Component
const ViewQuotationModal = ({ isOpen, onClose, quotation }) => {
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB");
  };

  if (!quotation) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Factory Quotation Details">
      <div className="insurance-form">
        <div className="insurance-form-grid">
          <div className="insurance-form-group">
            <label
              style={{
                fontWeight: 500,
                marginBottom: "0.5rem",
                display: "block",
              }}
            >
              Company Name
            </label>
            <div className="view-field">{quotation.companyName || "-"}</div>
          </div>

          <div className="insurance-form-group">
            <label
              style={{
                fontWeight: 500,
                marginBottom: "0.5rem",
                display: "block",
              }}
            >
              Company Code
            </label>
            <div className="view-field">
              {quotation.company?.company_code || "-"}
            </div>
          </div>

          <div
            className="insurance-form-group"
            style={{ gridColumn: "span 2" }}
          >
            <label
              style={{
                fontWeight: 500,
                marginBottom: "0.5rem",
                display: "block",
              }}
            >
              Company Address
            </label>
            <div className="view-field" style={{ whiteSpace: "pre-line" }}>
              {quotation.companyAddress || "-"}
            </div>
          </div>

          <div className="insurance-form-group">
            <label
              style={{
                fontWeight: 500,
                marginBottom: "0.5rem",
                display: "block",
              }}
            >
              Phone Number
            </label>
            <div className="view-field">{quotation.phone || "-"}</div>
          </div>

          <div className="insurance-form-group">
            <label
              style={{
                fontWeight: 500,
                marginBottom: "0.5rem",
                display: "block",
              }}
            >
              Email
            </label>
            <div className="view-field">{quotation.email || "-"}</div>
          </div>

          <div className="insurance-form-group">
            <label
              style={{
                fontWeight: 500,
                marginBottom: "0.5rem",
                display: "block",
              }}
            >
              Number of Workers
            </label>
            <div className="view-field">{quotation.noOfWorkers || "-"}</div>
          </div>

          <div className="insurance-form-group">
            <label
              style={{
                fontWeight: 500,
                marginBottom: "0.5rem",
                display: "block",
              }}
            >
              Horse Power
            </label>
            <div className="view-field">{quotation.horsePower || "-"}</div>
          </div>

          <div className="insurance-form-group">
            <label
              style={{
                fontWeight: 500,
                marginBottom: "0.5rem",
                display: "block",
              }}
            >
              Calculated Amount
            </label>
            <div className="view-field">
              ₹{quotation.calculatedAmount?.toLocaleString() || "0"}
            </div>
          </div>

          <div className="insurance-form-group">
            <label
              style={{
                fontWeight: 500,
                marginBottom: "0.5rem",
                display: "block",
              }}
            >
              Year
            </label>
            <div className="view-field">
              {quotation.year || 1} year{quotation.year > 1 ? "s" : ""}
            </div>
          </div>

          <div className="insurance-form-group">
            <label
              style={{
                fontWeight: 500,
                marginBottom: "0.5rem",
                display: "block",
              }}
            >
              Stability Certificate Type
            </label>
            <div className="view-field">
              {quotation.stabilityCertificateType === "with load"
                ? "With Load"
                : quotation.stabilityCertificateType === "without load"
                ? "Without Load"
                : quotation.stabilityCertificateType || "-"}
            </div>
          </div>

          <div className="insurance-form-group">
            <label
              style={{
                fontWeight: 500,
                marginBottom: "0.5rem",
                display: "block",
              }}
            >
              Stability Certificate Amount
            </label>
            <div className="view-field">
              ₹{quotation.stabilityCertificateAmount?.toLocaleString() || "0"}
            </div>
          </div>

          <div className="insurance-form-group">
            <label
              style={{
                fontWeight: 500,
                marginBottom: "0.5rem",
                display: "block",
              }}
            >
              Administration Charge
            </label>
            <div className="view-field">
              ₹{quotation.administrationCharge?.toLocaleString() || "0"}
            </div>
          </div>

          <div className="insurance-form-group">
            <label
              style={{
                fontWeight: 500,
                marginBottom: "0.5rem",
                display: "block",
              }}
            >
              Consultancy Fees
            </label>
            <div className="view-field">
              ₹{quotation.consultancyFees?.toLocaleString() || "0"}
            </div>
          </div>

          <div className="insurance-form-group">
            <label
              style={{
                fontWeight: 500,
                marginBottom: "0.5rem",
                display: "block",
              }}
            >
              Plan Charge
            </label>
            <div className="view-field">
              ₹{quotation.planCharge?.toLocaleString() || "0"}
            </div>
          </div>

          <div className="insurance-form-group">
            <label
              style={{
                fontWeight: 500,
                marginBottom: "0.5rem",
                display: "block",
              }}
            >
              Total Amount
            </label>
            <div
              className="view-field"
              style={{ fontWeight: "bold", fontSize: "1.1em" }}
            >
              ₹{quotation.totalAmount?.toLocaleString() || "0"}
            </div>
          </div>

          <div className="insurance-form-group">
            <label
              style={{
                fontWeight: 500,
                marginBottom: "0.5rem",
                display: "block",
              }}
            >
              Status
            </label>
            <div className="view-field">
              <span
                className={`status-badge ${
                  quotation.status === "approved"
                    ? "status-badge-approved"
                    : quotation.status === "maked"
                    ? "status-badge-maked"
                    : quotation.status === "plan"
                    ? "status-badge-plan"
                    : quotation.status === "stability"
                    ? "status-badge-stability"
                    : quotation.status === "application"
                    ? "status-badge-application"
                    : quotation.status === "renewal"
                    ? "status-badge-renewal"
                    : "status-badge-maked"
                }`}
              >
                {quotation.status?.charAt(0).toUpperCase() +
                  quotation.status?.slice(1) || "-"}
              </span>
            </div>
          </div>

          <div className="insurance-form-group">
            <label
              style={{
                fontWeight: 500,
                marginBottom: "0.5rem",
                display: "block",
              }}
            >
              Created At
            </label>
            <div className="view-field">{formatDate(quotation.created_at)}</div>
          </div>

          <div className="insurance-form-group">
            <label
              style={{
                fontWeight: 500,
                marginBottom: "0.5rem",
                display: "block",
              }}
            >
              Renewal Date
            </label>
            <div className="view-field">
              {formatDate(quotation.renewal_date || quotation.renewalDate)}
            </div>
          </div>
        </div>

        <div className="insurance-form-actions">
          <button type="button" className="btn btn-outlined" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};

const FactoryQuotationRenewal = memo(() => {
  const [renewals, setRenewals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState(null);
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
      const response = await factoryQuotationAPI.getAllQuotations({
        page,
        pageSize,
        status: "renewal",
      });
      if (
        response &&
        response.quotations &&
        Array.isArray(response.quotations)
      ) {
        setRenewals(response.quotations);
        setPagination({
          currentPage: response.currentPage || page,
          pageSize: response.pageSize || pageSize,
          totalPages: response.totalPages || 1,
          totalItems: response.totalItems || 0,
        });
      } else if (response.data && Array.isArray(response.data)) {
        const renewalQuotations = response.data.filter(
          (quotation) => quotation.status === "renewal"
        );
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

  // Memoize handleDownloadDocuments
  const handleDownloadDocuments = useCallback((quotation) => {
    setSelectedQuotation(quotation);
    setShowDocumentModal(true);
  }, []);

  // Handle view quotation
  const handleViewQuotation = useCallback((quotation) => {
    setSelectedQuotation(quotation);
    setShowViewModal(true);
  }, []);

  // Memoize columns to prevent recreation on every render
  const columns = useMemo(
    () => [
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
            <div className="text-sm text-gray-600">
              {quotation.email || "-"}
            </div>
          </div>
        ),
      },
      {
        key: "totalAmount",
        label: "Original Amount",
        sortable: true,
        render: (_, quotation) =>
          `₹${quotation.totalAmount?.toLocaleString() || "0"}`,
      },
      {
        key: "renewalDate",
        label: "Renewal Created",
        sortable: true,
        render: (_, quotation) => {
          // Try to get the most appropriate date
          const renewalDate =
            quotation.renewal_date ||
            quotation.renewalDate ||
            quotation.created_at;
          return formatDate(renewalDate);
        },
      },
      {
        key: "actions",
        label: "Actions",
        sortable: false,
        render: (_, quotation) => (
          <div className="flex items-center gap-2">
            <ActionButton
              onClick={() => handleViewQuotation(quotation)}
              variant="secondary"
              size="small"
              title="View Quotation Details"
            >
              <BiShow />
            </ActionButton>
            <DocumentDownload
              system="renewal-status"
              recordId={quotation.id}
              buttonText=""
              buttonClass="action-button action-button-secondary action-button-small"
              showIcon={true}
              filePath={
                quotation.upload_option
                  ? `/uploads/renewal_status/${quotation.upload_option}`
                  : null
              }
              fileName={quotation.upload_option || "renewal-document.pdf"}
            />
          </div>
        ),
      },
    ],
    [formatDate, handleViewQuotation]
  );

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

        {/* Document Download Modal */}
        {showDocumentModal && selectedQuotation && (
          <DocumentDownload
            isOpen={showDocumentModal}
            onClose={() => setShowDocumentModal(false)}
            system="renewal-status"
            recordId={selectedQuotation.id}
            recordName={
              selectedQuotation.companyName ||
              selectedQuotation.company?.company_name
            }
          />
        )}

        {/* View Quotation Modal */}
        <ViewQuotationModal
          isOpen={showViewModal}
          onClose={() => {
            setShowViewModal(false);
            setSelectedQuotation(null);
          }}
          quotation={selectedQuotation}
        />
      </div>
    </div>
  );
});

FactoryQuotationRenewal.displayName = "FactoryQuotationRenewal";

export default FactoryQuotationRenewal;
