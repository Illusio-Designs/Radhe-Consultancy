import React from 'react';
import '../../../styles/components/common/Table.css';

const Table = ({ data, columns, pagination }) => {
  return (
    <table>
      <thead>
        <tr>
          {columns.map((col) => (
            <th key={col.key}>
              {col.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.length > 0 ? (
          data.map((row, index) => (
            <tr key={index}>
              {columns.map((col) => (
                <td key={col.key}>
                  {col.render ? col.render(row[col.key], row, index, pagination) : row[col.key]}
                </td>
              ))}
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={columns.length} style={{ textAlign: 'center' }}>
              No data available
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
};

export default Table;
