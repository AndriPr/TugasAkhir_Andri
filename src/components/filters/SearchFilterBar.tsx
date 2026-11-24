import React from 'react';
import { Search, MapPin, X } from 'lucide-react';
import { INITIAL_CATEGORIES, CAMPUS_LOCATIONS } from '../../utils/initialData';

interface SearchFilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  selectedLocation: string;
  onLocationChange: (location: string) => void;
  itemTypeLabel: string;
}

export const SearchFilterBar: React.FC<SearchFilterBarProps> = ({
  search,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedLocation,
  onLocationChange,
  itemTypeLabel,
}) => {
  return (
    <div className="filter-bar">
      {/* Search Input */}
      <div className="filter-bar__search">
        <Search size={18} className="filter-bar__search-icon" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={`Cari nama, ciri, atau lokasi ${itemTypeLabel.toLowerCase()}…`}
          className="filter-bar__input"
        />
        {search && (
          <button
            type="button"
            className="filter-bar__clear-btn"
            onClick={() => onSearchChange('')}
            aria-label="Hapus kata kunci pencarian"
          >
            <X size={15} />
          </button>
        )}
      </div>

      {/* Row: Location selector & Reset */}
      <div className="filter-bar__subrow">
        <div className="location-select-wrap">
          <MapPin size={15} className="location-icon" />
          <select
            value={selectedLocation}
            onChange={(e) => onLocationChange(e.target.value)}
            className="location-select"
          >
            {CAMPUS_LOCATIONS.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </div>

        {(selectedCategory !== 'Semua' || selectedLocation !== 'Semua Lokasi' || search) && (
          <button
            type="button"
            className="filter-reset-btn"
            onClick={() => {
              onSearchChange('');
              onCategoryChange('Semua');
              onLocationChange('Semua Lokasi');
            }}
          >
            Reset Filter
          </button>
        )}
      </div>

      {/* Categories Horizontal Pills */}
      <div className="category-pills">
        <button
          type="button"
          className={`pill ${selectedCategory === 'Semua' ? 'pill--active' : ''}`}
          onClick={() => onCategoryChange('Semua')}
        >
          Semua Kategori
        </button>
        {INITIAL_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            className={`pill ${selectedCategory === cat.name ? 'pill--active' : ''}`}
            onClick={() => onCategoryChange(cat.name)}
          >
            {cat.name}
          </button>
        ))}
      </div>
    </div>
  );
};
