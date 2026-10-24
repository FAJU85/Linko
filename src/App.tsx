import React, { useState, useEffect } from 'react';
import {
  CreatorProfile,
  LinkItem,
  AnalyticsData,
  SubscriberRecord,
  TipTransaction,
  SupportedLanguage,
  DigitalProduct,
  ProductOrder,
  MenuItem,
  TableOrder,
  CanvasBlock,
} from './types.ts';
import {
  INITIAL_CREATOR_PROFILE,
  INITIAL_LINKS,
  INITIAL_ANALYTICS,
  INITIAL_SUBSCRIBERS,
  INITIAL_TIPS,
  INITIAL_PRODUCTS,
  INITIAL_ORDERS,
  INITIAL_MENU_ITEMS,
  INITIAL_TABLE_ORDERS,
  INITIAL_CANVAS_BLOCKS,
} from './data/mockData.ts';
import { Navbar, AppActiveTab } from './components/Navbar.tsx';
import { WebstudioCanvas } from './components/Builder/WebstudioCanvas.tsx';
import { RestaurantTab } from './components/Restaurant/RestaurantTab.tsx';
import { TableOrderModal } from './components/Restaurant/TableOrderModal.tsx';
import { QRStudioTab } from './components/QRStudio/QRStudioTab.tsx';
import { LinksEditor } from './components/LinksEditor.tsx';
import { ThemeSelector } from './components/ThemeSelector.tsx';
import { AnalyticsDashboard } from './components/AnalyticsDashboard.tsx';
import { MonetizationTab } from './components/MonetizationTab.tsx';
import { DigitalStoreTab } from './components/DigitalStore/DigitalStoreTab.tsx';
import { SubscribersTab } from './components/SubscribersTab.tsx';
import { SettingsTab } from './components/SettingsTab.tsx';
import { PublicProfileView } from './components/PublicProfileView.tsx';
import { ShareModal } from './components/ShareModal.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { updateDynamicMetaTags } from './utils/seo.ts';
import { saveCreatorToFirestore, saveTableOrderToFirestore } from './firebase/firestoreSync.ts';
import { Smartphone, ExternalLink } from 'lucide-react';

