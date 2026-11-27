import React from 'react';
import { Search, MapPin, Tag, RotateCcw, Sparkles, Compass, ShieldCheck } from 'lucide-react';
import { INITIAL_CATEGORIES, CAMPUS_LOCATIONS } from '../../utils/initialData';

interface HeroSearchBannerProps {
  variant: 'lost' | 'found';
  title: string;
  subtitle: string;
  search: string;
  onSearchChange: (val: string) => void;
  selectedCategory: string;
  onCategoryChange: (cat: string) => void;
  selectedLocation: string;
  onLocationChange: (loc: string) => void;
  onActionClick: () => void;
  actionLabel: string;
  totalCount: number;
}

export const HeroSearchBanner: React.FC<HeroSearchBannerProps> = ({
  variant,
  title,
  subtitle,
  search,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedLocation,
  onLocationChange,
  onActionClick,
  actionLabel,
  totalCount,
}) => {
  const hasActiveFilter =
    Boolean(search) ||
    selectedCategory !== 'Semua' ||
    selectedLocation !== 'Semua Lokasi';

  const handleReset = () => {
    onSearchChange('');
    onCategoryChange('Semua');
    onLocationChange('Semua Lokasi');
  };

  return (
    <section className="hero-wrapper">
      {/* Main Rounded Sky-Blue / Aqua Hero Banner (Tripco Style) */}
      <div className={`hero-banner hero-banner--${variant}`}>
        {/* Animated Scenic Sky Background SVG & Floating Clouds */}
        <div className="hero-decor" aria-hidden="true">
          <div className="hero-sun-glow" />
          <div className="hero-cloud hero-cloud--1" />
          <div className="hero-cloud hero-cloud--2" />
          <div className="hero-cloud hero-cloud--3" />

          {/* Decorative Campus Skyline Silhouette at Bottom */}
          <svg
            className="hero-skyline-svg"
            viewBox="0 0 1200 180"
            preserveAspectRatio="none"
          >
            <path
              d="M0,180 L0,130 Q180,95 360,125 T720,115 T1080,130 L1200,115 L1200,180 Z"
              fill="rgba(255,255,255,0.14)"
            />
            <path
              d="M0,180 L0,148 Q240,120 480,145 T960,138 L1200,148 L1200,180 Z"
              fill="rgba(255,255,255,0.18)"
            />
          </svg>

          {/* Animated Floating Geometric Sparkles */}
          <div className="hero-floater hero-floater--left">
            <Compass size={26} />
          </div>
          <div className="hero-floater hero-floater--right">
            <ShieldCheck size={24} />
          </div>
        </div>

        {/* Centered Hero Content */}
        <div className="hero-content">
          <div className="hero-pill-badge">
            <Sparkles size={13} />
            <span>
              {variant === 'lost'
                ? `${totalCount} Laporan Aktif di Kampus`
                : `${totalCount} Barang Diamankan Posko`}
            </span>
          </div>

          <h2 className="hero-headline">{title}</h2>
          <p className="hero-subheadline">{subtitle}</p>
        </div>
      </div>

      {/* Overlapping Floating White Search Card (Tripco Signature Element) */}
      <div className="floating-search-card">
        {/* Top Mini Tabs */}
        <div className="floating-search-tabs">
          <div className="search-tab-group">
            <span className="search-tab search-tab--active">
              {variant === 'lost' ? 'Cari Barang Hilang' : 'Cari Barang Temuan'}
            </span>
            <button
              type="button"
              className="search-tab search-tab--cta"
              onClick={onActionClick}
            >
              + {actionLabel}
            </button>
          </div>

          {hasActiveFilter && (
            <button
              type="button"
              className="search-reset-link"
              onClick={handleReset}
            >
              <RotateCcw size={13} />
              <span>Reset Filter</span>
            </button>
          )}
        </div>

        {/* Multi-column Search Bar */}
        <div className="floating-search-fields">
          {/* Segment 1: Keyword Search */}
          <div className="search-field">
            <div className="search-field__icon">
              <Search size={17} />
            </div>
            <div className="search-field__body">
              <label className="search-field__label">Kata Kunci</label>
              <input
                type="text"
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="KTM, Laptop, Dompet…"
                className="search-field__input"
              />
            </div>
          </div>

          <div className="search-divider" />

          {/* Segment 2: Campus Location */}
          <div className="search-field">
            <div className="search-field__icon">
              <MapPin size={17} />
            </div>
            <div className="search-field__body">
              <label className="search-field__label">Lokasi Kampus</label>
              <select
                value={selectedLocation}
                onChange={(e) => onLocationChange(e.target.value)}
                className="search-field__select"
              >
                {CAMPUS_LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="search-divider" />

          {/* Segment 3: Category */}
          <div className="search-field">
            <div className="search-field__icon">
              <Tag size={17} />
            </div>
            <div className="search-field__body">
              <label className="search-field__label">Kategori</label>
              <select
                value={selectedCategory}
                onChange={(e) => onCategoryChange(e.target.value)}
                className="search-field__select"
              >
                <option value="Semua">Semua Kategori</option>
                {INITIAL_CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Submit / Scroll CTA */}
          <button
            type="button"
            className="floating-search-btn"
            onClick={() => {
              const listEl = document.getElementById('explore-items-grid');
              if (listEl) listEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
          >
            <Search size={17} />
            <span>Cari</span>
          </button>
        </div>
      </div>
    </section>
  );
};
