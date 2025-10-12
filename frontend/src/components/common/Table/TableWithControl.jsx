import React, { useState, useEffect } from "react";
import Table from "./Table";
import Pagination from "../Pagination/Pagination";
import FilterButton from "../FilterButton/FilterButton"; // Import the FilterButton component
import "../../../styles/components/common/TableWithControl.css";

const TableWithControl = ({
  data: initialData,
  columns,
  pageSizeOptions = [10, 20, 50, 100],
  defaultPageSize = 10,
  currentPage: externalCurrentPage,
  totalPages: externalTotalPages,
  totalItems: externalTotalItems,
  onPageChange,
  onPageSizeChange,
  serverSidePagination = false,
}) => {
  const [data, setData] = useState(
    Array.isArray(initialData) ? initialData : []
  );
  const [currentPage, setCurrentPage] = useState(externalCurrentPage || 1);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState(data);

  useEffect(() => {
    setData(Array.isArray(initialData) ? initialData : []);
  }, [initialData]);

  useEffect(() => {
    setFilteredData(data);
  }, [data]);

  // Update current page when external current page changes
  useEffect(() => {
    if (externalCurrentPage && externalCurrentPage !== currentPage) {
      setCurrentPage(externalCurrentPage);
    }
  }, [externalCurrentPage, currentPage]);

  // Update page size when external page size changes (for server-side pagination)
  useEffect(() => {
    if (serverSidePagination && defaultPageSize !== pageSize) {
      setPageSize(defaultPageSize);
    }
  }, [defaultPageSize, serverSidePagination, pageSize]);

  useEffect(() => {
    if (!Array.isArray(data)) {
      setFilteredData([]);
      return;
    }

    const filtered = data.filter((item) =>
      Object.values(item).some(
        (value) =>
          value &&
          value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
    setFilteredData(filtered);
    setCurrentPage(1);
  }, [searchTerm, data]);

  const totalItems = serverSidePagination
    ? externalTotalItems
    : filteredData.length;
  const totalPages = serverSidePagination
    ? externalTotalPages
    : Math.ceil(totalItems / pageSize);

  const getCurrentPageData = () => {
    if (!Array.isArray(filteredData)) {
      return [];
    }

    if (serverSidePagination) {
      // For server-side pagination, return all data as it's already paginated
      return filteredData;
    }

    // For client-side pagination, slice the data
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredData.slice(startIndex, endIndex);
  };

  const handlePageChange = (page) => {
    if (serverSidePagination && onPageChange) {
      onPageChange(page);
    } else {
      setCurrentPage(page);
    }
  };

  const handlePageSizeChange = (newPageSize) => {
    if (serverSidePagination && onPageSizeChange) {
      onPageSizeChange(newPageSize);
    } else {
      setPageSize(newPageSize);
      setCurrentPage(1);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterClick = (option) => {
    console.log("Selected filter option:", option); // Handle the selected option as needed
  };

  return (
    <div className="table-with-control">
      <div className="table-controls">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={handleSearch}
            className="search-input"
          />
          <FilterButton
            onClick={handleFilterClick}
            label="Filter"
            options={["Option 1", "Option 2"]}
          />
        </div>
      </div>

      <div className="table-container">
        <Table
          data={getCurrentPageData()}
          columns={columns}
          pagination={{ currentPage, pageSize }}
        />
      </div>

      {!serverSidePagination && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={totalItems}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          pageSizeOptions={pageSizeOptions}
        />
      )}
      {serverSidePagination && (
        <Pagination
          currentPage={externalCurrentPage || currentPage}
          totalPages={externalTotalPages || totalPages}
          pageSize={pageSize}
          totalItems={externalTotalItems || totalItems}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          pageSizeOptions={pageSizeOptions}
        />
      )}
    </div>
  );
};

export default TableWithControl;
