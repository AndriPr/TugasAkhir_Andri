import React from 'react';
import { Search, CheckCircle2, PlusCircle, Clock, User } from 'lucide-react';
import { ActiveTab } from '../../types';

interface BottomNavProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  myReportsCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  myReportsCount = 0,
}) => {
  return (
    <nav className="bottom-nav" aria-label="Navigasi Utama">
      <div className="bottom-nav__container">
        {/* Tab 1: Barang Hilang */}
        <button
          type="button"
          className={`bottom-nav__item ${activeTab === 'lost' ? 'bottom-nav__item--active' : ''}`}
          onClick={() => onTabChange('lost')}
          aria-label="Barang Hilang"
        >
          <Search size={20} className="bottom-nav__icon" />
          <span className="bottom-nav__label">Hilang</span>
        </button>

        {/* Tab 2: Barang Ditemukan */}
        <button
          type="button"
          className={`bottom-nav__item ${activeTab === 'found' ? 'bottom-nav__item--active' : ''}`}
          onClick={() => onTabChange('found')}
          aria-label="Barang Ditemukan"
        >
          <CheckCircle2 size={20} className="bottom-nav__icon" />
          <span className="bottom-nav__label">Ditemukan</span>
        </button>

        {/* Tab 3: Laporkan (Elevated Center Button) */}
        <div className="bottom-nav__center-wrap">
          <button
            type="button"
            className={`bottom-nav__center-btn ${activeTab === 'report' ? 'bottom-nav__center-btn--active' : ''}`}
            onClick={() => onTabChange('report')}
            aria-label="Buat Laporan Baru"
            title="Buat Laporan Kehilangan atau Penemuan"
          >
            <PlusCircle size={26} strokeWidth={2.4} />
            <span className="sr-only">Lapor</span>
          </button>
        </div>

        {/* Tab 4: Aktivitas Saya */}
        <button
          type="button"
          className={`bottom-nav__item ${activeTab === 'activity' ? 'bottom-nav__item--active' : ''}`}
          onClick={() => onTabChange('activity')}
          aria-label="Aktivitas Saya"
        >
          <div className="bottom-nav__icon-wrap">
            <Clock size={20} className="bottom-nav__icon" />
            {myReportsCount > 0 && (
              <span className="bottom-nav__badge">{myReportsCount}</span>
            )}
          </div>
          <span className="bottom-nav__label">Aktivitas</span>
        </button>

        {/* Tab 5: Profil & About */}
        <button
          type="button"
          className={`bottom-nav__item ${activeTab === 'profile' ? 'bottom-nav__item--active' : ''}`}
          onClick={() => onTabChange('profile')}
          aria-label="Profil dan Info Aplikasi"
        >
          <User size={20} className="bottom-nav__icon" />
          <span className="bottom-nav__label">Profil</span>
        </button>
      </div>
    </nav>
  );
};
