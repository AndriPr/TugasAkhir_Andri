import React, { useState, useEffect, useCallback } from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { ActiveTab, LostFindItem, ItemClaim } from './types';
import { Header } from './components/common/Header';
import { BottomNav } from './components/common/BottomNav';
import { Footer } from './components/common/Footer';
import { PWABadge } from './components/common/PWABadge';
import { SplashScreen } from './components/common/SplashScreen';
import { ItemDetailModal } from './components/items/ItemDetailModal';
import { ClaimDetailModal } from './components/items/ClaimDetailModal';
import { LostItemsPage } from './pages/LostItemsPage';
import { FoundItemsPage } from './pages/FoundItemsPage';
import { ReportPage } from './pages/ReportPage';
import { MyActivityPage } from './pages/MyActivityPage';
import { ProfileAboutPage } from './pages/ProfileAboutPage';
import { itemService } from './services/itemService';
import { claimService } from './services/claimService';
import { getUserProfile } from './services/userService';
import { getPendingSyncCount, processSyncQueue } from './utils/syncQueue';
import './App.css';

export function App() {
  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>('lost');
  const [selectedItem, setSelectedItem] = useState<LostFindItem | null>(null);
  const [selectedClaim, setSelectedClaim] = useState<ItemClaim | null>(null);
  const [isOffline, setIsOffline] = useState<boolean>(!navigator.onLine);
  const [myCount, setMyCount] = useState<number>(0);
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(() =>
    getPendingSyncCount()
  );
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncNotice, setSyncNotice] = useState<{
    text: string;
    variant: 'success' | 'warning';
  } | null>(null);

  const showToastNotice = useCallback(
    (text: string, variant: 'success' | 'warning' = 'success') => {
      setSyncNotice({ text, variant });
      setTimeout(() => setSyncNotice(null), 5000);
    },
    []
  );

  const refreshUserCounts = useCallback(async () => {
    try {
      const user = getUserProfile();
      const res = await itemService.getItems({ userId: user.userId });
      if (res.success) {
        setMyCount(res.data.length);
      }
    } catch {}
  }, []);

  const handleSyncNow = useCallback(async () => {
    if (!navigator.onLine || getPendingSyncCount() === 0) return;
    try {
      setIsSyncing(true);
      const res = await processSyncQueue();
      setPendingSyncCount(res.remainingCount);
      if (res.syncedCount > 0) {
        showToastNotice(
          `${res.syncedCount} data offline berhasil di-upload ke database Supabase!`,
          'success'
        );
        window.dispatchEvent(new CustomEvent('lostfind-data-synced'));
        refreshUserCounts();
      } else if (res.failedCount > 0 && res.lastError) {
        showToastNotice(`Upload tertunda: ${res.lastError}`, 'warning');
      }
    } finally {
      setIsSyncing(false);
    }
  }, [refreshUserCounts, showToastNotice]);

  // Monitor network online/offline state & auto-sync when back online
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      handleSyncNow();
    };
    const handleOffline = () => setIsOffline(true);
    const handleSyncUpdated = () => {
      setPendingSyncCount(getPendingSyncCount());
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('lostfind-sync-updated', handleSyncUpdated);

    // Attempt initial sync on load if online and queue has pending items
    if (navigator.onLine && getPendingSyncCount() > 0) {
      handleSyncNow();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('lostfind-sync-updated', handleSyncUpdated);
    };
  }, [handleSyncNow]);

  useEffect(() => {
    refreshUserCounts();
  }, [refreshUserCounts, activeTab]);

  const handleTabChange = (tab: ActiveTab) => {
    setActiveTab(tab);
    setSelectedItem(null);
    setSelectedClaim(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleItemCreated = (newItem: LostFindItem, synced?: boolean) => {
    refreshUserCounts();
    setPendingSyncCount(getPendingSyncCount());
    setSelectedItem(newItem);
    setActiveTab(newItem.type === 'lost' ? 'lost' : 'found');
    if (synced) {
      showToastNotice('Laporan berhasil diterbitkan ke database Supabase!', 'success');
    } else {
      showToastNotice(
        'Server tidak terjangkau / offline. Disimpan ke antrean lokal untuk sinkronisasi otomatis.',
        'warning'
      );
    }
  };

  const handleItemUpdated = async (updatedItem: LostFindItem) => {
    const res = await itemService.updateItem(updatedItem.id, updatedItem);
    setSelectedItem(res.data || updatedItem);
    setPendingSyncCount(getPendingSyncCount());
    refreshUserCounts();
  };

  const handleDeleteItem = async (itemId: string) => {
    await itemService.deleteItem(itemId);
    setSelectedItem(null);
    setPendingSyncCount(getPendingSyncCount());
    refreshUserCounts();
  };

  const handleUpdateClaimStatus = async (
    claimId: string,
    status: ItemClaim['status']
  ) => {
    const res = await claimService.updateClaimStatus(claimId, status);
    if (res.success && res.data) {
      setSelectedClaim(res.data);
      setPendingSyncCount(getPendingSyncCount());
    }
  };

  return (
    <div className="app-shell">
      {showSplash && (
        <SplashScreen onFinish={() => setShowSplash(false)} duration={2800} />
      )}

      <Header
        activeTab={activeTab}
        onTabChange={handleTabChange}
        isOffline={isOffline}
        pendingSyncCount={pendingSyncCount}
        isSyncing={isSyncing}
        onSyncNow={handleSyncNow}
      />

      {syncNotice && (
        <div
          className={`sync-floating-toast ${
            syncNotice.variant === 'warning' ? 'sync-floating-toast--warning' : ''
          }`}
          role="status"
        >
          {syncNotice.variant === 'warning' ? (
            <AlertCircle size={18} />
          ) : (
            <CheckCircle2 size={18} />
          )}
          <span>{syncNotice.text}</span>
        </div>
      )}

      <main className="app-main" key={activeTab}>
        {activeTab === 'lost' && (
          <LostItemsPage
            onSelectItem={(item) => setSelectedItem(item)}
            onNavigateReport={() => handleTabChange('report')}
          />
        )}

        {activeTab === 'found' && (
          <FoundItemsPage
            onSelectItem={(item) => setSelectedItem(item)}
            onNavigateReport={() => handleTabChange('report')}
          />
        )}

        {activeTab === 'report' && (
          <ReportPage
            onSuccess={handleItemCreated}
            onCancel={() => handleTabChange('lost')}
          />
        )}

        {activeTab === 'activity' && (
          <MyActivityPage
            onSelectItem={(item) => setSelectedItem(item)}
            onSelectClaim={(claim) => setSelectedClaim(claim)}
            onNavigateReport={() => handleTabChange('report')}
            onDeleteItem={handleDeleteItem}
            pendingSyncCount={pendingSyncCount}
            isSyncing={isSyncing}
            isOffline={isOffline}
            onSyncNow={handleSyncNow}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileAboutPage onReplaySplash={() => setShowSplash(true)} />
        )}

        <Footer onTabChange={handleTabChange} />
      </main>

      <ItemDetailModal
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        onItemUpdated={handleItemUpdated}
        onDeleteItem={handleDeleteItem}
        onClaimSubmitted={() => {
          setPendingSyncCount(getPendingSyncCount());
          refreshUserCounts();
        }}
      />

      <ClaimDetailModal
        claim={selectedClaim}
        onClose={() => setSelectedClaim(null)}
        onUpdateStatus={handleUpdateClaimStatus}
      />

      <PWABadge />

      <BottomNav
        activeTab={activeTab}
        onTabChange={handleTabChange}
        myReportsCount={myCount}
      />
    </div>
  );
}

export default App;
