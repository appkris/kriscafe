import React from 'react';
import { Search, X } from 'lucide-react';
import './SearchBar.css';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = 'Cari menu kafe...'
}) => {
  return (
    <div className="pos-search-wrapper">
      <Search size={18} className="pos-search-icon" />
      <input
        type="text"
        className="pos-search-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
      {value.length > 0 && (
        <button
          type="button"
          className="pos-search-clear-btn"
          onClick={() => onChange('')}
          title="Hapus pencarian"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
};
