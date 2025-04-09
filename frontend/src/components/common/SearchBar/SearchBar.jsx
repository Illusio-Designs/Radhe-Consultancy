import { useState } from 'react';
import { FaSearch } from 'react-icons/fa';
import '../../../styles/components/common/SearchBar.css';

const SearchBar = ({
  onSearch,
  placeholder = 'Search...',
  className = ''
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch?.(value);
  };

  return (
    <div className={`search-bar-container ${className}`}>
      <div className="search-bar-input-wrapper">
        <FaSearch className="search-bar-icon" />
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearch}
          placeholder={placeholder}
          className="search-bar-input"
        />
      </div>
    </div>
  );
};

export default SearchBar;
