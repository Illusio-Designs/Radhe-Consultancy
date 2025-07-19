import React, { useEffect, useState } from 'react';
import { userRoleWorkLogAPI } from '../../../services/api';
import '../../../styles/pages/dashboard/dsc/DSC.css';
import Pagination from '../../../components/common/Pagination/Pagination';

const FIELDS = [
  { key: 'actor', label: 'Actor' },
  { key: 'targetUser', label: 'Target User' },
  { key: 'role', label: 'Role' },
  { key: 'action', label: 'Action' },
  { key: 'details', label: 'Details' },
];

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

const UserRoleWorkLog = ({ searchQuery = '' }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await userRoleWorkLogAPI.getAllLogs();
        setLogs(data);
      } catch (err) {
        setError('Failed to fetch logs');
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  // Filter logs by global search query
  const filteredLogs = logs.filter((log) => {
    const search = (searchQuery || '').toLowerCase();
    return (
      (log.actor?.username || '').toLowerCase().includes(search) ||
      (log.actor?.email || '').toLowerCase().includes(search) ||
      (log.targetUser?.username || '').toLowerCase().includes(search) ||
      (log.targetUser?.email || '').toLowerCase().includes(search) ||
      (log.role?.role_name || '').toLowerCase().includes(search) ||
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
          <div>Loading...</div>
        ) : error ? (
          <div className="dsc-error">{error}</div>
        ) : filteredLogs.length === 0 ? (
          <div>No logs found.</div>
        ) : (
          <>
            <div className="table-responsive">
              <table className="dsc-table">
                <thead>
                  <tr>
                    <th>Sr No.</th>
                    <th>Timestamp</th>
                    {FIELDS.map((f) => (
                      <th key={f.key}>{f.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginatedLogs.map((log, idx) => (
                    <tr key={log.id}>
                      <td>{(page - 1) * pageSize + idx + 1}</td>
                      <td>{new Date(log.created_at).toLocaleString()}</td>
                      <td>{log.actor ? `${log.actor.username} (${log.actor.email})` : '-'}</td>
                      <td>{log.targetUser ? `${log.targetUser.username} (${log.targetUser.email})` : '-'}</td>
                      <td>{log.role ? log.role.role_name : '-'}</td>
                      <td>{log.action}</td>
                      <td>{log.details || '-'}</td>
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
              pageSizeOptions={PAGE_SIZE_OPTIONS}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default UserRoleWorkLog; 