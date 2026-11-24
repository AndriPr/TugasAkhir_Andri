import React, { useState, useMemo } from 'react';
import { Search, PlusCircle, RefreshCw, AlertCircle, PackageOpen, Loader } from 'lucide-react';
import { LostFindItem } from '../types';
import { useItems } from '../hooks/useItems';
import { ItemCard } from '../components/items/ItemCard';
import { SearchFilterBar } from '../components/filters/SearchFilterBar';

interface LostItemsPageProps {
  onSelectItem: (item: LostFindItem) => void;
  onNavigateReport: () => void;
}

export const LostItemsPage: React.FC<LostItemsPageProps> = ({
  onSelectItem,
  onNavigateReport,
}) => {
  const [search, setSearch] = useState<string>('');
  const [category, setCategory] = useState<string>('Semua');
  const [location, setLocation] = useState<string>('Semua Lokasi');

  const { items, loading, error, isOffline, refetch } = useItems({
    type: 'lost',
  });

  // Client-side filtering & search
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchSearch =
        !search ||
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.description.toLowerCase().includes(search.toLowerCase()) ||
        item.location.toLowerCase().includes(search.toLowerCase());

      const matchCategory =
        category === 'Semua' || item.category.toLowerCase() === category.toLowerCase();

      const matchLocation =
        location === 'Semua Lokasi' || item.location.toLowerCase() === location.toLowerCase();

      return matchSearch && matchCategory && matchLocation;
    });
  }, [items, search, category, location]);

  return (
    <div className="page-container">
      {/* Banner Masthead */}
      <section className="page-masthead">
        <div className="page-masthead__content">
          <span className="page-subtitle-badge">Layanan Informasi Kampus</span>
          <h2 className="page-title">Pencarian Barang Hilang</h2>
          <p className="page-lede">
            Daftar barang civitas akademika yang dilaporkan hilang di area kampus. Segera hubungi pelapor jika Anda menemukan salah satunya.
          </p>
        </div>
        <div className="page-masthead__actions">
          <button
            type="button"
            className="btn btn--primary"
            onClick={onNavigateReport}
          >
            <PlusCircle size={17} />
            <span>Lapor Kehilangan</span>
          </button>
        </div>
      </section>

      {/* Filter and Search Bar */}
      <SearchFilterBar
        search={search}
        onSearchChange={setSearch}
        selectedCategory={category}
        onCategoryChange={setCategory}
        selectedLocation={location}
        onLocationChange={setLocation}
        itemTypeLabel="Barang Hilang"
      />

      {/* Content Head */}
      <div className="list-meta-bar">
        <div className="list-count">
          <strong>{filteredItems.length}</strong> barang tercatat sedang dicari
        </div>
        <button
          type="button"
          className="btn-refresh"
          onClick={refetch}
          title="Segarkan data"
        >
          <RefreshCw size={14} className={loading ? 'spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Loading state */}
      {loading && items.length === 0 && (
        <div className="state-box">
          <Loader size={32} className="spin text-primary" />
          <p>Memuat daftar barang hilang di kampus…</p>
        </div>
      )}

      {/* Error state */}
      {!loading && error && items.length === 0 && (
        <div className="state-box state-box--error">
          <AlertCircle size={32} />
          <p>{error}</p>
          <button type="button" className="btn btn--outline btn--sm" onClick={refetch}>
            Coba Lagi
          </button>
        </div>
      )}

      {/* Empty state */}
      {!loading && filteredItems.length === 0 && !error && (
        <div className="state-box">
          <PackageOpen size={36} className="text-muted" />
          <h3>Tidak Ada Barang Yang Cocok</h3>
          <p>Coba gunakan kata kunci lain atau ubah filter kategori dan lokasi.</p>
        </div>
      )}

      {/* Grid of Items */}
      {filteredItems.length > 0 && (
        <div className="items-grid">
          {filteredItems.map((item) => (
            <ItemCard key={item.id} item={item} onSelect={onSelectItem} />
          ))}
        </div>
      )}

      {isOffline && (
        <div className="offline-note">
          <span>Menampilkan data dari penyimpanan offline lokal kampus.</span>
        </div>
      )}
    </div>
  );
};
