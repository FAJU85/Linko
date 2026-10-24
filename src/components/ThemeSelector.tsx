import React, { useRef } from 'react';
import {
  Palette,
  Check,
  Type,
  Square,
  Sparkles,
  User,
  MapPin,
  BadgeCheck,
  Camera,
  Upload,
  Image as ImageIcon,
} from 'lucide-react';
import { CreatorProfile, CustomTheme } from '../types.ts';
import { THEME_PRESETS } from '../data/mockData.ts';

interface ThemeSelectorProps {
  profile: CreatorProfile;
  setProfile: React.Dispatch<React.SetStateAction<CreatorProfile>>;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({ profile, setProfile }) => {
  const currentTheme = profile.theme;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSelectPreset = (preset: CustomTheme) => {
    setProfile((prev) => ({
      ...prev,
      theme: { ...preset },
    }));
  };

  const handleUpdateTheme = (key: keyof CustomTheme, value: any) => {
    setProfile((prev) => ({
      ...prev,
      theme: {
        ...prev.theme,
        [key]: value,
      },
    }));
  };

  const handleUpdateProfileField = (key: keyof CreatorProfile, value: any) => {
    setProfile((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleAvatarFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          handleUpdateProfileField('avatarUrl', reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const PRESET_AVATARS = [
    {
      name: 'Architect',
      url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
    },
    {
      name: 'Studio',
      url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
    },
    {
      name: 'Technologist',
      url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400',
    },
    {
      name: 'Designer',
      url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=400',
    },
  ];

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Profile Bio & Identity Brick */}
      <div className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/90 shadow-xs space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
              Profile Header & Personal Photo
            </h3>
          </div>
          <span className="text-xs text-neutral-400 font-mono">@{profile.handle}</span>
        </div>

        {/* Avatar Photo Editor */}
        <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-800/40 space-y-3">
          <div className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
            Personal Avatar Photo
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            {/* Avatar Preview */}
            <div className="relative group shrink-0">
              <img
                src={profile.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400'}
                alt={profile.name}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400';
                }}
                className="w-20 h-20 rounded-full object-cover border-2 border-white dark:border-neutral-700 shadow-md ring-2 ring-neutral-200 dark:ring-neutral-800"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer"
                title="Change Photo"
              >
                <Camera className="w-5 h-5" />
              </button>
            </div>

            {/* Upload Controls & URL Input */}
            <div className="flex-1 space-y-2.5 w-full">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={profile.avatarUrl}
                  onChange={(e) => handleUpdateProfileField('avatarUrl', e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                  className="flex-1 px-3 py-1.5 text-xs font-mono rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-neutral-900 dark:bg-sky-600 hover:bg-neutral-800 dark:hover:bg-sky-500 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Local File</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarFileUpload}
                  className="hidden"
                />
              </div>

              {/* Preset Avatars */}
              <div className="flex items-center gap-2 pt-1">
                <span className="text-[11px] text-neutral-400 font-mono">Quick Presets:</span>
                <div className="flex items-center gap-1.5">
                  {PRESET_AVATARS.map((av) => (
                    <button
                      key={av.name}
                      type="button"
                      onClick={() => handleUpdateProfileField('avatarUrl', av.url)}
                      className="text-[10px] font-medium px-2 py-0.5 rounded-md border border-neutral-200 dark:border-neutral-700 hover:border-sky-500 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 cursor-pointer"
                    >
                      {av.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1.5">
              Display Name
            </label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => handleUpdateProfileField('name', e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-neutral-400"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1.5">
              Location / Headquarters
            </label>
            <div className="relative">
              <MapPin className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={profile.location}
                onChange={(e) => handleUpdateProfileField('location', e.target.value)}
                placeholder="e.g. San Francisco, CA"
                className="w-full pl-8 pr-3.5 py-2 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1.5">
            Bio (Tell your followers what you create)
          </label>
          <textarea
            rows={2}
            value={profile.bio}
            onChange={(e) => handleUpdateProfileField('bio', e.target.value)}
            className="w-full px-3.5 py-2 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none resize-none"
          />
        </div>

        <div className="flex items-center gap-3 pt-1">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-neutral-700 dark:text-neutral-300">
            <input
              type="checkbox"
              checked={profile.verified}
              onChange={(e) => handleUpdateProfileField('verified', e.target.checked)}
              className="rounded border-neutral-300 dark:border-neutral-700 text-sky-600 focus:ring-0 cursor-pointer"
            />
            <span className="flex items-center gap-1">
              <BadgeCheck className="w-3.5 h-3.5 text-sky-500" />
              Display Verified Creator Badge
            </span>
          </label>
        </div>
      </div>

      {/* Preset Curated Themes */}
      <div className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/90 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
            Curated Aesthetic Presets
          </h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
          {THEME_PRESETS.map((preset) => {
            const isSelected = currentTheme.id === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                className={`relative flex flex-col p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'border-neutral-900 dark:border-white ring-2 ring-neutral-900/10 dark:ring-white/20'
                    : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
                }`}
                style={{ background: preset.bgColor }}
              >
                {/* Visual miniature preview */}
                <div className="h-16 w-full rounded-lg flex flex-col items-center justify-center p-2 mb-2 gap-1.5 border border-white/10 overflow-hidden">
                  <div
                    className="w-12 h-2.5 rounded-xs"
                    style={{ background: preset.cardBg, border: `1px solid ${preset.cardBorder}` }}
                  />
                  <div
                    className="w-16 h-2.5 rounded-xs"
                    style={{ background: preset.cardBg, border: `1px solid ${preset.cardBorder}` }}
                  />
                </div>

                <div className="flex items-center justify-between w-full mt-auto">
                  <span
                    className="text-xs font-semibold truncate"
                    style={{ color: preset.cardText }}
                  >
                    {preset.name}
                  </span>
                  {isSelected && (
                    <span
                      className="w-4 h-4 rounded-full flex items-center justify-center text-[10px]"
                      style={{ background: preset.accentColor, color: preset.isDark ? '#000' : '#FFF' }}
                    >
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Deep Custom Styling Options */}
      <div className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/90 shadow-xs space-y-6">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
            Custom Appearance & Styling Studio
          </h3>
        </div>

        {/* Button Border Radius */}
        <div>
          <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-2">
            Link Button Corners & Radius
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[
              { id: 'none', label: 'Square (0px)' },
              { id: 'md', label: 'Subtle (8px)' },
              { id: 'xl', label: 'Rounded (16px)' },
              { id: 'full', label: 'Pill Shape' },
            ].map((rad) => (
              <button
                key={rad.id}
                type="button"
                onClick={() => handleUpdateTheme('cardRadius', rad.id)}
                className={`py-2 px-3 text-xs font-medium rounded-lg border transition-colors cursor-pointer text-center ${
                  currentTheme.cardRadius === rad.id
                    ? 'border-neutral-900 dark:border-white bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-semibold'
                    : 'border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                }`}
              >
                {rad.label}
              </button>
            ))}
          </div>
        </div>

        {/* Card Style */}
        <div>
          <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-2">
            Surface Treatment
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[
              { id: 'solid', label: 'Flat Solid' },
              { id: 'glass', label: 'Glassmorphism' },
              { id: 'outline', label: 'Minimal Outline' },
              { id: 'shadow', label: 'Elevated Shadow' },
            ].map((style) => (
              <button
                key={style.id}
                type="button"
                onClick={() => handleUpdateTheme('cardStyle', style.id)}
                className={`py-2 px-3 text-xs font-medium rounded-lg border transition-colors cursor-pointer text-center ${
                  currentTheme.cardStyle === style.id
                    ? 'border-neutral-900 dark:border-white bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-semibold'
                    : 'border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                }`}
              >
                {style.label}
              </button>
            ))}
          </div>
        </div>

        {/* Typography Pairing */}
        <div>
          <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-2">
            Typography Family
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'sans', label: 'Modern Sans (Plus Jakarta)', sample: 'Contemporary & Clean' },
              { id: 'serif', label: 'Editorial Serif (Playfair)', sample: 'Literary & Elegant' },
              { id: 'display', label: 'Neo-Grotesque Display', sample: 'Athletic & Bold' },
            ].map((font) => (
              <button
                key={font.id}
                type="button"
                onClick={() => handleUpdateTheme('fontFamily', font.id)}
                className={`p-3 text-left rounded-lg border transition-colors cursor-pointer ${
                  currentTheme.fontFamily === font.id
                    ? 'border-neutral-900 dark:border-white bg-neutral-100 dark:bg-neutral-800'
                    : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-850'
                }`}
              >
                <div className="text-xs font-semibold text-neutral-900 dark:text-white mb-0.5">
                  {font.label}
                </div>
                <div className="text-[11px] text-neutral-500 dark:text-neutral-400">
                  {font.sample}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Accent Color Palette */}
        <div>
          <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-2">
            Primary Accent & Focus Color
          </label>
          <div className="flex items-center gap-3">
            {['#38BDF8', '#F43F5E', '#10B981', '#818CF8', '#F59E0B', '#EC4899', '#0F172A', '#FFFFFF'].map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => handleUpdateTheme('accentColor', color)}
                className="w-7 h-7 rounded-full border border-neutral-300 dark:border-neutral-700 flex items-center justify-center transition-transform hover:scale-110 cursor-pointer shadow-xs"
                style={{ backgroundColor: color }}
                title={color}
              >
                {currentTheme.accentColor.toLowerCase() === color.toLowerCase() && (
                  <Check
                    className={`w-3.5 h-3.5 stroke-[3] ${
                      color === '#FFFFFF' ? 'text-black' : 'text-white'
                    }`}
                  />
                )}
              </button>
            ))}
            <div className="flex items-center gap-1.5 ml-2">
              <span className="text-xs text-neutral-400 font-mono">Hex:</span>
              <input
                type="text"
                value={currentTheme.accentColor}
                onChange={(e) => handleUpdateTheme('accentColor', e.target.value)}
                className="w-20 px-2 py-1 text-xs font-mono rounded border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
