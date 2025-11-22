import React, { useEffect, useState } from "react";
import { dscAPI, companyAPI } from "../../../services/api";
import "../../../styles/pages/dashboard/dsc/DSC.css";
import TableWithControl from "../../../components/common/Table/TableWithControl";
import Loader from "../../../components/common/Loader/Loader";

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

const DSCLogs = ({ searchQuery = "" }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [companyMap, setCompanyMap] = useState({});

  useEffect(() => {
    const fetchLogsAndCompanies = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await dscAPI.getLogs();
        console.log("DSC Logs API Response:", res);

        // Handle response structure: backend returns { success: true, logs: [...] }
        let logs = [];
        if (res && res.success && Array.isArray(res.logs)) {
          logs = res.logs;
        } else if (Array.isArray(res.logs)) {
          logs = res.logs;
        } else if (Array.isArray(res)) {
          logs = res;
        } else {
          console.error("Unexpected response structure:", res);
          setError("Invalid response format from server");
          return;
        }

        setLogs(logs);

        // Collect all unique company_ids from logs' details
        const companyIds = Array.from(
          new Set(
            logs
              .map((log) => {
                try {
                  // Handle both string and object details
                  const details =
                    typeof log.details === "string"
                      ? JSON.parse(log.details)
                      : log.details;
                  return (
                    details?.company_id || log.dsc?.company?.company_id || null
                  );
                } catch {
                  // If details parsing fails, try to get company_id from nested structure
                  return log.dsc?.company?.company_id || null;
                }
              })
              .filter((id) => id)
          )
        );

        if (companyIds.length > 0) {
          try {
            // Fetch all companies and build a map
            const allCompanies = await companyAPI.getAllCompanies();
            const companies = Array.isArray(allCompanies)
              ? allCompanies
              : allCompanies.data || [];
            const map = {};
            companies.forEach((company) => {
              if (company.company_id && company.company_name) {
                map[company.company_id] = company.company_name;
              }
            });
            setCompanyMap(map);
          } catch (companyErr) {
            console.error("Error fetching companies:", companyErr);
            // Don't fail the whole operation if companies fetch fails
          }
        }
      } catch (err) {
        console.error("Error fetching DSC logs:", err);
        const errorMessage =
          err?.response?.data?.message ||
          err?.message ||
          "Failed to fetch logs";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    fetchLogsAndCompanies();
  }, []);

  // Transform logs data to include all fields in a flat structure for table
  const transformedLogs = logs.map((log) => {
    // Try to get details from parsed JSON or use nested structure
    let details = {};
    try {
      if (log.details) {
        details =
          typeof log.details === "string"
            ? JSON.parse(log.details)
            : log.details;
      }
    } catch {}

    // Get data from details or nested DSC relationship
    const certificationName =
      details.certification_name || log.dsc?.certification_name || "-";
    const expiryDate = details.expiry_date || log.dsc?.expiry_date;
    const status = details.status || log.dsc?.status || "-";
    const remarks = details.remarks || log.dsc?.remarks || "-";
    const companyId =
      details.company_id || log.dsc?.company?.company_id || log.dsc?.company_id;
    const companyName = companyId
      ? companyMap[companyId] || log.dsc?.company?.company_name || companyId
      : "-";

    // Get user info
    const userInfo = log.user
      ? log.user.username || log.user.email || "-"
      : log.performed_by || "-";

    return {
      id: log.id,
      sr_no: 0, // Will be calculated in render
      timestamp: log.createdAt ? new Date(log.createdAt).toLocaleString() : "-",
      action: log.action || "-",
      performed_by: userInfo,
      certification_name: certificationName,
      expiry_date: expiryDate
        ? new Date(expiryDate).toLocaleDateString("en-GB")
        : "-",
      status: status && status !== "-" ? status.toUpperCase() : "-",
      remarks: remarks,
      company_name: companyName,
      // Keep original log for reference
      _original: log,
    };
  });

  // Filter logs by global search query if provided
  const filteredLogs =
    searchQuery && searchQuery.trim() !== ""
      ? transformedLogs.filter((log) => {
          const search = searchQuery.toLowerCase();
          return (
            log.certification_name.toLowerCase().includes(search) ||
            log.status.toLowerCase().includes(search) ||
            log.remarks.toLowerCase().includes(search) ||
            log.company_name.toLowerCase().includes(search) ||
            log.action.toLowerCase().includes(search) ||
            log.performed_by.toLowerCase().includes(search)
          );
        })
      : transformedLogs;

  // Define columns for the table
  const columns = [
    {
      key: "sr_no",
      label: "Sr No.",
      sortable: true,
      render: (_, __, index, pagination = {}) => {
        const { currentPage = 1, pageSize = 10 } = pagination;
        const serialNumber = (currentPage - 1) * pageSize + index + 1;
        return serialNumber;
      },
    },
    { key: "timestamp", label: "Timestamp", sortable: true },
    { key: "action", label: "Action", sortable: true },
    { key: "performed_by", label: "Performed By", sortable: true },
    { key: "certification_name", label: "Certification Name", sortable: true },
    { key: "expiry_date", label: "Expiry Date", sortable: true },
    { key: "status", label: "Status", sortable: true },
    { key: "remarks", label: "Remarks", sortable: true },
    { key: "company_name", label: "Company Name", sortable: true },
  ];

  return (
    <div className="dsc">
      <div className="dsc-content">
        <div className="dsc-header">
          <h1 className="dsc-title">DSC Logs</h1>
        </div>
        {error && <div className="dsc-error">{error}</div>}
        {loading ? (
          <Loader size="large" color="primary" />
        ) : (
          <TableWithControl
            data={filteredLogs}
            columns={columns}
            defaultPageSize={10}
            pageSizeOptions={PAGE_SIZE_OPTIONS}
            serverSidePagination={false}
          />
        )}
      </div>
    </div>
  );
};

export default DSCLogs;
