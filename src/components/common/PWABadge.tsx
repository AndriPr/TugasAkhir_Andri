import { useState, useEffect } from 'react';
import { Download, WifiOff, X, CheckCircle } from 'lucide-react';

export const PWABadge = () => {
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isOffline, setIsOffline] = useState<boolean>(!navigator.onLine);
  const [installed, setInstalled] = useState<boolean>(false);
  const [dismissed, setDismissed] = useState<boolean>(false);
  const [installSuccess, setInstallSuccess] = useState<boolean>(false);

  useEffect(() => {
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    const handleAppInstalled = () => {
      setInstalled(true);
      setInstallPrompt(null);
      setInstallSuccess(true);
      setTimeout(() => setInstallSuccess(false), 4000);
    };

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstalled(true);
    }
    setInstallPrompt(null);
  };

  if (dismissed) return null;

  // Banner Notifikasi Sukses Terpasang
  if (installSuccess) {
    return (
      <aside className="pwa-toast pwa-toast--success">
        <CheckCircle size={18} />
        <span>LostFind berhasil diinstal di perangkat Anda!</span>
      </aside>
    );
  }

  // Banner Saat Bekerja Offline
  if (isOffline) {
    return (
      <aside className="pwa-toast pwa-toast--offline" role="status" aria-live="polite">
        <WifiOff size={18} />
        <div className="pwa-toast__text">
          <strong>Mode Offline Aktif</strong>
          <span>Data tersimpan di cache lokal dan dapat diakses tanpa internet.</span>
        </div>
      </aside>
    );
  }

  // Banner Ajakan Install PWA
  if (installPrompt && !installed) {
    return (
      <aside className="pwa-install-banner" role="region" aria-label="Install Aplikasi PWA">
        <div className="pwa-install-banner__content">
          <div className="pwa-install-banner__icon">
            <Download size={20} />
          </div>
          <div className="pwa-install-banner__info">
            <strong>Install LostFind PWA</strong>
            <span>Pasang di layar utama HP untuk akses cepat &amp; fitur offline.</span>
          </div>
        </div>
        <div className="pwa-install-banner__actions">
          <button
            type="button"
            className="btn btn--primary btn--sm"
            onClick={handleInstallClick}
          >
            Install
          </button>
          <button
            type="button"
            className="btn-icon-subtle"
            onClick={() => setDismissed(true)}
            aria-label="Tutup banner"
          >
            <X size={16} />
          </button>
        </div>
      </aside>
    );
  }

  return null;
};
