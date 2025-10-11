import React, { useState, useEffect } from 'react';
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

  // Get details display with priority: company_name -> consumer_name -> proposer_name -> username -> '-'
  const getDetailsDisplay = (log) => {
    if (!log.details) return '-';
    
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
      } else if (!loadingCompanyIds.includes(companyId)) {
        fetchCompanyName(companyId);
        return 'Loading...';
      } else {
        return 'Loading...';
      }
    }

    // 2. Consumer name by consumer_id
    const consumerId = parsedDetails.consumer_id || (parsedDetails.changes && parsedDetails.changes.consumer_id);
    if (consumerId) {
      if (consumerNameCache[consumerId] !== undefined) {
        return consumerNameCache[consumerId];
      } else if (!loadingConsumerIds.includes(consumerId)) {
        fetchConsumerName(consumerId);
        return 'Loading...';
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
    if (!log.details) return 'No details available';
    
    try {
      const parsedDetails = JSON.parse(log.details);
      return JSON.stringify(parsedDetails, null, 2);
    } catch {
      return log.details;
    }
  };

  // Fetch logs
  const fetchLogs = async (page = 1, search = '') => {
    try {
      setLoading(true);
      const response = await userRoleWorkLogAPI.getUserRoleWorkLogs(page, pageSize, search);
      
      if (response.success) {
        setLogs(response.data.logs || []);
        setTotalPages(response.data.totalPages || 1);
        setTotalCount(response.data.totalCount || 0);
        setCurrentPage(page);
      } else {
        setError(response.message || 'Failed to fetch logs');
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
      setError('An error occurred while fetching logs');
    } finally {
      setLoading(false);
    }
  };

  // Handle search
  const handleSearch = (query) => {
    setCurrentPage(1);
    fetchLogs(1, query);
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchLogs(page, searchQuery);
  };

  // Initial load
  useEffect(() => {
    fetchLogs(1, searchQuery || '');
  }, [searchQuery]);

  // Table columns
  const columns = [
    {
      key: 'id',
      header: 'ID',
      render: (log) => log.id
    },
    {
      key: 'actor',
      header: 'Actor',
      render: (log) => log.actor?.username || '-'
    },
    {
      key: 'action',
      header: 'Action',
      render: (log) => {
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
        return actionMap[log.action] || log.action;
      }
    },
    {
      key: 'details',
      header: 'Details',
      render: (log) => (
        <span title={getTooltipContent(log)}>
          {getDetailsDisplay(log)}
        </span>
      )
    },
    {
      key: 'targetUser',
      header: 'Target User',
      render: (log) => log.targetUser?.username || '-'
    },
    {
      key: 'role',
      header: 'Role',
      render: (log) => log.role?.role_name || '-'
    },
    {
      key: 'created_at',
      header: 'Date',
      render: (log) => new Date(log.created_at).toLocaleDateString()
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
