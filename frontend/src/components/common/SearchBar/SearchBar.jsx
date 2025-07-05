import { useState, useEffect, useCallback } from 'react';
import { FaSearch } from 'react-icons/fa';
import '../../../styles/components/common/SearchBar.css';

const SearchBar = ({
  onSearch,
  placeholder = 'Search...',
  className = '',
  minChars = 3,
  debounceMs = 300
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // Debounce the search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [searchTerm, debounceMs]);

  // Trigger search only when debounced term changes and meets minimum character requirement
  useEffect(() => {
    if (debouncedSearchTerm.length >= minChars || debouncedSearchTerm.length === 0) {
      onSearch?.(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm, onSearch, minChars]);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
  };

  return (
    <div className={`search-bar-container ${className}`}>
      <div className="search-bar-input-wrapper">
        <FaSearch className="search-bar-icon" />
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearch}
          placeholder={`${placeholder} (min ${minChars} chars)`}
          className="search-bar-input"
        />
      </div>
      {searchTerm.length > 0 && searchTerm.length < minChars && (
        <div className="search-bar-hint">
          Type at least {minChars} characters to search
        </div>
      )}
    </div>
  );
};

export default SearchBar;
