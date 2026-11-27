import React from 'react';
import {
  ArrowRight,
  BookOpen,
  Building2,
  Coffee,
  Bike,
  Check,
  ShieldCheck,
  Sparkles,
  MessageCircle,
  Zap,
} from 'lucide-react';
import {
  AnimatedCounter,
  InteractiveTiltCard,
  RevealSection,
} from '../common/MotionPrimitives';

interface CampusDiscoverySectionProps {
  totalItems: number;
  resolvedCount: number;
  onSelectLocation: (loc: string) => void;
  onNavigateReport: () => void;
}

const CAMPUS_ZONES = [
  {
    id: 'zone-lib',
    label: 'PERPUSTAKAAN',
    locationValue: 'Perpustakaan Pusat',
    subtitle: 'Kubikel & Ruang Baca',
    gradient: 'linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)',
    Icon: BookOpen,
  },
  {
    id: 'zone-gkb',
    label: 'GEDUNG KULIAH',
    locationValue: 'Gedung Kuliah Bersama (GKB)',
    subtitle: 'Ruang Kelas & Koridor',
    gradient: 'linear-gradient(135deg, #6366f1 0%, #3b82f6 100%)',
    Icon: Building2,
  },
  {
    id: 'zone-canteen',
    label: 'KANTIN TEKNIK',
    locationValue: 'Kantin Fakultas Teknik',
    subtitle: 'Area Makan & Gazebo',
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)',
    Icon: Coffee,
  },
  {
    id: 'zone-park',
    label: 'PARKIRAN',
    locationValue: 'Parkiran Sepeda Motor Gedung B',
    subtitle: 'Gerbang & Area Parkir',
    gradient: 'linear-gradient(135deg, #10b981 0%, #0d9488 100%)',
    Icon: Bike,
  },
];

