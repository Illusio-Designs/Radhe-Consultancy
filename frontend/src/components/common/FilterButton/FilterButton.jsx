import React from "react";
import "../../../styles/components/common/FilterButton.css";

const FilterButton = ({ onClick, label = "Filter", options }) => {
  return (
    <div className="filter-button-container">
      <button className="filter-button" onClick={onClick}>
        {label}
      </button>
      {options && (
        <ul className="filter-options">
          {options.map((option, index) => (
            <li key={index}>{option}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default FilterButton;