import React, { useState, useMemo } from 'react';
import { RefreshCw, AlertCircle, PackageOpen, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { LostFindItem } from '../types';
import { useItems } from '../hooks/useItems';
import { ItemCard } from '../components/items/ItemCard';
import { HeroSearchBanner } from '../components/filters/HeroSearchBanner';
import { INITIAL_CATEGORIES } from '../utils/initialData';
import { RevealSection } from '../components/common/MotionPrimitives';

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
        (item.securedAt &&
          item.securedAt.toLowerCase().includes(search.toLowerCase()));

      const matchCategory =
        category === 'Semua' ||
        item.category.toLowerCase() === category.toLowerCase();

      const matchLocation =
        location === 'Semua Lokasi' ||
        item.location.toLowerCase().includes(location.toLowerCase());

      return matchSearch && matchCategory && matchLocation;
    });
  }, [items, search, category, location]);

  const highlightFound = useMemo(() => items.slice(0, 4), [items]);

  return (
    <div className="page-container page-enter">
      {/* 1. Hero Banner (Coastal Teal-Emerald Variant) */}
      <HeroSearchBanner
        variant="found"
        title="Barang temuan diamankan dengan aman & transparan"
        subtitle="Cek barang temuan yang diserahkan ke posko keamanan kampus dan ajukan klaim kepemilikan dengan bukti ciri unik."
        search={search}
        onSearchChange={setSearch}
        selectedCategory={category}
        onCategoryChange={setCategory}
        selectedLocation={location}
        onLocationChange={setLocation}
        onActionClick={onNavigateReport}
        actionLabel="Lapor Temuan"
        totalCount={items.length}
      />

      {/* 2. "Baru di Posko" Strip */}
      {highlightFound.length > 0 && (
        <RevealSection className="section-block">
          <div className="section-split-header">
            <div>
              <h2 className="section-heading-lg">Baru Diamankan di Posko</h2>
              <p className="section-sub-muted">
                Barang temuan terbaru yang menunggu verifikasi pemilik sah
              </p>
            </div>
            <p className="section-right-caption">
              Setiap barang temuan disimpan di Pos Satpam atau Sekretariat BEM untuk menjaga keamanannya.
            </p>
          </div>

          <div className="popular-strip-grid">
            {highlightFound.map((item, idx) => (
              <ItemCard
                key={`found-hl-${item.id}`}
                item={item}
                onSelect={onSelectItem}
                index={idx}
                variant="compact"
              />
            ))}
          </div>
        </RevealSection>
      )}

      {/* 3. Main Filterable Found Items Grid */}
      <section id="explore-items-grid" className="section-block">
        <div className="section-split-header">
          <div>
            <h2 className="section-heading-lg">Daftar Barang Temuan</h2>
            <p className="section-sub-muted">
              Menampilkan <strong>{filteredItems.length}</strong> barang temuan siap diklaim
            </p>
          </div>
          <button
            type="button"
            className="btn-pill-outline"
            onClick={refetch}
            title="Segarkan data"
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            <span>Sinkronkan</span>
          </button>
        </div>

        {/* Category Dark Pill Bar */}
        <div className="explore-pills-row">
          <button
            type="button"
            className={`explore-pill ${category === 'Semua' ? 'explore-pill--active' : ''}`}
            onClick={() => setCategory('Semua')}
          >
            Semua Temuan
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

        {/* Shimmer Skeleton */}
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
            <PackageOpen size={38} className="text-muted" />
            <h3>Tidak Ada Barang Temuan Yang Cocok</h3>
            <p>Belum ada laporan temuan dengan kriteria pencarian tersebut.</p>
          </div>
        )}

        {/* Grid of Items */}
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
            <span>Menampilkan data dari penyimpanan offline lokal kampus.</span>
          </div>
        )}
      </section>

      {/* 4. Posko Trust Strip */}
      <RevealSection className="posko-trust-strip" delay={80}>
        <div className="trust-card">
          <div className="trust-icon trust-icon--cyan">
            <ShieldCheck size={22} />
          </div>
          <div>
            <h4>Verifikasi Ciri Khusus</h4>
            <p>Klaim hanya disetujui apabila ciri spesifik barang sesuai dengan data posko.</p>
          </div>
        </div>
        <div className="trust-card">
          <div className="trust-icon trust-icon--mint">
            <CheckCircle2 size={22} />
          </div>
          <div>
            <h4>Berita Acara Serah Terima</h4>
            <p>Bawa KTM / KTP asli saat pengambilan di Pos Satpam atau Sekretariat BEM.</p>
          </div>
        </div>
      </RevealSection>
    </div>
  );
};
