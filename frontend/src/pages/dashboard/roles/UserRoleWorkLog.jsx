import React, { useEffect, useState } from 'react';
import { userRoleWorkLogAPI, consumerAPI } from '../../../services/api';
import '../../../styles/pages/dashboard/dsc/DSC.css';
import Pagination from '../../../components/common/Pagination/Pagination';
import { Tooltip } from 'react-tooltip';
import SearchBar from '../../../components/common/SearchBar/SearchBar';

// Format action name for display (simplified version)
const formatAction = (action) => {
  if (!action) return '-';
  return action
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Get details for display
const getDetails = (details) => {
  if (!details) return '-';
  try {
    const parsedDetails = JSON.parse(details);
    // Try top-level first
    let name = parsedDetails.company_name || parsedDetails.proposer_name || parsedDetails.username;
    // If not found, try inside 'changes'
    if (!name && parsedDetails.changes) {
      name = parsedDetails.changes.company_name || parsedDetails.changes.proposer_name || parsedDetails.changes.username;
    }
    // No additional info (no email, no policy number)
    return name ? name : '-';
  } catch (e) {
    return '-';
  }
};

// Get tooltip content (no email, no policy number)
const getTooltipContent = (details) => {
  if (!details) return '';
  try {
    const parsedDetails = JSON.parse(details);
    const relevantDetails = [];
    if (parsedDetails.customer_type) {
      relevantDetails.push(`Customer Type: ${parsedDetails.customer_type}`);
    }
    // Add user/company details if present (no email, no policy number)
    if (parsedDetails.changes) {
      if (parsedDetails.changes.mobile_number) {
        relevantDetails.push(`Mobile: ${parsedDetails.changes.mobile_number}`);
      }
    }
    return relevantDetails.join('\n');
  } catch (e) {
    return details;
  }
};

const UserRoleWorkLog = ({ searchQuery = '' }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  // Add a cache for consumer names
  const [consumerNameCache, setConsumerNameCache] = useState({});
  // Track loading consumer names
  const [loadingConsumerIds, setLoadingConsumerIds] = useState([]);

  // Helper to get details (company/consumer/proposer/username)
  const getDetailsDisplay = (log) => {
    if (!log.details) return '-';
    let parsedDetails;
    try {
      parsedDetails = JSON.parse(log.details);
    } catch {
      return '-';
    }
    // Company name direct
    if (parsedDetails.company_name) return parsedDetails.company_name;
    // If consumer_id present, always prefer consumer name over proposer_name
    const consumerId = parsedDetails.consumer_id || (parsedDetails.changes && parsedDetails.changes.consumer_id);
    if (consumerId) {
      if (consumerNameCache[consumerId]) {
        return consumerNameCache[consumerId];
      } else if (loadingConsumerIds.includes(consumerId)) {
        return 'Loading...';
      } else {
        // Trigger fetch
        fetchConsumerName(consumerId);
        return 'Loading...';
      }
    }
    // If proposer_name or username present (only if no company and no consumer)
    if (parsedDetails.proposer_name) return parsedDetails.proposer_name;
    if (parsedDetails.username) return parsedDetails.username;
    if (parsedDetails.changes) {
      if (parsedDetails.changes.proposer_name) return parsedDetails.changes.proposer_name;
      if (parsedDetails.changes.username) return parsedDetails.changes.username;
    }
    return '-';
  };

  // Fetch and cache consumer name
  const fetchConsumerName = async (consumerId) => {
    setLoadingConsumerIds((prev) => [...prev, consumerId]);
    try {
      const consumer = await consumerAPI.getConsumerById(consumerId);
      const name = consumer.consumer_name || consumer.name || consumer.username || '-';
      setConsumerNameCache((prev) => ({ ...prev, [consumerId]: name }));
    } catch {
      setConsumerNameCache((prev) => ({ ...prev, [consumerId]: '-' }));
    } finally {
      setLoadingConsumerIds((prev) => prev.filter((id) => id !== consumerId));
    }
  };

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await userRoleWorkLogAPI.getAllLogs();
        setLogs(data);
      } catch (err) {
        setError('Failed to fetch logs');
        console.error('Error fetching logs:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  // Filter logs by search query
  const filteredLogs = logs.filter((log) => {
    const search = (searchQuery || '').toLowerCase();
    return (
      (log.actor?.username || '').toLowerCase().includes(search) ||
      (log.action || '').toLowerCase().includes(search) ||
      (log.details || '').toLowerCase().includes(search)
    );
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredLogs.length / pageSize);
  const paginatedLogs = filteredLogs.slice((page - 1) * pageSize, page * pageSize);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) setPage(newPage);
  };

  const handlePageSizeChange = (newPageSize) => {
    setPageSize(Number(newPageSize));
    setPage(1);
  };

  useEffect(() => {
    setPage(1);
  }, [searchQuery]);

  return (
    <div className="dsc">
      <div className="dsc-content">
        <div className="dsc-header">
          <h1 className="dsc-title">User Role Work Log</h1>
        </div>
        {loading ? (
          <div className="dsc-loading">Loading...</div>
        ) : error ? (
          <div className="dsc-error">{error}</div>
        ) : filteredLogs.length === 0 ? (
          <div className="dsc-empty">No logs found.</div>
        ) : (
          <>
            <div className="table-responsive">
              <table className="dsc-table">
                <thead>
                  <tr>
                    <th>Sr No.</th>
                    <th>Performed By</th>
                    <th>Timestamp</th>
                    <th>Action</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedLogs.map((log, idx) => (
                    <tr key={log.id}>
                      <td>{(page - 1) * pageSize + idx + 1}</td>
                      <td>{log.actor ? log.actor.username : '-'}</td>
                      <td>{new Date(log.created_at).toLocaleString()}</td>
                      <td>{formatAction(log.action)}</td>
                      <td>
                        <span
                          data-tooltip-id={`log-${log.id}`}
                          data-tooltip-content={getTooltipContent(log.details)}
                          style={{ color: 'inherit', textDecoration: 'none', cursor: 'pointer' }}
                        >
                          {getDetailsDisplay(log)}
                        </span>
                        <Tooltip id={`log-${log.id}`} place="top" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              pageSize={pageSize}
              totalItems={filteredLogs.length}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              pageSizeOptions={[10, 20, 50, 100]}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default UserRoleWorkLog; 