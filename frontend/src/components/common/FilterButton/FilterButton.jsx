import React from "react";
import "../../../styles/components/common/FilterButton.css";

const FilterButton = ({ onClick, label = "Filter" }) => {
  return (
    <button className="filter-button" onClick={onClick}>
      {label}
    </button>
  );
};

export default FilterButton;