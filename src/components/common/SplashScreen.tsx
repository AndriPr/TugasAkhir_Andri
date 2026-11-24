import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowRight, Search, ShieldCheck } from 'lucide-react';

interface SplashScreenProps {
  onFinish?: () => void;
  duration?: number;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onFinish,
  duration = 3200,
}) => {
  const [isFading, setIsFading] = useState<boolean>(false);
  const dismissedRef = useRef<boolean>(false);

  const handleDismiss = useCallback(() => {
    if (dismissedRef.current) return;
    dismissedRef.current = true;
    setIsFading(true);
    setTimeout(() => {
      if (onFinish) onFinish();
    }, 500);
  }, [onFinish]);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleDismiss();
    }, duration);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === ' ' || e.key === 'Enter') {
        handleDismiss();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [duration, handleDismiss]);

  return (
    <div
      className={`splash-overlay ${isFading ? 'splash-overlay--fading' : ''}`}
      onClick={handleDismiss}
      role="dialog"
      aria-modal="true"
      aria-label="LostFind Intro"
    >
      <div className="splash-ambient-glow" />

      <div className="splash-card">
        {/* Radar Rings Effect */}
        <div className="splash-radar">
          <div className="radar-circle radar-circle--1" />
          <div className="radar-circle radar-circle--2" />
          <div className="radar-circle radar-circle--3" />
          <div className="splash-logo-wrap">
            <img src="/logo.png" alt="LostFind Logo" className="splash-logo" />
          </div>
        </div>

        {/* Branding */}
        <div className="splash-brand-group">
          <div className="splash-badge">
            <ShieldCheck size={14} />
            <span>PWA &amp; Web Service</span>
          </div>
          <h1 className="splash-title">LostFind</h1>
          <p className="splash-desc">
            Aplikasi Pelaporan &amp; Pencarian Barang Hilang di Kampus
          </p>
        </div>

        {/* Student Tag */}
        <div className="splash-author-tag">
          <span className="author-name">Andri Pratama</span>
          <span className="author-nim">NIM 21120124140134</span>
        </div>

        {/* Skip button */}
        <button
          type="button"
          className="splash-enter-btn"
          onClick={(e) => {
            e.stopPropagation();
            handleDismiss();
          }}
        >
          <span>Masuk Aplikasi</span>
          <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
};
