import React, { useState, useEffect, useCallback, useRef } from 'react';
import { userRoleWorkLogAPI } from '../../../services/api';
import { consumerAPI } from '../../../services/api';
import { companyAPI } from '../../../services/api';
import Loader from '../../../components/common/Loader/Loader';
import Table from '../../../components/common/Table/Table';
import SearchBar from '../../../components/common/SearchBar/SearchBar';
import Pagination from '../../../components/common/Pagination/Pagination';

const UserRoleWorkLog = ({ searchQuery }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pageSize] = useState(10);
  
  // Ref to prevent multiple simultaneous fetches
  const fetchingRef = useRef(false);
  
  // Caching states for company and consumer names
  const [companyNameCache, setCompanyNameCache] = useState({});
  const [consumerNameCache, setConsumerNameCache] = useState({});
  const [loadingCompanyIds, setLoadingCompanyIds] = useState([]);
  const [loadingConsumerIds, setLoadingConsumerIds] = useState([]);

  // Fetch company name by ID
  const fetchCompanyName = async (companyId) => {
    if (loadingCompanyIds.includes(companyId)) return;
    
    setLoadingCompanyIds(prev => [...prev, companyId]);
    try {
      const response = await companyAPI.getCompanyById(companyId);
      if (response.success && response.data) {
        setCompanyNameCache(prev => ({
          ...prev,
          [companyId]: response.data.company_name || '-'
        }));
      } else {
        setCompanyNameCache(prev => ({
          ...prev,
          [companyId]: '-'
        }));
      }
    } catch (error) {
      console.error('Error fetching company name:', error);
      setCompanyNameCache(prev => ({
        ...prev,
        [companyId]: '-'
      }));
    } finally {
      setLoadingCompanyIds(prev => prev.filter(id => id !== companyId));
    }
  };

  // Fetch consumer name by ID
  const fetchConsumerName = async (consumerId) => {
    if (loadingConsumerIds.includes(consumerId)) return;
    
    setLoadingConsumerIds(prev => [...prev, consumerId]);
    try {
      const response = await consumerAPI.getConsumerById(consumerId);
      if (response.success && response.data) {
        setConsumerNameCache(prev => ({
          ...prev,
          [consumerId]: response.data.consumer_name || '-'
        }));
      } else {
        setConsumerNameCache(prev => ({
          ...prev,
          [consumerId]: '-'
        }));
      }
    } catch (error) {
      console.error('Error fetching consumer name:', error);
      setConsumerNameCache(prev => ({
        ...prev,
        [consumerId]: '-'
      }));
    } finally {
      setLoadingConsumerIds(prev => prev.filter(id => id !== consumerId));
    }
  };

  // Fetch company and consumer names when logs change
  useEffect(() => {
    const companyIdsToFetch = [];
    const consumerIdsToFetch = [];
    
    logs.forEach(log => {
      if (!log.details) return;
      
      try {
        const parsedDetails = JSON.parse(log.details);
        const companyId = parsedDetails.company_id || (parsedDetails.changes && parsedDetails.changes.company_id);
        const consumerId = parsedDetails.consumer_id || (parsedDetails.changes && parsedDetails.changes.consumer_id);
        
        if (companyId && companyNameCache[companyId] === undefined && !loadingCompanyIds.includes(companyId)) {
          companyIdsToFetch.push(companyId);
        }
        
        if (consumerId && consumerNameCache[consumerId] === undefined && !loadingConsumerIds.includes(consumerId)) {
          consumerIdsToFetch.push(consumerId);
        }
      } catch {
        // Ignore parse errors
      }
    });
    
    // Fetch company names
    companyIdsToFetch.forEach(companyId => {
      fetchCompanyName(companyId);
    });
    
    // Fetch consumer names
    consumerIdsToFetch.forEach(consumerId => {
      fetchConsumerName(consumerId);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logs]);

  // Get details display with priority: company_name -> consumer_name -> proposer_name -> username -> '-'
  const getDetailsDisplay = (log) => {
    if (!log || !log.details) return '-';
    
    let parsedDetails;
    try {
      parsedDetails = JSON.parse(log.details);
    } catch {
      return '-';
    }

    // 1. Company name by company_id
    const companyId = parsedDetails.company_id || (parsedDetails.changes && parsedDetails.changes.company_id);
    if (companyId) {
      if (companyNameCache[companyId] !== undefined) {
        return companyNameCache[companyId];
      } else {
        return 'Loading...';
      }
    }

    // 2. Consumer name by consumer_id
    const consumerId = parsedDetails.consumer_id || (parsedDetails.changes && parsedDetails.changes.consumer_id);
    if (consumerId) {
      if (consumerNameCache[consumerId] !== undefined) {
        return consumerNameCache[consumerId];
      } else {
        return 'Loading...';
      }
    }

    // 3. Fallback to proposer_name or username
    if (parsedDetails.proposer_name) return parsedDetails.proposer_name;
    if (parsedDetails.username) return parsedDetails.username;
    
    return '-';
  };

  // Get tooltip content for details
  const getTooltipContent = (log) => {
    if (!log || !log.details) return 'No details available';
    
    try {
      const parsedDetails = JSON.parse(log.details);
      return JSON.stringify(parsedDetails, null, 2);
    } catch {
      return log.details;
    }
  };

  // Fetch logs - memoized to prevent infinite loops
  const fetchLogs = useCallback(async (page = 1, search = '') => {
    // Prevent concurrent requests
    if (fetchingRef.current) {
      return;
    }

    try {
      fetchingRef.current = true;
      setLoading(true);
      setError(null);
      const response = await userRoleWorkLogAPI.getUserRoleWorkLogs(page, pageSize, search);
      
      if (response && response.success) {
        setLogs(response.data.logs || []);
        setTotalPages(response.data.totalPages || 1);
        setTotalCount(response.data.totalCount || 0);
        setCurrentPage(page);
      } else {
        const errorMessage = response?.message || response?.error || 'Failed to fetch logs';
        setError(errorMessage);
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
      const errorMessage = error?.response?.data?.message || error?.response?.data?.error || error?.message || 'An error occurred while fetching logs';
      setError(errorMessage);
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, [pageSize]);

  // Handle search
  const handleSearch = useCallback((query) => {
    setCurrentPage(1);
    fetchLogs(1, query);
  }, [fetchLogs]);

  // Handle page change
  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
    fetchLogs(page, searchQuery || '');
  }, [fetchLogs, searchQuery]);

  // Initial load - only when searchQuery changes
  useEffect(() => {
    fetchLogs(1, searchQuery || '');
  }, [searchQuery, fetchLogs]);

  // Table columns
  // Note: Table component passes render(value, row, index, pagination)
  // where value is row[col.key] and row is the full row object
  const columns = [
    {
      key: 'id',
      label: 'ID',
      render: (value, row) => row.id || value || '-'
    },
    {
      key: 'actor',
      label: 'Actor',
      render: (value, row) => row.actor?.username || row.user?.username || '-'
    },
    {
      key: 'action',
      label: 'Action',
      render: (value, row) => {
        const actionMap = {
          'created_health_policy': 'Created Health Policy',
          'created_vehicle_policy': 'Created Vehicle Policy',
          'created_fire_policy': 'Created Fire Policy',
          'created_life_policy': 'Created Life Policy',
          'created_ecp_policy': 'Created ECP Policy',
          'created_company': 'Created Company',
          'updated_user': 'Updated User',
          'updated_role': 'Updated Role'
        };
        const action = row.action || value;
        return actionMap[action] || action || '-';
      }
    },
    {
      key: 'details',
      label: 'Details',
      render: (value, row) => (
        <span title={getTooltipContent(row)}>
          {getDetailsDisplay(row)}
        </span>
      )
    },
    {
      key: 'targetUser',
      label: 'Target User',
      render: (value, row) => row.targetUser?.username || value?.username || '-'
    },
    {
      key: 'role',
      label: 'Role',
      render: (value, row) => {
        // value is row.role (the role object), row is the full log object
        const role = row.role || value;
        return role?.role_name || '-';
      }
    },
    {
      key: 'created_at',
      label: 'Date',
      render: (value, row) => {
        const date = row.created_at || value;
        return date ? new Date(date).toLocaleDateString() : '-';
      }
    }
  ];

  if (loading && logs.length === 0) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
        <button onClick={() => fetchLogs(currentPage, searchQuery)} className="retry-button">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="insurance">
      <div className="insurance-container">
        <div className="insurance-content">
          <div className="insurance-header">
            <h1 className="insurance-title">User Role Work Log</h1>
            <p>Track all user role-related activities and changes</p>
          </div>

          <div className="search-container">
            <SearchBar
              placeholder="Search logs..."
              onSearch={handleSearch}
              initialValue={searchQuery || ''}
            />
          </div>

          {loading ? (
            <Loader size="large" color="primary" />
          ) : (
            <>
              <div className="table-container">
                <Table
                  data={logs}
                  columns={columns}
                  loading={loading}
                  emptyMessage="No logs found"
                />
              </div>

              {totalPages > 1 && (
                <div className="pagination-container">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    totalItems={totalCount}
                    itemsPerPage={pageSize}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserRoleWorkLog;
