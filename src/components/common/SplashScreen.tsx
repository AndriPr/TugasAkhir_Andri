import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowRight, Compass, Sparkles } from 'lucide-react';

interface SplashScreenProps {
  onFinish?: () => void;
  duration?: number;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onFinish,
  duration = 2800,
}) => {
  const [isFading, setIsFading] = useState<boolean>(false);
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);
  const dismissedRef = useRef<boolean>(false);

  const handleDismiss = useCallback(() => {
    if (dismissedRef.current) return;
    dismissedRef.current = true;
    setIsFading(true);
    setTimeout(() => {
      if (onFinish) onFinish();
    }, 480);
  }, [onFinish]);

  const handleTapRipple = (e: React.MouseEvent<HTMLDivElement>) => {
    const id = Date.now();
    setRipples((prev) => [...prev, { id, x: e.clientX, y: e.clientY }]);
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    }, 700);
  };

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
      onClick={handleTapRipple}
      role="dialog"
      aria-modal="true"
      aria-label="LostFind Intro"
    >
      {/* Animated Sky Orbs & Drifting Clouds */}
      <div className="splash-sky-orb splash-sky-orb--1" />
      <div className="splash-sky-orb splash-sky-orb--2" />
      <div className="splash-cloud splash-cloud--1" />
      <div className="splash-cloud splash-cloud--2" />

      {/* Interactive Touch Ripples */}
      {ripples.map((r) => (
        <span
          key={r.id}
          className="splash-touch-ripple"
          style={{ left: r.x, top: r.y }}
        />
      ))}

      <div className="splash-card">
        {/* Radar Rings Effect */}
        <div className="splash-radar">
          <div className="radar-circle radar-circle--1" />
          <div className="radar-circle radar-circle--2" />
          <div className="radar-circle radar-circle--3" />
          <div className="splash-logo-wrap">
            <Compass size={38} strokeWidth={2.2} className="splash-compass-spin" />
          </div>
        </div>

        {/* Branding */}
        <div className="splash-brand-group">
          <div className="splash-badge">
            <Sparkles size={13} />
            <span>Campus Lost &amp; Found PWA</span>
          </div>
          <h1 className="splash-title">LostFind</h1>
          <p className="splash-desc">
            Temukan barang hilang di kampus lebih cepat, aman, dan transparan
          </p>
        </div>

        {/* Student Tag */}
        <div className="splash-author-tag">
          <span className="author-name">Andri Pratama</span>
          <span className="author-nim">21120124140134</span>
        </div>

        {/* Enter button */}
        <button
          type="button"
          className="splash-enter-btn"
          onClick={(e) => {
            e.stopPropagation();
            handleDismiss();
          }}
        >
          <span>Jelajahi Kampus</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};
