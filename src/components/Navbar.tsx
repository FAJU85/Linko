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

interface NavbarProps {
  activeTab: 'links' | 'appearance' | 'analytics' | 'monetize' | 'audience' | 'settings';
  setActiveTab: (tab: 'links' | 'appearance' | 'analytics' | 'monetize' | 'audience' | 'settings') => void;
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
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setActiveTab('links');
          }}
          className="text-lg font-bold tracking-tight text-neutral-900 dark:text-white whitespace-nowrap"
        >
          OmniLink
        </a>
        <span className="hidden sm:inline-block text-xs font-mono text-neutral-400 dark:text-neutral-500 truncate max-w-[160px]">
          {customDomain || 'links.studio'}
        </span>
      </div>

      {/* Zone 2: Clean single-line text navigation links */}
      <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-neutral-600 dark:text-neutral-300">
        <button
          type="button"
          onClick={() => setActiveTab('links')}
          className={`cursor-pointer transition-colors whitespace-nowrap pb-0.5 border-b-2 ${
            activeTab === 'links'
              ? 'border-neutral-900 dark:border-white text-neutral-900 dark:text-white font-semibold'
              : 'border-transparent hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          {getTranslation(lang, 'links')}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('appearance')}
          className={`cursor-pointer transition-colors whitespace-nowrap pb-0.5 border-b-2 ${
            activeTab === 'appearance'
              ? 'border-neutral-900 dark:border-white text-neutral-900 dark:text-white font-semibold'
              : 'border-transparent hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          {getTranslation(lang, 'design')}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('analytics')}
          className={`cursor-pointer transition-colors whitespace-nowrap pb-0.5 border-b-2 ${
            activeTab === 'analytics'
              ? 'border-neutral-900 dark:border-white text-neutral-900 dark:text-white font-semibold'
              : 'border-transparent hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          {getTranslation(lang, 'analytics')}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('monetize')}
          className={`cursor-pointer transition-colors whitespace-nowrap pb-0.5 border-b-2 ${
            activeTab === 'monetize'
              ? 'border-neutral-900 dark:border-white text-neutral-900 dark:text-white font-semibold'
              : 'border-transparent hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          {getTranslation(lang, 'monetization')}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('audience')}
          className={`cursor-pointer transition-colors whitespace-nowrap pb-0.5 border-b-2 ${
            activeTab === 'audience'
              ? 'border-neutral-900 dark:border-white text-neutral-900 dark:text-white font-semibold'
              : 'border-transparent hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          {getTranslation(lang, 'subscribers')}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('settings')}
          className={`cursor-pointer transition-colors whitespace-nowrap pb-0.5 border-b-2 ${
            activeTab === 'settings'
              ? 'border-neutral-900 dark:border-white text-neutral-900 dark:text-white font-semibold'
              : 'border-transparent hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          {getTranslation(lang, 'settings')}
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
