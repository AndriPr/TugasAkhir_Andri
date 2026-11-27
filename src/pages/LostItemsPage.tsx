import React, { useState, useMemo } from 'react';
import { RefreshCw, AlertCircle, PackageOpen } from 'lucide-react';
import { LostFindItem } from '../types';
import { useItems } from '../hooks/useItems';
import { ItemCard } from '../components/items/ItemCard';
import { HeroSearchBanner } from '../components/filters/HeroSearchBanner';
import { CampusDiscoverySection } from '../components/items/CampusDiscoverySection';
import { INITIAL_CATEGORIES } from '../utils/initialData';
import { RevealSection } from '../components/common/MotionPrimitives';

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

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchSearch =
        !search ||
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.description.toLowerCase().includes(search.toLowerCase()) ||
        item.location.toLowerCase().includes(search.toLowerCase());

      const matchCategory =
        category === 'Semua' ||
        item.category.toLowerCase() === category.toLowerCase();

      const matchLocation =
        location === 'Semua Lokasi' ||
        item.location.toLowerCase().includes(location.toLowerCase());

      return matchSearch && matchCategory && matchLocation;
    });
  }, [items, search, category, location]);

  const featuredItems = useMemo(() => items.slice(0, 4), [items]);
  const resolvedCount = useMemo(
    () => items.filter((i) => i.status === 'resolved').length,
    [items]
  );

  const handleZoneClick = (zoneLoc: string) => {
    setLocation(zoneLoc);
    const el = document.getElementById('explore-items-grid');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="page-container page-enter">
      {/* 1. Tripco-Style Bright Sky Hero Banner + Overlapping Floating Search Card */}
      <HeroSearchBanner
        variant="lost"
        title="Temukan barang hilang di seluruh penjuru kampus"
        subtitle="Pantau laporan terbaru civitas akademika dan bantu kembalikan barang berharga dengan cepat."
        search={search}
        onSearchChange={setSearch}
        selectedCategory={category}
        onCategoryChange={setCategory}
        selectedLocation={location}
        onLocationChange={setLocation}
        onActionClick={onNavigateReport}
        actionLabel="Lapor Kehilangan"
        totalCount={items.length}
      />

      {/* 2. "Sorotan Terbaru" ("Popular Place" 4-Card Strip) */}
      {featuredItems.length > 0 && (
        <RevealSection className="section-block">
          <div className="section-split-header">
            <div>
              <h2 className="section-heading-lg">Sorotan Kehilangan</h2>
              <p className="section-sub-muted">
                Laporan yang paling baru masuk di area kampus
              </p>
            </div>
            <p className="section-right-caption">
              Klik salah satu kartu barang di bawah untuk melihat ciri khusus dan kontak WhatsApp pelapor.
            </p>
          </div>

          <div className="popular-strip-grid">
            {featuredItems.map((item, idx) => (
              <ItemCard
                key={`featured-${item.id}`}
                item={item}
                onSelect={onSelectItem}
                index={idx}
                variant="compact"
              />
            ))}
          </div>
        </RevealSection>
      )}

      {/* 3. "Jelajahi Semua Laporan" ("Explore more" Dark-Pill Bar + Grid) */}
      <section id="explore-items-grid" className="section-block">
        <div className="section-split-header">
          <div>
            <h2 className="section-heading-lg">Jelajahi Semua Laporan</h2>
            <p className="section-sub-muted">
              Menampilkan <strong>{filteredItems.length}</strong> laporan kehilangan sesuai filter
            </p>
          </div>
          <button
            type="button"
            className="btn-pill-outline"
            onClick={refetch}
            title="Segarkan data dari API"
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            <span>Sinkronkan</span>
          </button>
        </div>

        {/* Category Pills Bar (Dark Active Pill Style) */}
        <div className="explore-pills-row">
          <button
            type="button"
            className={`explore-pill ${category === 'Semua' ? 'explore-pill--active' : ''}`}
            onClick={() => setCategory('Semua')}
          >
            Semua Laporan
          </button>
          {INITIAL_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={`explore-pill ${
                category === cat.name ? 'explore-pill--active' : ''
              }`}
              onClick={() => setCategory(cat.name)}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Loading Shimmer Skeletons */}
        {loading && items.length === 0 && (
          <div className="items-grid">
            {[0, 1, 2].map((n) => (
              <div key={n} className="skeleton-card">
                <div className="skeleton-media shimmer-bg" />
                <div className="skeleton-body">
                  <div className="skeleton-line skeleton-line--lg shimmer-bg" />
                  <div className="skeleton-line skeleton-line--md shimmer-bg" />
                  <div className="skeleton-line skeleton-line--sm shimmer-bg" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {!loading && error && items.length === 0 && (
          <div className="state-box state-box--error">
            <AlertCircle size={32} />
            <p>{error}</p>
            <button type="button" className="btn btn--outline btn--sm" onClick={refetch}>
              Coba Lagi
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredItems.length === 0 && !error && (
          <div className="state-box">
            <PackageOpen size={38} className="text-muted" />
            <h3>Tidak Ada Barang Yang Cocok</h3>
            <p>Coba gunakan kata kunci lain atau ubah filter lokasi &amp; kategori.</p>
            <button
              type="button"
              className="btn btn--cyan-pill btn--sm"
              onClick={() => {
                setSearch('');
                setCategory('Semua');
                setLocation('Semua Lokasi');
              }}
            >
              Tampilkan Semua
            </button>
          </div>
        )}

        {/* Main Animated 3-Col Grid */}
        {filteredItems.length > 0 && (
          <div className="items-grid">
            {filteredItems.map((item, idx) => (
              <ItemCard
                key={item.id}
                item={item}
                onSelect={onSelectItem}
                index={idx}
              />
            ))}
          </div>
        )}

        {isOffline && (
          <div className="offline-note">
            <span>Menampilkan data dari penyimpanan offline lokal (Service Worker Cache).</span>
          </div>
        )}
      </section>

      {/* 4. Tripco-Style Feature Showcase + Campus Zones + Spotlight CTA */}
      <CampusDiscoverySection
        totalItems={items.length}
        resolvedCount={resolvedCount}
        onSelectLocation={handleZoneClick}
        onNavigateReport={onNavigateReport}
      />
    </div>
  );
};
