import React from 'react';
import { PlusCircle, Wifi, WifiOff } from 'lucide-react';
import { ActiveTab } from '../../types';

interface HeaderProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  isOffline: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onTabChange, isOffline }) => {
  return (
    <header className="app-header">
      <div className="header-container">
        <div className="header-brand" onClick={() => onTabChange('lost')}>
          <div className="brand-logo-wrap">
            <img src="/logo.png" alt="LostFind Logo" className="brand-logo" />
          </div>
          <div className="brand-text">
            <h1 className="brand-title">LostFind</h1>
            <span className="brand-subtitle">Kampus Terpadu</span>
          </div>
        </div>

        <div className="header-actions">
          {/* Status Network Badge */}
          <div className={`status-pill ${isOffline ? 'status-pill--offline' : 'status-pill--online'}`}>
            {isOffline ? (
              <>
                <WifiOff size={13} />
                <span>Mode Offline</span>
              </>
            ) : (
              <>
                <Wifi size={13} />
                <span>Online (Sync)</span>
              </>
            )}
          </div>

          {/* Quick Report CTA Button */}
          <button
            type="button"
            className="btn btn--primary btn--sm header-report-btn"
            onClick={() => onTabChange('report')}
            title="Buat Laporan Baru"
          >
            <PlusCircle size={15} />
            <span>Laporkan</span>
          </button>
        </div>
      </div>
    </header>
  );
};