function AppInner() {
  const { user } = useAuth();

  // Creator Profile State
  const [profile, setProfile] = useState<CreatorProfile>(() => {
    const saved = localStorage.getItem('omnilink_profile');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    return INITIAL_CREATOR_PROFILE;
  });

  // Sync authenticated user info into profile if signed in
  useEffect(() => {
    if (user) {
      setProfile((prev) => ({
        ...prev,
        name: user.displayName || prev.name,
        avatarUrl: user.photoURL || prev.avatarUrl,
      }));
    }
  }, [user]);

  // Links & Blocks State
  const [links, setLinks] = useState<LinkItem[]>(() => {
    const saved = localStorage.getItem('omnilink_links');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    return INITIAL_LINKS;
  });

  // Real-time Analytics
  const [analytics, setAnalytics] = useState<AnalyticsData>(() => {
    const saved = localStorage.getItem('omnilink_analytics');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    return INITIAL_ANALYTICS;
  });

  // Subscribers
  const [subscribers, setSubscribers] = useState<SubscriberRecord[]>(() => {
    const saved = localStorage.getItem('omnilink_subscribers');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    return INITIAL_SUBSCRIBERS;
  });

  // Tips
  const [tips, setTips] = useState<TipTransaction[]>(() => {
    const saved = localStorage.getItem('omnilink_tips');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    return INITIAL_TIPS;
  });

  // Products & Orders (Gumroad Creator Commerce)
  const [products, setProducts] = useState<DigitalProduct[]>(() => {
    const saved = localStorage.getItem('omnilink_products');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return INITIAL_PRODUCTS;
  });

  const [orders, setOrders] = useState<ProductOrder[]>(() => {
    const saved = localStorage.getItem('omnilink_orders');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return INITIAL_ORDERS;
  });

  // Restaurant Menu & Table Ordering State
  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    const saved = localStorage.getItem('omnilink_menu_items');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return INITIAL_MENU_ITEMS;
  });

  const [tableOrders, setTableOrders] = useState<TableOrder[]>(() => {
    const saved = localStorage.getItem('omnilink_table_orders');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return INITIAL_TABLE_ORDERS;
  });

  // Webstudio Visual Canvas Blocks
  const [canvasBlocks, setCanvasBlocks] = useState<CanvasBlock[]>(() => {
    const saved = localStorage.getItem('omnilink_canvas_blocks');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return INITIAL_CANVAS_BLOCKS;
  });

  // Workspace Navigation & Controls
  const [activeTab, setActiveTab] = useState<AppActiveTab>('canvas');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [lang, setLang] = useState<SupportedLanguage>('en');
  const [showMobileSimulator, setShowMobileSimulator] = useState<boolean>(true);
  const [showFullPublicView, setShowFullPublicView] = useState<boolean>(false);
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);

  // Sync dark mode class with HTML element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Sync language and direction (RTL for Arabic)
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);

  // Persist local changes and Firestore sync
  useEffect(() => {
    localStorage.setItem('omnilink_profile', JSON.stringify(profile));
    updateDynamicMetaTags(profile);
    if (user) {
      saveCreatorToFirestore(user.uid, profile, canvasBlocks, menuItems, products);
    }
  }, [profile, user, canvasBlocks, menuItems, products]);

  useEffect(() => {
    localStorage.setItem('omnilink_menu_items', JSON.stringify(menuItems));
  }, [menuItems]);

  useEffect(() => {
    localStorage.setItem('omnilink_table_orders', JSON.stringify(tableOrders));
  }, [tableOrders]);

  useEffect(() => {
    localStorage.setItem('omnilink_canvas_blocks', JSON.stringify(canvasBlocks));
  }, [canvasBlocks]);

  useEffect(() => {
    localStorage.setItem('omnilink_links', JSON.stringify(links));
  }, [links]);

  useEffect(() => {
    localStorage.setItem('omnilink_analytics', JSON.stringify(analytics));
  }, [analytics]);

  useEffect(() => {
    localStorage.setItem('omnilink_subscribers', JSON.stringify(subscribers));
  }, [subscribers]);

  useEffect(() => {
    localStorage.setItem('omnilink_tips', JSON.stringify(tips));
  }, [tips]);

  useEffect(() => {
    localStorage.setItem('omnilink_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('omnilink_orders', JSON.stringify(orders));
  }, [orders]);

  // Handle new dine-in table order
  const handleAddTableOrder = (newOrder: TableOrder) => {
    setTableOrders((prev) => [newOrder, ...prev]);
    saveTableOrderToFirestore(newOrder);

    // Update analytics revenue
    setAnalytics((prev) => ({
      ...prev,
      totalRevenue: prev.totalRevenue + newOrder.totalAmount,
      totalClicks: prev.totalClicks + 1,
    }));
  };

  // Handle new digital product order in real time
  const handleAddOrder = (newOrder: ProductOrder) => {
    setOrders((prev) => [newOrder, ...prev]);
    setProducts((prev) =>
      prev.map((p) =>
        p.id === newOrder.productId ? { ...p, salesCount: p.salesCount + 1 } : p
      )
    );
    setAnalytics((prev) => ({
      ...prev,
      totalRevenue: prev.totalRevenue + newOrder.amountPaid,
      totalClicks: prev.totalClicks + 1,
    }));
  };

  // Handle new newsletter subscriber in real time
  const handleAddSubscriber = (newSub: SubscriberRecord) => {
    setSubscribers((prev) => [newSub, ...prev]);
    setAnalytics((prev) => ({
      ...prev,
      subscribersCount: prev.subscribersCount + 1,
      totalViews: prev.totalViews + 1,
    }));
  };

  // Handle new tip in real time
  const handleAddTip = (newTip: TipTransaction) => {
    setTips((prev) => [newTip, ...prev]);
    setAnalytics((prev) => ({
      ...prev,
      totalRevenue: prev.totalRevenue + newTip.amount,
      totalClicks: prev.totalClicks + 1,
    }));

    // If tip goal is configured on the link, update it
    setLinks((prev) =>
      prev.map((l) =>
        l.type === 'tip_jar' && l.tipGoal
          ? {
              ...l,
              tipGoal: {
                ...l.tipGoal,
                current: l.tipGoal.current + newTip.amount,
              },
            }
          : l
      )
    );
  };

  // Standalone Table Order modal state
  const [showOrderModal, setShowOrderModal] = useState(false);
  const activeOrdersCount = tableOrders.filter(
    (o) => o.status === 'Received' || o.status === 'Preparing'
  ).length;

  // If user requests full-screen public view
  if (showFullPublicView) {
    return (
      <div className={isDarkMode ? 'dark' : ''}>
        <PublicProfileView
          profile={profile}
          links={links}
          setLinks={setLinks}
          products={products}
          menuItems={menuItems}
          blocks={canvasBlocks}
          tableOrders={tableOrders}
          onAddSubscriber={handleAddSubscriber}
          onAddTip={handleAddTip}
          onAddOrder={handleAddOrder}
          onAddTableOrder={handleAddTableOrder}
          lang={lang}
          isStandalone={true}
          onCloseStandalone={() => setShowFullPublicView(false)}
          onOpenShareModal={() => setShowShareModal(true)}
        />
        <ShareModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          profile={profile}
        />
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
        />
      </div>
    );
  }

  return (
    <div className={`min-h-[100dvh] flex flex-col bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 transition-colors`}>
      {/* Top Bar Contract Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        lang={lang}
        setLang={setLang}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        onOpenShareModal={() => setShowShareModal(true)}
        onOpenPublicView={() => setShowFullPublicView(true)}
        onOpenAuthModal={() => setShowAuthModal(true)}
        showMobileSimulator={showMobileSimulator}
        setShowMobileSimulator={setShowMobileSimulator}
        customDomain={profile.customDomain}
        activeOrdersCount={activeOrdersCount}
      />

      {/* Main Studio Viewport (2-column split with Live Mobile Simulator) */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left Column: Active Editor Workspace */}
        <section
          aria-label="Editor Workspace"
          className="flex-1 overflow-y-auto px-4 sm:px-6 md:px-10 py-5 sm:py-8 max-w-6xl w-full mx-auto"
        >
          {activeTab === 'canvas' && (
            <WebstudioCanvas
              blocks={canvasBlocks}
              setBlocks={setCanvasBlocks}
              menuItems={menuItems}
              products={products}
              onOpenTableOrderModal={() => setShowOrderModal(true)}
            />
          )}

          {activeTab === 'restaurant' && (
            <RestaurantTab
              menuItems={menuItems}
              setMenuItems={setMenuItems}
              tableOrders={tableOrders}
              setTableOrders={setTableOrders}
              onOpenQRStudioWithTable={() => setActiveTab('qr')}
              restaurantName={profile.name}
            />
          )}

          {activeTab === 'qr' && (
            <QRStudioTab
              currentUrl={profile.customDomain ? `https://${profile.customDomain}` : `https://omnilink.me/${profile.handle}`}
              creatorName={profile.name}
              creatorHandle={profile.handle}
            />
          )}

          {activeTab === 'store' && (
            <DigitalStoreTab
              products={products}
              setProducts={setProducts}
              orders={orders}
              setOrders={setOrders}
              profile={profile}
            />
          )}

          {activeTab === 'links' && (
            <LinksEditor
              links={links}
              setLinks={setLinks}
              totalViews={analytics.totalViews}
            />
          )}

          {activeTab === 'appearance' && (
            <ThemeSelector profile={profile} setProfile={setProfile} />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsDashboard
              analytics={analytics}
              links={links}
              subscribers={subscribers}
              tips={tips}
              profile={profile}
              orders={orders}
            />
          )}

          {activeTab === 'audience' && (
            <SubscribersTab
              subscribers={subscribers}
              setSubscribers={setSubscribers}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsTab profile={profile} setProfile={setProfile} />
          )}
        </section>

        {/* Right Column: Live Mobile Smartphone Simulator Frame */}
        {showMobileSimulator && (
          <aside
            aria-label="Live Mobile Simulator"
            className="hidden xl:flex w-[460px] border-l border-neutral-200 dark:border-neutral-800 bg-neutral-100/60 dark:bg-neutral-900/40 p-8 flex-col items-center justify-center shrink-0 sticky top-[61px] h-[calc(100vh-61px)]"
          >
            {/* Simulator Header Label */}
            <div className="flex items-center justify-between w-full max-w-[340px] mb-3 text-xs text-neutral-500 dark:text-neutral-400">
              <span className="flex items-center gap-1.5 font-medium">
                <Smartphone className="w-3.5 h-3.5" />
                Live Preview
              </span>
              <button
                type="button"
                onClick={() => setShowFullPublicView(true)}
                className="flex items-center gap-1 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                <span>Full Page</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>

            {/* Realistic Smartphone Shell (340px x 680px) */}
            <div className="relative w-[340px] h-[680px] rounded-[44px] p-3 shadow-2xl border-4 border-neutral-800 dark:border-neutral-700 bg-neutral-900 ring-1 ring-black/20 flex flex-col overflow-hidden">
              {/* Dynamic Island / Speaker Notch */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-4 bg-black rounded-full z-40 flex items-center justify-end pr-2">
                <span className="w-2 h-2 rounded-full bg-neutral-800" />
              </div>

              {/* Screen Area (Scrollable interactive public page) */}
              <div className="relative w-full h-full rounded-[34px] overflow-y-auto overflow-x-hidden pt-7 select-none">
                <PublicProfileView
                  profile={profile}
                  links={links}
                  setLinks={setLinks}
                  products={products}
                  menuItems={menuItems}
                  blocks={canvasBlocks}
                  tableOrders={tableOrders}
                  onAddSubscriber={handleAddSubscriber}
                  onAddTip={handleAddTip}
                  onAddOrder={handleAddOrder}
                  onAddTableOrder={handleAddTableOrder}
                  lang={lang}
                  isStandalone={false}
                  onOpenShareModal={() => setShowShareModal(true)}
                />
              </div>

              {/* Bottom Home Indicator Bar */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-white/40 rounded-full pointer-events-none z-30" />
            </div>
          </aside>
        )}
      </main>

      {/* Standalone Table Order Simulator Modal */}
      <TableOrderModal
        isOpen={showOrderModal}
        onClose={() => setShowOrderModal(false)}
        menuItems={menuItems}
        restaurantName={profile.name}
        onPlaceOrder={handleAddTableOrder}
      />

      {/* Share Profile & Campaign UTM Modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        profile={profile}
      />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}
