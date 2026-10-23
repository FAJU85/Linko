import React from 'react';
import {
  Share2,
  ExternalLink,
  Smartphone,
  Layout,
  Sun,
  Moon,
  Globe,
  LogIn,
  LogOut,
  User as UserIcon,
} from 'lucide-react';
import { SupportedLanguage } from '../types.ts';
import { getTranslation } from '../utils/i18n.ts';
import { useAuth } from '../context/AuthContext.tsx';

export type AppActiveTab =
  | 'canvas'
  | 'restaurant'
  | 'qr'
  | 'store'
  | 'links'
  | 'appearance'
  | 'analytics'
  | 'audience'
  | 'settings';

interface NavbarProps {
  activeTab: AppActiveTab;
  setActiveTab: (tab: AppActiveTab) => void;
  lang: SupportedLanguage;
  setLang: (lang: SupportedLanguage) => void;
  isDarkMode: boolean;
  setIsDarkMode: (dark: boolean) => void;
  onOpenShareModal: () => void;
  onOpenPublicView: () => void;
  onOpenAuthModal: () => void;
  showMobileSimulator: boolean;
  setShowMobileSimulator: (show: boolean) => void;
  customDomain: string;
  activeOrdersCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  lang,
  setLang,
  isDarkMode,
  setIsDarkMode,
  onOpenShareModal,
  onOpenPublicView,
  onOpenAuthModal,
  showMobileSimulator,
  setShowMobileSimulator,
  customDomain,
  activeOrdersCount = 0,
}) => {
  const { user, logout } = useAuth();
  const languages: { code: SupportedLanguage; label: string }[] = [
    { code: 'en', label: 'English' },
    { code: 'es', label: 'Español' },
    { code: 'fr', label: 'Français' },
    { code: 'de', label: 'Deutsch' },
    { code: 'ja', label: '日本語' },
    { code: 'pt', label: 'Português' },
  ];

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-6 px-6 py-3.5 border-b transition-colors bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border-neutral-200 dark:border-neutral-800">
      {/* Zone 1: Wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setActiveTab('canvas');
          }}
          className="text-lg font-bold tracking-tight text-neutral-900 dark:text-white whitespace-nowrap flex items-center gap-2"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block animate-pulse" />
          <span>OmniLink</span>
        </a>
        <span className="hidden sm:inline-block text-xs font-mono text-neutral-400 dark:text-neutral-500 truncate max-w-[140px]">
          {customDomain || 'links.studio'}
        </span>
      </div>

      {/* Zone 2: Navigation Links */}
      <nav className="hidden lg:flex items-center gap-5 text-xs font-medium text-neutral-600 dark:text-neutral-300">
        {/* Canvas (Webstudio) */}
        <button
          type="button"
          onClick={() => setActiveTab('canvas')}
          className={`cursor-pointer transition-colors whitespace-nowrap pb-0.5 border-b-2 flex items-center gap-1.5 ${
            activeTab === 'canvas'
              ? 'border-neutral-900 dark:border-white text-neutral-900 dark:text-white font-bold'
              : 'border-transparent hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          <span>Canvas</span>
          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300">
            Webstudio
          </span>
        </button>

        {/* Restaurant Menu & Table KOT */}
        <button
          type="button"
          onClick={() => setActiveTab('restaurant')}
          className={`cursor-pointer transition-colors whitespace-nowrap pb-0.5 border-b-2 flex items-center gap-1.5 ${
            activeTab === 'restaurant'
              ? 'border-amber-500 text-amber-500 font-bold'
              : 'border-transparent hover:text-amber-500'
          }`}
        >
          <span>Restaurant</span>
          {activeOrdersCount > 0 ? (
            <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-amber-500 text-neutral-950">
              {activeOrdersCount}
            </span>
          ) : (
            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-150 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
              KOT
            </span>
          )}
        </button>

        {/* QR Studio (QR Monkey / QRCodeChimp) */}
        <button
          type="button"
          onClick={() => setActiveTab('qr')}
          className={`cursor-pointer transition-colors whitespace-nowrap pb-0.5 border-b-2 flex items-center gap-1.5 ${
            activeTab === 'qr'
              ? 'border-orange-500 text-orange-500 font-bold'
              : 'border-transparent hover:text-orange-500'
          }`}
        >
          <span>QR Studio</span>
          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300">
            Vector
          </span>
        </button>

        {/* Store (Gumroad) */}
        <button
          type="button"
          onClick={() => setActiveTab('store')}
          className={`cursor-pointer transition-colors whitespace-nowrap pb-0.5 border-b-2 flex items-center gap-1.5 ${
            activeTab === 'store'
              ? 'border-pink-600 text-pink-600 dark:border-pink-400 dark:text-pink-400 font-bold'
              : 'border-transparent hover:text-pink-600 dark:hover:text-pink-400'
          }`}
        >
          <span>Store</span>
          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-pink-100 text-pink-700 dark:bg-pink-950/60 dark:text-pink-300">
            Gumroad
          </span>
        </button>

        {/* Links (Linktree / blstrco) */}
        <button
          type="button"
          onClick={() => setActiveTab('links')}
          className={`cursor-pointer transition-colors whitespace-nowrap pb-0.5 border-b-2 ${
            activeTab === 'links'
              ? 'border-neutral-900 dark:border-white text-neutral-900 dark:text-white font-bold'
              : 'border-transparent hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          Links
        </button>

        {/* Analytics */}
        <button
          type="button"
          onClick={() => setActiveTab('analytics')}
          className={`cursor-pointer transition-colors whitespace-nowrap pb-0.5 border-b-2 ${
            activeTab === 'analytics'
              ? 'border-neutral-900 dark:border-white text-neutral-900 dark:text-white font-bold'
              : 'border-transparent hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          Analytics
        </button>

        {/* Settings */}
        <button
          type="button"
          onClick={() => setActiveTab('settings')}
          className={`cursor-pointer transition-colors whitespace-nowrap pb-0.5 border-b-2 ${
            activeTab === 'settings'
              ? 'border-neutral-900 dark:border-white text-neutral-900 dark:text-white font-bold'
              : 'border-transparent hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          Settings
        </button>
      </nav>

      {/* Zone 3: 1 primary action cluster */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* Language switch */}
        <div className="relative flex items-center">
          <Globe className="w-3.5 h-3.5 text-neutral-400 absolute left-2 pointer-events-none" />
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value as SupportedLanguage)}
            className="pl-7 pr-2 py-1.5 text-xs font-medium rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 focus:outline-none cursor-pointer"
            aria-label="Select Language"
          >
            {languages.map((l) => (
              <option key={l.code} value={l.code}>
                {l.label}
              </option>
            ))}
          </select>
        </div>

        {/* Dark mode toggle */}
        <button
          type="button"
          onClick={() => setIsDarkMode(!isDarkMode)}
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          aria-label="Toggle theme mode"
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-neutral-600" />}
        </button>

        {/* Toggle mobile simulator frame in editor */}
        <button
          type="button"
          onClick={() => setShowMobileSimulator(!showMobileSimulator)}
          title={showMobileSimulator ? 'Hide Phone Frame' : 'Show Phone Frame'}
          className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
            showMobileSimulator
              ? 'bg-neutral-100 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-600 text-neutral-900 dark:text-white'
              : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800'
          }`}
        >
          {showMobileSimulator ? <Smartphone className="w-3.5 h-3.5" /> : <Layout className="w-3.5 h-3.5" />}
          <span className="whitespace-nowrap">{showMobileSimulator ? 'Phone View' : 'Editor View'}</span>
        </button>

        {/* Open Public Page */}
        <button
          type="button"
          onClick={onOpenPublicView}
          title={getTranslation(lang, 'viewPublicPage')}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span className="hidden sm:inline whitespace-nowrap">{getTranslation(lang, 'preview')}</span>
        </button>

        {/* Primary Action Button: Share Profile */}
        <button
          type="button"
          onClick={onOpenShareModal}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-sky-600 dark:hover:bg-sky-500 rounded-lg transition-colors shadow-xs whitespace-nowrap cursor-pointer"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>{getTranslation(lang, 'share')}</span>
        </button>

        {/* User Authentication Status */}
        {user ? (
          <div className="flex items-center gap-2 pl-1 border-l border-neutral-200 dark:border-neutral-800 shrink-0">
            <div className="flex items-center gap-1.5">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  className="w-6 h-6 rounded-full border border-neutral-300 dark:border-neutral-700 object-cover"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-neutral-800 dark:bg-neutral-700 text-white text-[10px] font-bold flex items-center justify-center">
                  {(user.displayName || user.email || 'U')[0].toUpperCase()}
                </div>
              )}
              <span className="hidden xl:inline text-xs font-medium text-neutral-700 dark:text-neutral-300 truncate max-w-[100px]">
                {user.displayName || user.email?.split('@')[0]}
              </span>
            </div>

            <button
              type="button"
              onClick={logout}
              title="Sign Out"
              className="p-1.5 text-neutral-400 hover:text-rose-500 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={onOpenAuthModal}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-750 transition-colors shadow-2xs whitespace-nowrap cursor-pointer"
          >
            <LogIn className="w-3.5 h-3.5 text-sky-500" />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
};
