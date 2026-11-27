import React from 'react';
import { Plus, Wifi, WifiOff, Compass } from 'lucide-react';
import { ActiveTab } from '../../types';

interface HeaderProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  isOffline: boolean;
}

const DESKTOP_TABS: { id: ActiveTab; label: string }[] = [
  { id: 'lost', label: 'Hilang' },
  { id: 'found', label: 'Ditemukan' },
  { id: 'activity', label: 'Aktivitas' },
  { id: 'profile', label: 'Profil' },
];

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  isOffline,
}) => {
  return (
    <header className="app-header">
      <div className="header-container">
        {/* Left Brand (Tripco Cyan Wordmark Style) */}
        <div
          className="header-brand"
          onClick={() => onTabChange('lost')}
          role="button"
          tabIndex={0}
        >
          <div className="brand-logo-wrap">
            <Compass size={20} className="brand-compass-icon" />
          </div>
          <div className="brand-text">
            <h1 className="brand-title">LostFind</h1>
          </div>
        </div>

        {/* Center Minimalist Nav (Desktop/Tablet) */}
        <nav className="header-nav" aria-label="Navigasi Atas">
          {DESKTOP_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`header-nav__link ${
                activeTab === tab.id ? 'header-nav__link--active' : ''
              }`}
              onClick={() => onTabChange(tab.id)}
            >
              {tab.label}
              {activeTab === tab.id && <span className="header-nav__dot" />}
            </button>
          ))}
        </nav>

        {/* Right Actions: Online Pill + Primary CTA Pill */}
        <div className="header-actions">
          <div
            className={`status-pill ${
              isOffline ? 'status-pill--offline' : 'status-pill--online'
            }`}
            title={isOffline ? 'Mode Offline Aktif' : 'Terhubung ke API Server'}
          >
            <span className="status-dot" />
            {isOffline ? (
              <>
                <WifiOff size={13} />
                <span>Offline</span>
              </>
            ) : (
              <>
                <Wifi size={13} />
                <span>Online</span>
              </>
            )}
          </div>

          <button
            type="button"
            className="btn btn--cyan-pill btn--sm header-report-btn"
            onClick={() => onTabChange('report')}
            title="Buat Laporan Baru"
          >
            <Plus size={15} strokeWidth={2.5} />
            <span>Laporkan</span>
          </button>
        </div>
      </div>
    </header>
  );
};
