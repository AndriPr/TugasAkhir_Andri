import React, { useState, useEffect, useCallback } from 'react';
import { ActiveTab, LostFindItem, ItemClaim } from './types';
import { Header } from './components/common/Header';
import { BottomNav } from './components/common/BottomNav';
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
import './App.css';

export function App() {
  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>('lost');
  const [selectedItem, setSelectedItem] = useState<LostFindItem | null>(null);
  const [selectedClaim, setSelectedClaim] = useState<ItemClaim | null>(null);
  const [isOffline, setIsOffline] = useState<boolean>(!navigator.onLine);
  const [myCount, setMyCount] = useState<number>(0);

  // Monitor network online/offline state
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Update count of user's active items
  const refreshUserCounts = useCallback(async () => {
    try {
      const user = getUserProfile();
      const res = await itemService.getItems({ userId: user.userId });
      if (res.success) {
        setMyCount(res.data.length);
      }
    } catch {}
  }, []);

  useEffect(() => {
    refreshUserCounts();
  }, [refreshUserCounts, activeTab]);

  const handleTabChange = (tab: ActiveTab) => {
    setActiveTab(tab);
    setSelectedItem(null);
    setSelectedClaim(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleItemCreated = (newItem: LostFindItem) => {
    refreshUserCounts();
    setSelectedItem(newItem);
    setActiveTab(newItem.type === 'lost' ? 'lost' : 'found');
  };

  const handleItemUpdated = async (updatedItem: LostFindItem) => {
    await itemService.updateItem(updatedItem.id, updatedItem);
    setSelectedItem(updatedItem);
    refreshUserCounts();
  };

  const handleDeleteItem = async (itemId: string) => {
    await itemService.deleteItem(itemId);
    setSelectedItem(null);
    refreshUserCounts();
  };

  const handleUpdateClaimStatus = async (
    claimId: string,
    status: ItemClaim['status']
  ) => {
    const res = await claimService.updateClaimStatus(claimId, status);
    if (res.success && res.data) {
      setSelectedClaim(res.data);
    }
  };

  return (
    <div className="app-shell">
      {/* Splash Screen on First Load / Replay */}
      {showSplash && (
        <SplashScreen onFinish={() => setShowSplash(false)} duration={3200} />
      )}

      {/* Top Application Header */}
      <Header
        activeTab={activeTab}
        onTabChange={handleTabChange}
        isOffline={isOffline}
      />

      {/* Main Content Area */}
      <main className="app-main">
        {/* Halaman 1: Barang Hilang */}
        {activeTab === 'lost' && (
          <LostItemsPage
            onSelectItem={(item) => setSelectedItem(item)}
            onNavigateReport={() => handleTabChange('report')}
          />
        )}

        {/* Halaman 2: Barang Ditemukan */}
        {activeTab === 'found' && (
          <FoundItemsPage
            onSelectItem={(item) => setSelectedItem(item)}
            onNavigateReport={() => handleTabChange('report')}
          />
        )}

        {/* Halaman 3: Buat Laporan */}
        {activeTab === 'report' && (
          <ReportPage
            onSuccess={handleItemCreated}
            onCancel={() => handleTabChange('lost')}
          />
        )}

        {/* Halaman 4: Aktivitas & Klaim Saya */}
        {activeTab === 'activity' && (
          <MyActivityPage
            onSelectItem={(item) => setSelectedItem(item)}
            onSelectClaim={(claim) => setSelectedClaim(claim)}
            onNavigateReport={() => handleTabChange('report')}
            onDeleteItem={handleDeleteItem}
          />
        )}

        {/* Halaman 5: Profil & About */}
        {activeTab === 'profile' && (
          <ProfileAboutPage onReplaySplash={() => setShowSplash(true)} />
        )}
      </main>

      {/* Item Detail Modal (Requirement 4: Klik item memunculkan detail) */}
      <ItemDetailModal
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        onItemUpdated={handleItemUpdated}
        onDeleteItem={handleDeleteItem}
        onClaimSubmitted={() => {
          refreshUserCounts();
        }}
      />

      {/* Claim Detail Modal */}
      <ClaimDetailModal
        claim={selectedClaim}
        onClose={() => setSelectedClaim(null)}
        onUpdateStatus={handleUpdateClaimStatus}
      />

      {/* PWA Install Banner & Offline Toast */}
      <PWABadge />

      {/* Bottom Navigation Bar (Requirement 2) */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={handleTabChange}
        myReportsCount={myCount}
      />
    </div>
  );
}

export default App;
