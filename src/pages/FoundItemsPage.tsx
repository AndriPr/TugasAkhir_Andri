import React, { useState, useMemo } from 'react';
import { CheckCircle2, PlusCircle, RefreshCw, AlertCircle, PackageOpen, Loader, Shield } from 'lucide-react';
import { LostFindItem } from '../types';
import { useItems } from '../hooks/useItems';
import { ItemCard } from '../components/items/ItemCard';
import { SearchFilterBar } from '../components/filters/SearchFilterBar';

interface FoundItemsPageProps {
  onSelectItem: (item: LostFindItem) => void;
  onNavigateReport: () => void;
}

export const FoundItemsPage: React.FC<FoundItemsPageProps> = ({
  onSelectItem,
  onNavigateReport,
}) => {
  const [search, setSearch] = useState<string>('');
  const [category, setCategory] = useState<string>('Semua');
  const [location, setLocation] = useState<string>('Semua Lokasi');

  const { items, loading, error, isOffline, refetch } = useItems({
    type: 'found',
  });

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchSearch =
        !search ||
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.description.toLowerCase().includes(search.toLowerCase()) ||
        item.location.toLowerCase().includes(search.toLowerCase()) ||
        (item.securedAt && item.securedAt.toLowerCase().includes(search.toLowerCase()));

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
      <section className="page-masthead page-masthead--found">
        <div className="page-masthead__content">
          <span className="page-subtitle-badge page-subtitle-badge--green">
            <Shield size={13} /> Titik Temu &amp; Pos Pengamanan
          </span>
          <h2 className="page-title">Daftar Barang Ditemukan</h2>
          <p className="page-lede">
            Barang-barang temuan yang telah diserahkan atau diamankan oleh mahasiswa dan petugas posko. Klik barang untuk mengajukan klaim kepemilikan.
          </p>
        </div>
        <div className="page-masthead__actions">
          <button
            type="button"
            className="btn btn--primary"
            onClick={onNavigateReport}
          >
            <PlusCircle size={17} />
            <span>Lapor Temuan</span>
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
        itemTypeLabel="Barang Ditemukan"
      />

      {/* Content Head */}
      <div className="list-meta-bar">
        <div className="list-count">
          <strong>{filteredItems.length}</strong> barang temuan siap diklaim
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
          <p>Memuat daftar barang temuan di posko…</p>
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
          <h3>Tidak Ada Barang Temuan Yang Cocok</h3>
          <p>Belum ada laporan temuan dengan kriteria pencarian tersebut.</p>
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
