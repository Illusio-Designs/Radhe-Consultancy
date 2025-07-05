import { useState, useEffect, useCallback, useRef } from 'react';
import { FaSearch, FaTimes, FaSpinner } from 'react-icons/fa';
import '../../../styles/components/common/SearchBar.css';

const SearchBar = ({
  onSearch,
  placeholder = 'Search...',
  className = '',
  minChars = 3,
  debounceMs = 300,
  showClearButton = true,
  showLoading = false,
  disabled = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef(null);

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
      setIsSearching(true);
      onSearch?.(debouncedSearchTerm);
      // Simulate search completion
      setTimeout(() => setIsSearching(false), 500);
    }
  }, [debouncedSearchTerm, onSearch, minChars]);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
  };

  const handleClear = () => {
    setSearchTerm('');
    setDebouncedSearchTerm('');
    onSearch?.('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      handleClear();
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const isSearchActive = searchTerm.length >= minChars;
  const showClear = showClearButton && searchTerm.length > 0;
  const showHint = searchTerm.length > 0 && searchTerm.length < minChars;

  return (
    <div className={`search-bar-container ${className} ${isFocused ? 'focused' : ''} ${disabled ? 'disabled' : ''}`}>
      <div className="search-bar-input-wrapper">
        <div className="search-bar-icon-wrapper">
          {isSearching || showLoading ? (
            <FaSpinner className="search-bar-icon search-bar-spinner" />
          ) : (
            <FaSearch className="search-bar-icon" />
          )}
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={handleSearch}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          className="search-bar-input"
          disabled={disabled}
          autoComplete="off"
          spellCheck="false"
        />
        
        {showClear && (
          <button
            type="button"
            className="search-bar-clear-button"
            onClick={handleClear}
            title="Clear search"
            disabled={disabled}
          >
            <FaTimes className="search-bar-clear-icon" />
          </button>
        )}
      </div>
      
      {showHint && (
        <div className="search-bar-hint">
          <span className="search-bar-hint-text">
            Type at least {minChars} characters to search
          </span>
        </div>
      )}
      
      {isSearchActive && (
        <div className="search-bar-status">
          <span className="search-bar-status-text">
            Searching...
          </span>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
