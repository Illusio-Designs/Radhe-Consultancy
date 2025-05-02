import React from 'react';
import '../../../styles/components/common/Pagination.css';

const Pagination = ({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100]
}) => {
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  const handlePageSizeChange = (e) => {
    const newPageSize = parseInt(e.target.value);
    onPageSizeChange(newPageSize);
  };

  const getPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="pagination-container">
      <div className="pagination-info">
        Showing {startItem} to {endItem} of {totalItems} entries
      </div>
      
      <div className="pagination-controls">
        <button
          className="pagination-button"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
        >
          First
        </button>

        <button
          className="pagination-button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          &lt;
        </button>

        {getPageNumbers().map((page) => (
          <button
            key={page}
            className={`pagination-button ${page === currentPage ? 'active' : ''}`}
            onClick={() => onPageChange(page)}
          >
            {page}
          </button>
        ))}

        <button
          className="pagination-button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          &gt;
        </button>

        <button
          className="pagination-button"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
        >
          Last
        </button>

        <div className="page-size-selector">
          <span>Show</span>
          <select value={pageSize} onChange={handlePageSizeChange}>
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
          <span>entries</span>
        </div>
      </div>
    </div>
  );
};

export default Pagination;