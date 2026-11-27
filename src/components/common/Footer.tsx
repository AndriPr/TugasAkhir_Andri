import React from 'react';
import { Compass, ShieldCheck, ArrowRight } from 'lucide-react';
import { ActiveTab } from '../../types';

interface FooterProps {
  onTabChange: (tab: ActiveTab) => void;
}

export const Footer: React.FC<FooterProps> = ({ onTabChange }) => {
  return (
    <footer className="app-footer">
      <div className="footer-grid">
        <div className="footer-brand-col">
          <div className="footer-brand-logo" onClick={() => onTabChange('lost')}>
            <Compass size={20} />
            <span>LostFind</span>
          </div>
          <p className="footer-tagline">
            Sistem pelaporan &amp; pencarian barang hilang terintegrasi untuk seluruh civitas akademika kampus.
          </p>
          <div className="footer-student-pill">
            <ShieldCheck size={14} />
            <span>Andri Pratama • 21120124140134</span>
          </div>
        </div>

        <div className="footer-links-col">
          <h5>Navigasi</h5>
          <button type="button" onClick={() => onTabChange('lost')}>Barang Hilang</button>
          <button type="button" onClick={() => onTabChange('found')}>Barang Temuan</button>
          <button type="button" onClick={() => onTabChange('report')}>Buat Laporan</button>
          <button type="button" onClick={() => onTabChange('activity')}>Aktivitas Saya</button>
        </div>

        <div className="footer-links-col">
          <h5>Kampus</h5>
          <button type="button" onClick={() => onTabChange('profile')}>Profil Pengembang</button>
          <button type="button" onClick={() => onTabChange('profile')}>Posko Keamanan</button>
          <button type="button" onClick={() => onTabChange('profile')}>Panduan Klaim</button>
        </div>

        <div className="footer-cta-col">
          <h5>Siap Melapor?</h5>
          <p>Punya info barang tercecer? Bantu teman kampus menemukannya hari ini.</p>
          <button
            type="button"
            className="footer-quick-btn"
            onClick={() => onTabChange('report')}
          >
            <span>Lapor Sekarang</span>
            <span className="footer-quick-circle">
              <ArrowRight size={14} />
            </span>
          </button>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© 2026 LostFind Campus PWA — Tugas Akhir PPB</span>
        <span>TypeScript • React • Express REST API</span>
      </div>
    </footer>
  );
};
