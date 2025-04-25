import React, { useState } from "react";
import "../../../styles/components/common/FilterButton.css";

const FilterButton = ({ onClick, label = "Filter", options }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleOptionClick = (option) => {
    onClick(option);
    setIsOpen(false);
  };

  return (
    <div className="filter-button-container">
      <button className="filter-button" onClick={handleToggle}>
        {label}
      </button>
      {isOpen && options && (
        <ul className="filter-options">
          {options.map((option, index) => (
            <li key={index} onClick={() => handleOptionClick(option)}>
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default FilterButton;