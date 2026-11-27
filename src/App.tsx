import React, { useState, useEffect, useCallback } from 'react';
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
import './App.css';

export function App() {
  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>('lost');
  const [selectedItem, setSelectedItem] = useState<LostFindItem | null>(null);
  const [selectedClaim, setSelectedClaim] = useState<ItemClaim | null>(null);
  const [isOffline, setIsOffline] = useState<boolean>(!navigator.onLine);
  const [myCount, setMyCount] = useState<number>(0);

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
      {showSplash && (
        <SplashScreen onFinish={() => setShowSplash(false)} duration={2800} />
      )}

      <Header
        activeTab={activeTab}
        onTabChange={handleTabChange}
        isOffline={isOffline}
      />

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
