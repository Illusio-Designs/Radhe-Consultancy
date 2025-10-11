import React, { useState, useRef, useEffect } from 'react';
import '../../../styles/components/common/Dropdown.css';
import { FaChevronDown, FaSearch, FaTimes } from 'react-icons/fa';

const Dropdown = ({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  isMulti = false,
  isSearchable = false,
  groupBy = null,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options?.filter((option) =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const groupedOptions = groupBy
    ? filteredOptions.reduce((acc, option) => {
        const groupKey = option[groupBy] || 'Other';
        if (!acc[groupKey]) {
          acc[groupKey] = [];
        }
        acc[groupKey].push(option);
        return acc;
      }, {})
    : null;

  const handleSelect = (option) => {
    if (isMulti) {
      const newValue = Array.isArray(value) ? [...value] : [];
      const index = newValue.findIndex((item) => item.value === option.value);
      if (index === -1) {
        newValue.push(option);
      } else {
        newValue.splice(index, 1);
      }
      onChange(newValue);
    } else {
      onChange(option);
      setIsOpen(false);
    }
  };

  const removeValue = (optionToRemove) => {
    const newValue = value.filter(
      (item) => item.value !== optionToRemove.value
    );
    onChange(newValue);
  };

  const renderOption = (option) => (
    <div
      key={option.value}
      className={`dropdown-option ${
        isMulti
          ? value?.some((item) => item.value === option.value)
            ? 'selected'
            : ''
          : value?.value === option.value
          ? 'selected'
          : ''
      }`}
      onClick={() => handleSelect(option)}
    >
      {option.label}
    </div>
  );

  return (
    <div className="dropdown-container" ref={dropdownRef}>
      <div
        className={`dropdown-header ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="dropdown-values">
          {isMulti ? (
            value?.length > 0 ? (
              <div className="multi-value-container">
                {value.map((item) => (
                  <div key={item.value} className="multi-value">
                    {item.label}
                    <FaTimes
                      className="remove-value"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeValue(item);
                      }}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <span className="placeholder">{placeholder}</span>
            )
          ) : value ? (
            value.label
          ) : (
            <span className="placeholder">{placeholder}</span>
          )}
        </div>
        <FaChevronDown className={`dropdown-arrow ${isOpen ? 'open' : ''}`} />
      </div>

      {isOpen && (
        <div className="dropdown-menu">
          {isSearchable && (
            <div className="dropdown-search">
              <FaSearch className="search-icon" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search..."
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}

          <div className="dropdown-options">
            {groupBy
              ? Object.entries(groupedOptions).map(([group, groupOptions]) => (
                  <div key={group} className="option-group">
                    <div className="group-header">{group}</div>
                    {groupOptions.map(renderOption)}
                  </div>
                ))
              : filteredOptions.map(renderOption)}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dropdown;