export const CampusDiscoverySection: React.FC<CampusDiscoverySectionProps> = ({
  totalItems,
  resolvedCount,
  onSelectLocation,
  onNavigateReport,
}) => {
  return (
    <div className="discovery-sections">
      {/* ================================================================
          SECTION: Feature Highlight Split ("Travel to make sweet memories")
          ================================================================ */}
      <RevealSection className="feature-split-section">
        <div className="section-center-head">
          <h2 className="section-heading-lg">Kembali ke pemilik dengan aman</h2>
          <p className="section-sub-muted">
            Alur pelaporan kampus yang cepat, terverifikasi, dan transparan
          </p>
        </div>

        <div className="feature-split-grid">
          {/* Left Column: 01, 02, 03 Numbered List */}
          <div className="feature-steps-col">
            <div className="feature-step-row">
              <span className="step-chip step-chip--cyan">01</span>
              <div className="step-text">
                <h4>Laporkan kurang dari 1 menit</h4>
                <p>
                  Catat ciri barang, lokasi terakhir, dan unggah foto dengan fitur auto-save draf agar data tidak pernah hilang.
                </p>
              </div>
            </div>

            <div className="feature-step-row">
              <span className="step-chip step-chip--sky">02</span>
              <div className="step-text">
                <h4>Terhubung langsung via WhatsApp</h4>
                <p>
                  Penemu dan pemilik dapat berkomunikasi secara instan tanpa menunggu perantara yang berbelit.
                </p>
              </div>
            </div>

            <div className="feature-step-row">
              <span className="step-chip step-chip--mint">03</span>
              <div className="step-text">
                <h4>Verifikasi ciri di Posko Kampus</h4>
                <p>
                  Setiap klaim barang temuan wajib menyertakan bukti ciri unik untuk menjaga keamanan serah terima.
                </p>
              </div>
            </div>

            <div className="feature-cta-wrap">
              <button
                type="button"
                className="btn btn--cyan-pill"
                onClick={onNavigateReport}
              >
                <span>Mulai Buat Laporan</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>

          {/* Right Column: Interactive 3D Tilt Showcase Card + Floating Badges */}
          <InteractiveTiltCard className="showcase-tilt-card">
            <div className="showcase-art-canvas">
              {/* Scenic Sky + Campus Vector Backdrop */}
              <div className="showcase-sun" />
              <div className="showcase-cloud showcase-cloud--1" />
              <div className="showcase-cloud showcase-cloud--2" />
              <svg
                className="showcase-hills-svg"
                viewBox="0 0 400 220"
                preserveAspectRatio="none"
              >
                <path
                  d="M0,220 L0,130 Q95,70 190,120 T400,95 L400,220 Z"
                  fill="#0ea5e9"
                  opacity="0.35"
                />
                <path
                  d="M0,220 L0,155 Q120,105 240,148 T400,130 L400,220 Z"
                  fill="#0284c7"
                  opacity="0.55"
                />
                <path
                  d="M0,220 L0,180 Q150,150 280,178 T400,165 L400,220 Z"
                  fill="#0f766e"
                  opacity="0.7"
                />
              </svg>

              {/* Center Shield Illustration */}
              <div className="showcase-center-badge">
                <ShieldCheck size={34} />
                <strong>LostFind Terpadu</strong>
                <span>Kampus Aman &amp; Peduli</span>
              </div>
            </div>

            {/* 3 Floating Animated Glass Badges (Tripco Signature!) */}
            <div className="float-glass-card float-glass-card--1">
              <div className="float-avatar float-avatar--cyan">A</div>
              <div className="float-glass-info">
                <strong>Andri Pratama</strong>
                <span>
                  <Sparkles size={11} /> <AnimatedCounter value={totalItems} suffix="+ Laporan" />
                </span>
              </div>
            </div>

            <div className="float-glass-card float-glass-card--2">
              <div className="float-avatar float-avatar--mint">
                <Check size={14} />
              </div>
              <div className="float-glass-info">
                <strong>Pos Satpam Aktif</strong>
                <span>
                  <Zap size={11} /> <AnimatedCounter value={resolvedCount + 12} suffix=" Kembali" />
                </span>
              </div>
            </div>

            <div className="float-glass-card float-glass-card--3">
              <div className="float-avatar float-avatar--amber">
                <MessageCircle size={13} />
              </div>
              <div className="float-glass-info">
                <strong>Respon Cepat WA</strong>
                <span>★ 4.9 Terverifikasi</span>
              </div>
            </div>
          </InteractiveTiltCard>
        </div>
      </RevealSection>

      {/* ================================================================
          SECTION: Campus Zones Grid ("Let's go on an adventure")
          ================================================================ */}
      <RevealSection className="zones-section" delay={80}>
        <div className="section-center-head">
          <h2 className="section-heading-lg">Jelajahi zona kampus</h2>
          <p className="section-sub-muted">
            Pilih area gedung untuk memfilter laporan secara cepat
          </p>
        </div>

        <div className="zones-grid">
          {CAMPUS_ZONES.map((zone, idx) => {
            const IconComp = zone.Icon;
            return (
              <button
                key={zone.id}
                type="button"
                className="zone-tile"
                style={{ '--stagger-i': idx } as React.CSSProperties}
                onClick={() => onSelectLocation(zone.locationValue)}
              >
                <div className="zone-tile__visual" style={{ background: zone.gradient }}>
                  <span className="zone-tile__pin">
                    <Check size={12} strokeWidth={3} />
                  </span>
                  <div className="zone-tile__icon-ring">
                    <IconComp size={30} strokeWidth={1.8} />
                  </div>
                  <span className="zone-tile__sub">{zone.subtitle}</span>
                </div>
                <span className="zone-tile__label">{zone.label}</span>
              </button>
            );
          })}
        </div>
      </RevealSection>

      {/* ================================================================
          SECTION: Interactive Action Banner ("Book tickets and go now!")
          ================================================================ */}
      <RevealSection className="spotlight-cta-section" delay={120}>
        <div className="spotlight-header">
          <div>
            <h2 className="section-heading-lg">Temukan barang tercecer hari ini?</h2>
            <p className="section-sub-muted">
              Satu laporan kecil Anda sangat berarti bagi rekan mahasiswa yang sedang mencari.
            </p>
          </div>
          <button
            type="button"
            className="btn btn--cyan-pill"
            onClick={onNavigateReport}
          >
            Laporkan Sekarang
          </button>
        </div>

        <div className="spotlight-banner" onClick={onNavigateReport} role="button" tabIndex={0}>
          <div className="spotlight-waves" aria-hidden="true">
            <div className="wave-ring wave-ring--1" />
            <div className="wave-ring wave-ring--2" />
            <div className="wave-ring wave-ring--3" />
          </div>

          <div className="spotlight-center-action">
            <div className="spotlight-play-btn">
              <ArrowRight size={24} />
            </div>
            <div className="spotlight-caption">
              <strong>Buka Formulir Laporan Instan</strong>
              <span>Mendukung mode offline &amp; auto-save draf otomatis</span>
            </div>
          </div>
        </div>
      </RevealSection>
    </div>
  );
};
