import React, { useState, useEffect } from 'react';
import {
  Lock,
  Unlock,
  Check,
  AlertCircle,
  ExternalLink,
  Coffee,
  Crown,
  Mail,
  Music,
  Share2,
  Heart,
  BadgeCheck,
  Shield,
  Play,
  Pause,
  X,
  MapPin,
  Sparkles,
  ShoppingBag,
  Utensils,
  ChefHat,
  QrCode,
  Video,
} from 'lucide-react';
import {
  CreatorProfile,
  LinkItem,
  SubscriberRecord,
  TipTransaction,
  SupportedLanguage,
  DigitalProduct,
  ProductOrder,
  MenuItem,
  TableOrder,
  CanvasBlock,
} from '../types.ts';
import { getTranslation } from '../utils/i18n.ts';
import {
  notifyNewTip,
  notifyNewSubscriber,
  notifySecretUnlocked,
  notifyTierSubscribed,
} from '../utils/telegram.ts';
import { updateDynamicMetaTags } from '../utils/seo.ts';
import { ProductCard } from './DigitalStore/ProductCard.tsx';
import { TableOrderModal } from './Restaurant/TableOrderModal.tsx';

interface PublicProfileViewProps {
  profile: CreatorProfile;
  links: LinkItem[];
  setLinks: React.Dispatch<React.SetStateAction<LinkItem[]>>;
  products?: DigitalProduct[];
  menuItems?: MenuItem[];
  blocks?: CanvasBlock[];
  tableOrders?: TableOrder[];
  onAddSubscriber: (sub: SubscriberRecord) => void;
  onAddTip: (tip: TipTransaction) => void;
  onAddOrder?: (order: ProductOrder) => void;
  onAddTableOrder?: (order: TableOrder) => void;
  initialTable?: string;
  lang: SupportedLanguage;
  isStandalone?: boolean;
  onCloseStandalone?: () => void;
  onOpenShareModal?: () => void;
}

export const PublicProfileView: React.FC<PublicProfileViewProps> = ({
  profile,
  links,
  setLinks,
  products = [],
  menuItems = [],
  blocks = [],
  tableOrders = [],
  onAddSubscriber,
  onAddTip,
  onAddOrder,
  onAddTableOrder,
  initialTable = 'Table 4',
  lang,
  isStandalone = false,
  onCloseStandalone,
  onOpenShareModal,
}) => {
  const [showTableOrderModal, setShowTableOrderModal] = useState(false);
  const theme = profile.theme;

  const activeTableOrder = tableOrders.find(
    (o) => o.tableNumber.toLowerCase() === initialTable.toLowerCase() && o.status !== 'Paid'
  );

  useEffect(() => {
    updateDynamicMetaTags(profile);
  }, [profile]);

  // Password Unlock Challenge Modal State
  const [lockedLinkSelected, setLockedLinkSelected] = useState<LinkItem | null>(null);
  const [enteredPassword, setEnteredPassword] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [unlockedLinks, setUnlockedLinks] = useState<Record<string, boolean>>({});

  // Tip Jar Modal / In-Page State
  const [selectedTipAmount, setSelectedTipAmount] = useState<number>(5);
  const [customTipAmount, setCustomTipAmount] = useState<string>('');
  const [supporterName, setSupporterName] = useState('');
  const [supporterMessage, setSupporterMessage] = useState('');
  const [tipSuccessMessage, setTipSuccessMessage] = useState<string | null>(null);

  // Newsletter Form State
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterGdpr, setNewsletterGdpr] = useState(true);
  const [newsletterSuccess, setNewsletterSuccess] = useState(false);

  // Tiers Modal / Billing Cadence
  const [billingCadence, setBillingCadence] = useState<'monthly' | 'yearly'>('monthly');
  const [subscribedTierSuccess, setSubscribedTierSuccess] = useState<string | null>(null);

  // Cookie Banner state
  const [cookieAccepted, setCookieAccepted] = useState(false);

  // Simulated Spotify player
  const [isPlayingSpotify, setIsPlayingSpotify] = useState(false);

  // Helper: Increment link clicks
  const handleLinkClick = (link: LinkItem, e?: React.MouseEvent) => {
    if (link.type === 'password' && !unlockedLinks[link.id]) {
      e?.preventDefault();
      setLockedLinkSelected(link);
      setEnteredPassword('');
      setPasswordError(false);
      return;
    }

    // Increment click telemetry
    setLinks((prev) =>
      prev.map((l) => (l.id === link.id ? { ...l, clicks: l.clicks + 1 } : l))
    );
  };

  // Submit Password Challenge
  const handleUnlockPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lockedLinkSelected) return;

    if (enteredPassword.trim() === (lockedLinkSelected.password || 'creative2026')) {
      setUnlockedLinks((prev) => ({ ...prev, [lockedLinkSelected.id]: true }));
      setPasswordError(false);
      notifySecretUnlocked(lockedLinkSelected.title);
      const targetUrl = lockedLinkSelected.url;
      setLockedLinkSelected(null);
      if (targetUrl) {
        window.open(targetUrl, '_blank', 'noopener,noreferrer');
      }
    } else {
      setPasswordError(true);
    }
  };

  // Submit Newsletter Signup
  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim() || !newsletterGdpr) return;

    const newSub: SubscriberRecord = {
      id: `sub-${Date.now()}`,
      email: newsletterEmail.trim(),
      source: 'Public Profile Newsletter Block',
      date: new Date().toISOString().replace('T', ' ').slice(0, 16),
      gdprConsent: true,
    };

    onAddSubscriber(newSub);
    notifyNewSubscriber(newSub.email, newSub.source);
    setNewsletterSuccess(true);
    setNewsletterEmail('');
    setTimeout(() => setNewsletterSuccess(false), 4000);
  };

  // Submit Tip
  const handleSendTip = (e: React.FormEvent) => {
    e.preventDefault();
    const finalAmount = customTipAmount ? parseFloat(customTipAmount) : selectedTipAmount;
    if (!finalAmount || isNaN(finalAmount) || finalAmount <= 0) return;

    const newTip: TipTransaction = {
      id: `tip-${Date.now()}`,
      amount: finalAmount,
      supporterName: supporterName.trim() || 'Generous Supporter',
      message: supporterMessage.trim() || 'Keep up the fantastic work!',
      date: new Date().toISOString().replace('T', ' ').slice(0, 16),
      status: 'completed',
    };

    onAddTip(newTip);
    notifyNewTip(newTip.amount, newTip.supporterName, newTip.message);
    setTipSuccessMessage(`Thank you for your $${finalAmount.toFixed(2)} contribution!`);
    setCustomTipAmount('');
    setSupporterName('');
    setSupporterMessage('');
    setTimeout(() => setTipSuccessMessage(null), 4000);
  };

  // Subscribe to tier
  const handleSubscribeTier = (tierName: string) => {
    setSubscribedTierSuccess(tierName);
    notifyTierSubscribed(tierName, billingCadence, 0);
    setTimeout(() => setSubscribedTierSuccess(null), 3500);
  };

  // Dynamic Card Radius Style
  const getRadiusClass = () => {
    switch (theme.cardRadius) {
      case 'none':
        return 'rounded-none';
      case 'md':
        return 'rounded-lg';
      case 'xl':
        return 'rounded-2xl';
      case 'full':
        return 'rounded-full';
      default:
        return 'rounded-xl';
    }
  };

  // Font family class
  const getFontFamilyStyle = () => {
    if (theme.fontFamily === 'serif') return { fontFamily: 'var(--font-serif)' };
    if (theme.fontFamily === 'display') return { fontFamily: 'var(--font-display)' };
    return { fontFamily: 'var(--font-sans)' };
  };

  // Active links sorted by order
  const activeLinks = links
    .filter((l) => l.isActive)
    .sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return a.order - b.order;
    });

  // Active canvas blocks sorted by order
  const activeBlocks = blocks
    .filter((b) => b.visible)
    .sort((a, b) => a.order - b.order);

  const getBlockRadiusClass = (override?: string) => {
    const rad = override || theme.cardRadius;
    switch (rad) {
      case 'none':
        return 'rounded-none';
      case 'sm':
        return 'rounded-md';
      case 'md':
        return 'rounded-lg';
      case 'xl':
        return 'rounded-2xl';
      case 'full':
        return 'rounded-full';
      default:
        return 'rounded-xl';
    }
  };

  const getBlockCardStyle = (styling?: any) => {
    const style = styling?.cardStyle || theme.cardStyle;
    const isGlow = style === 'glow';
    return {
      backgroundColor: styling?.bgOverride || theme.cardBg,
      borderColor: isGlow ? (styling?.accentColor || theme.accentColor) : theme.cardBorder,
      backdropFilter: style === 'glass' ? 'blur(16px)' : undefined,
      color: styling?.textColor || theme.cardText,
      boxShadow: isGlow ? `0 0 20px ${(styling?.accentColor || theme.accentColor)}55` : undefined,
    };
  };

  const getBlockAnimationClass = (styling?: any) => {
    if (styling?.animation === 'pulse') return 'animate-pulse';
    if (styling?.animation === 'bounce') return 'animate-bounce';
    return '';
  };

  // Render individual Webstudio Canvas Block
  const renderCanvasBlock = (block: CanvasBlock) => {
    switch (block.type) {
      case 'header':
        return (
          <div key={block.id} className={`pt-3 pb-1 text-center ${getBlockAnimationClass(block.styling)}`}>
            <div className="flex items-center justify-center gap-2">
              <h2 className="text-sm font-bold tracking-tight uppercase opacity-85">
                {block.title}
              </h2>
              {block.badge && (
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/20 text-amber-500 border border-amber-500/30">
                  {block.badge}
                </span>
              )}
            </div>
            {block.subtitle && (
              <p className="text-[11px] opacity-70 mt-0.5 leading-relaxed">
                {block.subtitle}
              </p>
            )}
          </div>
        );

      case 'qr_card': {
        const tableVal = block.data?.tableNumber || initialTable;
        const cleanTable = tableVal.replace(/[^0-9]/g, '') || '4';
        const qrTarget =
          block.data?.url ||
          (profile.customDomain
            ? `https://${profile.customDomain}?table=${cleanTable}`
            : `https://omnilink.me/${profile.handle}?table=${cleanTable}`);
        const ctaText = block.data?.frameText || `${tableVal} • SCAN TO ORDER`;

        return (
          <div
            key={block.id}
            className={`p-4 transition-all ${getBlockRadiusClass(block.styling?.cardRadius)} ${getBlockAnimationClass(block.styling)} border flex flex-col items-center text-center shadow-xs`}
            style={getBlockCardStyle(block.styling)}
          >
            <div className="flex items-center justify-between w-full mb-2 text-xs">
              <span className="font-bold flex items-center gap-1.5">
                <QrCode className="w-4 h-4 text-amber-500" />
                <span>{block.title}</span>
                {block.badge && (
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/20 text-amber-500">
                    {block.badge}
                  </span>
                )}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-500">
                {tableVal}
              </span>
            </div>

            {block.subtitle && (
              <p className="text-[11px] opacity-75 mb-3">{block.subtitle}</p>
            )}

            <div className="p-2.5 rounded-xl bg-white dark:bg-neutral-800/90 shadow-2xs mb-3">
              <img
                src={`/api/qr?url=${encodeURIComponent(qrTarget)}&format=svg&width=160&frame=scan-me-bottom&frameText=${encodeURIComponent(ctaText)}`}
                alt={block.title}
                className="w-32 h-auto"
              />
            </div>

            <button
              type="button"
              onClick={() => setShowTableOrderModal(true)}
              className="w-full py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs shadow-xs transition-transform hover:scale-[1.01] active:scale-[0.99] cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Utensils className="w-3.5 h-3.5" />
              <span>Order at {tableVal}</span>
            </button>
          </div>
        );
      }

      case 'menu_category':
        return (
          <div
            key={block.id}
            className={`p-4 transition-all ${getBlockRadiusClass(block.styling?.cardRadius)} ${getBlockAnimationClass(block.styling)} border space-y-3 shadow-xs`}
            style={getBlockCardStyle(block.styling)}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold flex items-center gap-1.5">
                  <ChefHat className="w-4 h-4 text-amber-500" />
                  <span>{block.title}</span>
                  {block.badge && (
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/20 text-amber-500">
                      {block.badge}
                    </span>
                  )}
                </div>
                {block.subtitle && (
                  <p className="text-[11px] opacity-70 mt-0.5">{block.subtitle}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setShowTableOrderModal(true)}
                className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs shadow-xs transition-transform hover:scale-105 active:scale-95 cursor-pointer shrink-0"
              >
                Order Dish
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-black/10 dark:border-white/10">
              {menuItems.slice(0, 4).map((dish) => (
                <div
                  key={dish.id}
                  className="p-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 flex items-center justify-between text-xs"
                >
                  <div className="min-w-0 pr-2">
                    <div className="font-semibold truncate">{dish.name}</div>
                    <div className="text-[10px] opacity-60 truncate">{dish.category}</div>
                  </div>
                  <span className="font-mono font-bold text-amber-500 shrink-0">
                    ${dish.price.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'menu_item': {
        const dish = menuItems.find((m) => m.id === block.data?.menuItemId) || menuItems[0];
        if (!dish) return null;
        return (
          <div
            key={block.id}
            className={`p-4 transition-all ${getBlockRadiusClass(block.styling?.cardRadius)} border flex items-center justify-between gap-3 shadow-xs`}
            style={getBlockCardStyle(block.styling)}
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold truncate">{dish.name}</h4>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/20 text-amber-500">
                  ${dish.price.toFixed(2)}
                </span>
              </div>
              <p className="text-[11px] opacity-70 line-clamp-1 mt-0.5">{dish.description}</p>
            </div>
            <button
              type="button"
              onClick={() => setShowTableOrderModal(true)}
              className="px-3 py-1.5 rounded-lg bg-amber-500 text-neutral-950 text-xs font-bold shrink-0 hover:bg-amber-400 cursor-pointer"
            >
              Order
            </button>
          </div>
        );
      }

      case 'product': {
        const prod = products.find((p) => p.id === block.data?.productId) || products[0];
        if (!prod || !prod.isPublished) return null;
        return (
          <div key={block.id} className="w-full">
            <ProductCard
              product={prod}
              profile={profile}
              onOrderCompleted={onAddOrder}
              compact={true}
            />
          </div>
        );
      }

      case 'tip_jar': {
        const presets = [3, 5, 10, 25];
        const target = block.data?.target || 500;
        const current = block.data?.current || 310;
        return (
          <div
            key={block.id}
            className={`p-5 transition-all ${getBlockRadiusClass(block.styling?.cardRadius)} border shadow-xs`}
            style={getBlockCardStyle(block.styling)}
          >
            <div className="flex items-center gap-2 mb-2">
              <Coffee className="w-4 h-4" style={{ color: theme.accentColor }} />
              <h3 className="text-xs font-bold">{block.title}</h3>
            </div>

            {block.subtitle && (
              <p className="text-[11px] opacity-80 mb-3 leading-relaxed">
                {block.subtitle}
              </p>
            )}

            <div className="mb-4 p-2.5 rounded-lg bg-black/10 dark:bg-white/5 space-y-1.5">
              <div className="flex justify-between text-[11px] font-mono">
                <span className="truncate max-w-[180px]">Hospitality & Kitchen Fund</span>
                <span className="font-semibold tabular-nums">
                  ${current} / ${target}
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-black/20 dark:bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min((current / target) * 100, 100)}%`,
                    backgroundColor: theme.accentColor,
                  }}
                />
              </div>
            </div>

            <form onSubmit={handleSendTip} className="space-y-3">
              <div className="grid grid-cols-4 gap-1.5">
                {presets.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => {
                      setSelectedTipAmount(amt);
                      setCustomTipAmount('');
                    }}
                    className={`py-1.5 text-xs font-mono font-semibold rounded-lg border transition-all cursor-pointer ${
                      selectedTipAmount === amt && !customTipAmount ? 'ring-2' : 'opacity-80 hover:opacity-100'
                    }`}
                    style={{
                      borderColor: theme.cardBorder,
                      backgroundColor: selectedTipAmount === amt && !customTipAmount ? theme.accentColor : 'transparent',
                      color: selectedTipAmount === amt && !customTipAmount ? '#000000' : theme.cardText,
                    }}
                  >
                    ${amt}
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Custom ($)"
                  value={customTipAmount}
                  onChange={(e) => setCustomTipAmount(e.target.value)}
                  className="w-24 px-2.5 py-1.5 text-xs font-mono rounded-lg border bg-black/10 dark:bg-white/5 focus:outline-none"
                  style={{ borderColor: theme.cardBorder }}
                />
                <input
                  type="text"
                  placeholder="Your name (optional)"
                  value={supporterName}
                  onChange={(e) => setSupporterName(e.target.value)}
                  className="flex-1 px-2.5 py-1.5 text-xs rounded-lg border bg-black/10 dark:bg-white/5 focus:outline-none"
                  style={{ borderColor: theme.cardBorder }}
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 px-4 text-xs font-semibold rounded-lg transition-transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                style={{
                  backgroundColor: theme.accentColor,
                  color: theme.isDark ? '#000000' : '#FFFFFF',
                }}
              >
                <Heart className="w-3.5 h-3.5 fill-current" />
                <span>{getTranslation(lang, 'sendTip')}</span>
              </button>

              {tipSuccessMessage && (
                <div className="p-2 text-center text-xs font-medium text-emerald-400 bg-emerald-950/60 rounded-lg border border-emerald-800">
                  {tipSuccessMessage}
                </div>
              )}
            </form>
          </div>
        );
      }

      case 'newsletter':
        return (
          <div
            key={block.id}
            className={`p-5 transition-all ${getBlockRadiusClass(block.styling?.cardRadius)} border shadow-xs`}
            style={getBlockCardStyle(block.styling)}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <Mail className="w-4 h-4" style={{ color: theme.accentColor }} />
              <h3 className="text-xs font-bold">{block.title}</h3>
            </div>

            <p className="text-[11px] opacity-80 mb-3 leading-relaxed">
              {block.subtitle || getTranslation(lang, 'newsletterSubtitle')}
            </p>

            <form onSubmit={handleNewsletterSubmit} className="space-y-2.5">
              <div className="flex items-center gap-2">
                <input
                  type="email"
                  required
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder={getTranslation(lang, 'emailPlaceholder')}
                  className="flex-1 px-3 py-2 text-xs rounded-lg border bg-black/10 dark:bg-white/5 focus:outline-none"
                  style={{ borderColor: theme.cardBorder }}
                />
                <button
                  type="submit"
                  className="py-2 px-3.5 text-xs font-semibold rounded-lg transition-transform hover:scale-[1.02] cursor-pointer shrink-0"
                  style={{
                    backgroundColor: theme.accentColor,
                    color: theme.isDark ? '#000000' : '#FFFFFF',
                  }}
                >
                  {getTranslation(lang, 'subscribe')}
                </button>
              </div>

              <label className="flex items-start gap-2 text-[10px] opacity-75 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={newsletterGdpr}
                  onChange={(e) => setNewsletterGdpr(e.target.checked)}
                  className="mt-0.5 rounded text-sky-600 focus:ring-0 cursor-pointer"
                />
                <span>{getTranslation(lang, 'gdprConsent')}</span>
              </label>

              {newsletterSuccess && (
                <div className="p-2 text-center text-xs font-medium text-emerald-400 bg-emerald-950/60 rounded-lg border border-emerald-800">
                  {getTranslation(lang, 'subSuccess')}
                </div>
              )}
            </form>
          </div>
        );

      case 'link':
        return (
          <a
            key={block.id}
            href={block.data?.url || '#'}
            target="_blank"
            rel="noreferrer"
            className={`relative flex items-center justify-between p-4 transition-all duration-200 border group hover:scale-[1.01] active:scale-[0.99] cursor-pointer shadow-xs ${getBlockRadiusClass(block.styling?.cardRadius)}`}
            style={getBlockCardStyle(block.styling)}
          >
            <div className="flex items-center gap-3 min-w-0 pr-2">
              <div className="p-1.5 rounded-lg bg-black/10 dark:bg-white/5 shrink-0">
                <ExternalLink className="w-4 h-4 opacity-70 group-hover:opacity-100" />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-semibold truncate block">{block.title}</span>
                {block.subtitle && (
                  <p className="text-[11px] opacity-70 truncate mt-0.5">{block.subtitle}</p>
                )}
              </div>
            </div>
            <div className="shrink-0 text-neutral-400 group-hover:translate-x-0.5 transition-transform">
              <ExternalLink className="w-3.5 h-3.5 opacity-60" />
            </div>
          </a>
        );

      case 'divider':
        return (
          <div key={block.id} className="py-2 w-full flex items-center justify-center">
            <div className="w-full h-px bg-black/10 dark:border-white/10" />
          </div>
        );

      case 'socials':
        return (
          <div key={block.id} className="flex items-center justify-center gap-4 py-2">
            {profile.socials
              .filter((s) => s.enabled && s.url)
              .map((s) => (
                <a
                  key={s.platform}
                  href={s.url}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-full border transition-all hover:scale-110 opacity-80 hover:opacity-100"
                  style={{
                    borderColor: theme.cardBorder,
                    backgroundColor: theme.cardBg,
                  }}
                  title={s.platform}
                >
                  <span className="text-xs font-semibold uppercase">{s.platform[0]}</span>
                </a>
              ))}
          </div>
        );

      case 'subscription_tiers': {
        const tiers = block.data?.tiers || [
          {
            id: 'tier-supporter',
            name: 'Supporter',
            monthlyPrice: 5,
            yearlyPrice: 50,
            description: 'Support independent publishing and access member-only dispatches.',
            perks: ['Monthly private research dispatches', 'Access to subscriber Discord channel'],
          },
          {
            id: 'tier-vip',
            name: 'VIP Insider',
            monthlyPrice: 19,
            yearlyPrice: 190,
            description: 'Direct advisory, monthly code teardowns, and priority access.',
            perks: ['All Supporter perks', 'Monthly 1-on-1 code reviews', 'Private code repository access'],
            highlighted: true,
          },
        ];

        return (
          <div
            key={block.id}
            className={`p-5 transition-all ${getBlockRadiusClass(block.styling?.cardRadius)} border space-y-4 shadow-xs`}
            style={getBlockCardStyle(block.styling)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4" style={{ color: theme.accentColor }} />
                <h3 className="text-xs font-bold">{block.title}</h3>
              </div>

              <div className="flex items-center p-0.5 rounded-lg bg-black/20 dark:bg-white/10 text-[10px]">
                <button
                  type="button"
                  onClick={() => setBillingCadence('monthly')}
                  className={`px-2 py-0.5 rounded-md font-medium transition-colors cursor-pointer ${
                    billingCadence === 'monthly' ? 'bg-white text-black font-semibold' : 'opacity-70'
                  }`}
                >
                  Mo
                </button>
                <button
                  type="button"
                  onClick={() => setBillingCadence('yearly')}
                  className={`px-2 py-0.5 rounded-md font-medium transition-colors cursor-pointer ${
                    billingCadence === 'yearly' ? 'bg-white text-black font-semibold' : 'opacity-70'
                  }`}
                >
                  Yr (-15%)
                </button>
              </div>
            </div>

            {block.subtitle && (
              <p className="text-[11px] opacity-80 leading-relaxed">{block.subtitle}</p>
            )}

            <div className="space-y-3">
              {tiers.map((t: any) => {
                const price = billingCadence === 'monthly' ? t.monthlyPrice : t.yearlyPrice;
                const period = billingCadence === 'monthly' ? '/ mo' : '/ yr';

                return (
                  <div
                    key={t.id}
                    className="p-3 rounded-xl border bg-black/5 dark:bg-white/5 space-y-2.5"
                    style={{ borderColor: theme.cardBorder }}
                  >
                    <div className="flex items-baseline justify-between">
                      <div>
                        <div className="text-xs font-bold">{t.name}</div>
                        <div className="text-[10px] opacity-70">{t.description}</div>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-mono font-bold">${price}</span>
                        <span className="text-[10px] opacity-70 ml-0.5">{period}</span>
                      </div>
                    </div>

                    <ul className="space-y-1 text-[11px] opacity-85">
                      {t.perks.map((p: string, i: number) => (
                        <li key={i} className="flex items-center gap-1.5">
                          <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>

                    <button
                      type="button"
                      onClick={() => handleSubscribeTier(t.name)}
                      className="w-full py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer hover:opacity-90"
                      style={{
                        backgroundColor: t.highlighted ? theme.accentColor : 'transparent',
                        borderColor: theme.accentColor,
                        color: t.highlighted ? '#000000' : theme.cardText,
                      }}
                    >
                      {subscribedTierSuccess === t.name
                        ? 'Joined! Welcome to the Circle'
                        : `Join ${t.name}`}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        );
      }

      case 'spotify': {
        const spotifyUrl = block.data?.url || 'https://spotify.com';
        return (
          <div
            key={block.id}
            className={`p-3.5 transition-all ${getBlockRadiusClass(block.styling?.cardRadius)} border flex items-center justify-between gap-3 shadow-xs`}
            style={getBlockCardStyle(block.styling)}
          >
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={() => setIsPlayingSpotify(!isPlayingSpotify)}
                className="w-10 h-10 rounded-full flex items-center justify-center bg-emerald-500 text-black hover:scale-105 transition-transform shrink-0 cursor-pointer shadow-md"
                title={isPlayingSpotify ? 'Pause Audio' : 'Play Episode'}
              >
                {isPlayingSpotify ? <Pause className="w-4 h-4 fill-black" /> : <Play className="w-4 h-4 fill-black ml-0.5" />}
              </button>
              <div className="min-w-0">
                <div className="text-xs font-bold truncate">{block.title}</div>
                {block.subtitle && <div className="text-[11px] opacity-70 truncate">{block.subtitle}</div>}
              </div>
            </div>

            <a
              href={spotifyUrl}
              target="_blank"
              rel="noreferrer"
              className="p-2 text-neutral-400 hover:text-white shrink-0 cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        );
      }

      case 'video': {
        const rawUrl = block.data?.url || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
        let embedUrl = rawUrl;
        if (rawUrl.includes('youtube.com/watch?v=')) {
          const id = rawUrl.split('v=')[1]?.split('&')[0];
          embedUrl = `https://www.youtube.com/embed/${id}`;
        } else if (rawUrl.includes('youtu.be/')) {
          const id = rawUrl.split('youtu.be/')[1]?.split('?')[0];
          embedUrl = `https://www.youtube.com/embed/${id}`;
        } else if (rawUrl.includes('vimeo.com/')) {
          const id = rawUrl.split('vimeo.com/')[1]?.split('?')[0];
          embedUrl = `https://player.vimeo.com/video/${id}`;
        }

        return (
          <div
            key={block.id}
            className={`p-3 transition-all ${getBlockRadiusClass(block.styling?.cardRadius)} border space-y-2 shadow-xs`}
            style={getBlockCardStyle(block.styling)}
          >
            {block.title && (
              <div className="flex items-center gap-1.5 px-1">
                <Video className="w-3.5 h-3.5 text-rose-500" />
                <span className="text-xs font-bold">{block.title}</span>
              </div>
            )}
            <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black/40">
              <iframe
                src={embedUrl}
                title={block.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            {block.subtitle && (
              <p className="text-[11px] opacity-70 px-1">{block.subtitle}</p>
            )}
          </div>
        );
      }

      default:
        return null;
    }
  };

  return (
    <div
      className={`relative w-full min-h-full flex flex-col items-center select-none ${
        isStandalone ? 'min-h-screen py-10 px-4' : 'py-8 px-4'
      }`}
      style={{
        background: theme.bgGradient || theme.bgColor,
        color: theme.cardText,
        ...getFontFamilyStyle(),
      }}
    >
      {/* Standalone Exit / Return Bar (if opened in full page) */}
      {isStandalone && onCloseStandalone && (
        <div className="fixed top-4 left-4 z-40">
          <button
            type="button"
            onClick={onCloseStandalone}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full bg-white/90 dark:bg-neutral-900/90 text-neutral-800 dark:text-neutral-200 border border-neutral-300 dark:border-neutral-700 shadow-md backdrop-blur-md hover:bg-white cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            <span>Close Public View</span>
          </button>
        </div>
      )}

      {/* Floating Share Button on Page */}
      {onOpenShareModal && (
        <div className="fixed top-4 right-4 z-40">
          <button
            type="button"
            onClick={onOpenShareModal}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-white/80 dark:bg-neutral-800/80 backdrop-blur-md border border-white/20 text-neutral-800 dark:text-neutral-200 hover:scale-105 transition-transform shadow-md cursor-pointer"
            title="Share Profile"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Container */}
      <div className="w-full max-w-md flex flex-col items-center space-y-6">
        {/* Creator Avatar & Header */}
        <div className="flex flex-col items-center text-center space-y-3 pt-2">
          {/* Avatar Container with Styled CSS/SVG Fallback */}
          <div className="relative group">
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold shadow-lg border-2 overflow-hidden transition-transform group-hover:scale-105"
              style={{
                borderColor: theme.accentColor,
                background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
                color: '#FFFFFF',
              }}
            >
              {profile.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={profile.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center w-full h-full bg-linear-to-tr from-sky-600 via-indigo-600 to-purple-600 text-white font-bold tracking-tight">
                  {profile.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2)}
                </div>
              )}
            </div>

            {profile.verified && (
              <span
                className="absolute bottom-0 right-0 p-1 rounded-full shadow-md"
                style={{ backgroundColor: theme.cardBg, border: `1px solid ${theme.cardBorder}` }}
                title="Verified Creator"
              >
                <BadgeCheck className="w-5 h-5 text-sky-400" />
              </span>
            )}
          </div>

          {/* Name & Handle */}
          <div>
            <div className="flex items-center justify-center gap-1.5">
              <h1 className="text-xl font-bold tracking-tight">{profile.name}</h1>
            </div>
            <p className="text-xs font-mono opacity-70 mt-0.5">@{profile.handle}</p>
          </div>

          {/* Bio text */}
          <p className="text-xs leading-relaxed max-w-sm opacity-90 px-2">
            {profile.bio}
          </p>

          {/* Location if present */}
          {profile.location && (
            <div className="flex items-center gap-1 text-[11px] opacity-60">
              <MapPin className="w-3 h-3" />
              <span>{profile.location}</span>
            </div>
          )}
        </div>

        {/* Live Dine-In Table Order Status Tracker (KOT sync) */}
        {activeTableOrder && (
          <div
            className={`w-full p-3.5 rounded-2xl border transition-all shadow-md ${
              activeTableOrder.status === 'Preparing'
                ? 'bg-amber-500/10 border-amber-500/60 ring-1 ring-amber-500/30'
                : activeTableOrder.status === 'Served'
                ? 'bg-emerald-500/10 border-emerald-500/60'
                : 'bg-neutral-800/80 border-neutral-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  {activeTableOrder.status !== 'Served' && (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                  )}
                  <span
                    className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                      activeTableOrder.status === 'Served' ? 'bg-emerald-400' : 'bg-amber-400'
                    }`}
                  />
                </span>
                <span className="text-xs font-bold text-neutral-900 dark:text-white">
                  {activeTableOrder.tableNumber} • Order #{activeTableOrder.id}
                </span>
              </div>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                  activeTableOrder.status === 'Preparing'
                    ? 'bg-amber-500 text-neutral-950'
                    : activeTableOrder.status === 'Served'
                    ? 'bg-emerald-500 text-neutral-950'
                    : 'bg-neutral-700 text-neutral-200'
                }`}
              >
                {activeTableOrder.status}
              </span>
            </div>
            <div className="mt-2 text-[11px] opacity-80 flex items-center justify-between">
              <span className="truncate pr-2">
                {activeTableOrder.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
              </span>
              <span className="font-mono font-bold shrink-0">
                ${activeTableOrder.totalAmount.toFixed(2)}
              </span>
            </div>
          </div>
        )}

        {/* Main Content: Canvas Blocks (Webstudio Layout) OR Fallback Links */}
        <div className="w-full space-y-3">
          {activeBlocks.length > 0 ? (
            activeBlocks.map((block) => renderCanvasBlock(block))
          ) : (
            <>
              {activeLinks.map((link) => {
                // Case 1: Section Header
                if (link.type === 'header') {
                  return (
                    <div key={link.id} className="pt-3 pb-1 text-center">
                      <span className="text-[11px] font-bold tracking-widest uppercase opacity-60">
                        {link.title}
                      </span>
                    </div>
                  );
                }

                // Case 2: Tip Jar Block
                if (link.type === 'tip_jar') {
                  const presets = link.tipPresets || [3, 5, 10, 25];
                  const goal = link.tipGoal;

                  return (
                    <div
                      key={link.id}
                      className={`p-5 transition-all ${getRadiusClass()} border`}
                      style={{
                        backgroundColor: theme.cardBg,
                        borderColor: theme.cardBorder,
                        backdropFilter: theme.cardStyle === 'glass' ? 'blur(16px)' : undefined,
                      }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Coffee className="w-4 h-4" style={{ color: theme.accentColor }} />
                        <h3 className="text-xs font-bold">{link.title}</h3>
                      </div>

                      {link.description && (
                        <p className="text-[11px] opacity-80 mb-3 leading-relaxed">
                          {link.description}
                        </p>
                      )}

                      {/* Goal Progress bar if configured */}
                      {goal && (
                        <div className="mb-4 p-2.5 rounded-lg bg-black/10 dark:bg-white/5 space-y-1.5">
                          <div className="flex justify-between text-[11px] font-mono">
                            <span className="truncate max-w-[180px]">{goal.label}</span>
                            <span className="font-semibold tabular-nums">
                              ${goal.current} / ${goal.target}
                            </span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-black/20 dark:bg-white/10 overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${Math.min((goal.current / goal.target) * 100, 100)}%`,
                                backgroundColor: theme.accentColor,
                              }}
                            />
                          </div>
                        </div>
                      )}

                      <form onSubmit={handleSendTip} className="space-y-3">
                        {/* Amount Presets */}
                        <div className="grid grid-cols-4 gap-1.5">
                          {presets.map((amt) => (
                            <button
                              key={amt}
                              type="button"
                              onClick={() => {
                                setSelectedTipAmount(amt);
                                setCustomTipAmount('');
                              }}
                              className={`py-1.5 text-xs font-mono font-semibold rounded-lg border transition-all cursor-pointer ${
                                selectedTipAmount === amt && !customTipAmount
                                  ? 'ring-2'
                                  : 'opacity-80 hover:opacity-100'
                              }`}
                              style={{
                                borderColor: theme.cardBorder,
                                backgroundColor:
                                  selectedTipAmount === amt && !customTipAmount
                                    ? theme.accentColor
                                    : 'transparent',
                                color:
                                  selectedTipAmount === amt && !customTipAmount
                                    ? '#000000'
                                    : theme.cardText,
                              }}
                            >
                              ${amt}
                            </button>
                          ))}
                        </div>

                        <div className="flex gap-2">
                          <input
                            type="number"
                            placeholder="Custom ($)"
                            value={customTipAmount}
                            onChange={(e) => setCustomTipAmount(e.target.value)}
                            className="w-24 px-2.5 py-1.5 text-xs font-mono rounded-lg border bg-black/10 dark:bg-white/5 focus:outline-none"
                            style={{ borderColor: theme.cardBorder }}
                          />
                          <input
                            type="text"
                            placeholder="Your name (optional)"
                            value={supporterName}
                            onChange={(e) => setSupporterName(e.target.value)}
                            className="flex-1 px-2.5 py-1.5 text-xs rounded-lg border bg-black/10 dark:bg-white/5 focus:outline-none"
                            style={{ borderColor: theme.cardBorder }}
                          />
                        </div>

                        <input
                          type="text"
                          placeholder="Leave a supportive note..."
                          value={supporterMessage}
                          onChange={(e) => setSupporterMessage(e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs rounded-lg border bg-black/10 dark:bg-white/5 focus:outline-none"
                          style={{ borderColor: theme.cardBorder }}
                        />

                        <button
                          type="submit"
                          className="w-full py-2 px-4 text-xs font-semibold rounded-lg transition-transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                          style={{
                            backgroundColor: theme.accentColor,
                            color: theme.isDark ? '#000000' : '#FFFFFF',
                          }}
                        >
                          <Heart className="w-3.5 h-3.5 fill-current" />
                          <span>{getTranslation(lang, 'sendTip')}</span>
                        </button>

                        {tipSuccessMessage && (
                          <div className="p-2 text-center text-xs font-medium text-emerald-400 bg-emerald-950/60 rounded-lg border border-emerald-800">
                            {tipSuccessMessage}
                          </div>
                        )}
                      </form>
                    </div>
                  );
                }

                // Case 3: Subscription Tiers Block
                if (link.type === 'subscription_tiers') {
                  const tiers = link.subscriptionTiers || [];

                  return (
                    <div
                      key={link.id}
                      className={`p-5 transition-all ${getRadiusClass()} border space-y-4`}
                      style={{
                        backgroundColor: theme.cardBg,
                        borderColor: theme.cardBorder,
                        backdropFilter: theme.cardStyle === 'glass' ? 'blur(16px)' : undefined,
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Crown className="w-4 h-4" style={{ color: theme.accentColor }} />
                          <h3 className="text-xs font-bold">{link.title}</h3>
                        </div>

                        {/* Cadence switch */}
                        <div className="flex items-center p-0.5 rounded-lg bg-black/20 dark:bg-white/10 text-[10px]">
                          <button
                            type="button"
                            onClick={() => setBillingCadence('monthly')}
                            className={`px-2 py-0.5 rounded-md font-medium transition-colors cursor-pointer ${
                              billingCadence === 'monthly' ? 'bg-white text-black font-semibold' : 'opacity-70'
                            }`}
                          >
                            Mo
                          </button>
                          <button
                            type="button"
                            onClick={() => setBillingCadence('yearly')}
                            className={`px-2 py-0.5 rounded-md font-medium transition-colors cursor-pointer ${
                              billingCadence === 'yearly' ? 'bg-white text-black font-semibold' : 'opacity-70'
                            }`}
                          >
                            Yr (-15%)
                          </button>
                        </div>
                      </div>

                      {link.description && (
                        <p className="text-[11px] opacity-80 leading-relaxed">
                          {link.description}
                        </p>
                      )}

                      <div className="space-y-3">
                        {tiers.map((t) => {
                          const price = billingCadence === 'monthly' ? t.monthlyPrice : t.yearlyPrice;
                          const period = billingCadence === 'monthly' ? '/ mo' : '/ yr';

                          return (
                            <div
                              key={t.id}
                              className="p-3 rounded-xl border bg-black/5 dark:bg-white/5 space-y-2.5"
                              style={{ borderColor: theme.cardBorder }}
                            >
                              <div className="flex items-baseline justify-between">
                                <div>
                                  <div className="text-xs font-bold">{t.name}</div>
                                  <div className="text-[10px] opacity-70">{t.description}</div>
                                </div>
                                <div className="text-right">
                                  <span className="text-sm font-mono font-bold">${price}</span>
                                  <span className="text-[10px] opacity-70 ml-0.5">{period}</span>
                                </div>
                              </div>

                              <ul className="space-y-1 text-[11px] opacity-85">
                                {t.perks.map((p, i) => (
                                  <li key={i} className="flex items-center gap-1.5">
                                    <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                                    <span>{p}</span>
                                  </li>
                                ))}
                              </ul>

                              <button
                                type="button"
                                onClick={() => handleSubscribeTier(t.name)}
                                className="w-full py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer hover:opacity-90"
                                style={{
                                  backgroundColor: t.highlighted ? theme.accentColor : 'transparent',
                                  borderColor: theme.accentColor,
                                  color: t.highlighted ? '#000000' : theme.cardText,
                                }}
                              >
                                {subscribedTierSuccess === t.name
                                  ? 'Joined! Welcome to the Circle'
                                  : `Join ${t.name}`}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                }

                // Case 4: Email Newsletter Form Block
                if (link.type === 'newsletter') {
                  return (
                    <div
                      key={link.id}
                      className={`p-5 transition-all ${getRadiusClass()} border`}
                      style={{
                        backgroundColor: theme.cardBg,
                        borderColor: theme.cardBorder,
                        backdropFilter: theme.cardStyle === 'glass' ? 'blur(16px)' : undefined,
                      }}
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <Mail className="w-4 h-4" style={{ color: theme.accentColor }} />
                        <h3 className="text-xs font-bold">{link.title}</h3>
                      </div>

                      <p className="text-[11px] opacity-80 mb-3 leading-relaxed">
                        {link.description || getTranslation(lang, 'newsletterSubtitle')}
                      </p>

                      <form onSubmit={handleNewsletterSubmit} className="space-y-2.5">
                        <div className="flex items-center gap-2">
                          <input
                            type="email"
                            required
                            value={newsletterEmail}
                            onChange={(e) => setNewsletterEmail(e.target.value)}
                            placeholder={getTranslation(lang, 'emailPlaceholder')}
                            className="flex-1 px-3 py-2 text-xs rounded-lg border bg-black/10 dark:bg-white/5 focus:outline-none"
                            style={{ borderColor: theme.cardBorder }}
                          />
                          <button
                            type="submit"
                            className="py-2 px-3.5 text-xs font-semibold rounded-lg transition-transform hover:scale-[1.02] cursor-pointer shrink-0"
                            style={{
                              backgroundColor: theme.accentColor,
                              color: theme.isDark ? '#000000' : '#FFFFFF',
                            }}
                          >
                            {getTranslation(lang, 'subscribe')}
                          </button>
                        </div>

                        {/* GDPR Consent verification checkbox */}
                        <label className="flex items-start gap-2 text-[10px] opacity-75 cursor-pointer">
                          <input
                            type="checkbox"
                            required
                            checked={newsletterGdpr}
                            onChange={(e) => setNewsletterGdpr(e.target.checked)}
                            className="mt-0.5 rounded text-sky-600 focus:ring-0 cursor-pointer"
                          />
                          <span>{getTranslation(lang, 'gdprConsent')}</span>
                        </label>

                        {newsletterSuccess && (
                          <div className="p-2 text-center text-xs font-medium text-emerald-400 bg-emerald-950/60 rounded-lg border border-emerald-800">
                            {getTranslation(lang, 'subSuccess')}
                          </div>
                        )}
                      </form>
                    </div>
                  );
                }

                // Case 5: Spotify Audio Embed Simulation
                if (link.type === 'spotify') {
                  return (
                    <div
                      key={link.id}
                      className={`p-3.5 transition-all ${getRadiusClass()} border flex items-center justify-between gap-3`}
                      style={{
                        backgroundColor: theme.cardBg,
                        borderColor: theme.cardBorder,
                        backdropFilter: theme.cardStyle === 'glass' ? 'blur(16px)' : undefined,
                      }}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <button
                          type="button"
                          onClick={() => setIsPlayingSpotify(!isPlayingSpotify)}
                          className="w-10 h-10 rounded-full flex items-center justify-center bg-emerald-500 text-black hover:scale-105 transition-transform shrink-0 cursor-pointer shadow-md"
                          title={isPlayingSpotify ? 'Pause Audio' : 'Play Episode'}
                        >
                          {isPlayingSpotify ? <Pause className="w-4 h-4 fill-black" /> : <Play className="w-4 h-4 fill-black ml-0.5" />}
                        </button>
                        <div className="min-w-0">
                          <div className="text-xs font-bold truncate">{link.title}</div>
                          <div className="text-[11px] opacity-70 truncate">{link.description}</div>
                        </div>
                      </div>

                      <a
                        href={link.url || 'https://spotify.com'}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => handleLinkClick(link, e)}
                        className="p-2 text-neutral-400 hover:text-white shrink-0 cursor-pointer"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  );
                }

                // Case 6: Standard or Password-Protected Link Button
                const isLocked = link.type === 'password' && !unlockedLinks[link.id];

                return (
                  <a
                    key={link.id}
                    href={link.url || '#'}
                    target={isLocked ? undefined : '_blank'}
                    rel="noreferrer"
                    onClick={(e) => handleLinkClick(link, e)}
                    className={`relative flex items-center justify-between p-4 transition-all duration-200 border group hover:scale-[1.01] active:scale-[0.99] cursor-pointer ${getRadiusClass()} ${
                      link.animation === 'pulse' ? 'animate-pulse' : ''
                    }`}
                    style={{
                      backgroundColor: theme.cardBg,
                      borderColor: link.isPinned ? theme.accentColor : theme.cardBorder,
                      backdropFilter: theme.cardStyle === 'glass' ? 'blur(16px)' : undefined,
                    }}
                  >
                    <div className="flex items-center gap-3 min-w-0 pr-2">
                      <div className="p-1.5 rounded-lg bg-black/10 dark:bg-white/5 shrink-0">
                        {isLocked ? (
                          <Lock className="w-4 h-4 text-amber-400" />
                        ) : (
                          <ExternalLink className="w-4 h-4 opacity-70 group-hover:opacity-100" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-semibold truncate">{link.title}</span>
                          {link.isPinned && (
                            <span
                              className="w-1.5 h-1.5 rounded-full shrink-0"
                              style={{ backgroundColor: theme.accentColor }}
                            />
                          )}
                        </div>
                        {link.description && (
                          <p className="text-[11px] opacity-70 truncate mt-0.5">
                            {link.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0 text-neutral-400 group-hover:translate-x-0.5 transition-transform">
                      {isLocked ? (
                        <span className="text-[10px] font-mono text-amber-400">Locked</span>
                      ) : (
                        <ExternalLink className="w-3.5 h-3.5 opacity-60" />
                      )}
                    </div>
                  </a>
                );
              })}

              {/* Digital Products Store fallback */}
              {products && products.filter((p) => p.isPublished).length > 0 && (
                <div className="w-full space-y-3 pt-2">
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold tracking-wider uppercase opacity-80">
                      <ShoppingBag className="w-3.5 h-3.5 text-pink-500" />
                      <span>Digital Goods & Downloads</span>
                    </div>
                    <span className="text-[10px] font-mono opacity-60">
                      Gumroad Powered
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    {products
                      .filter((p) => p.isPublished)
                      .map((product) => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          profile={profile}
                          onOrderCompleted={onAddOrder}
                          compact={true}
                        />
                      ))}
                  </div>
                </div>
              )}

              {/* Restaurant Dine-In Menu fallback */}
              {menuItems && menuItems.length > 0 && (
                <div className="w-full space-y-3 pt-2">
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold tracking-wider uppercase opacity-80">
                      <Utensils className="w-3.5 h-3.5 text-amber-500" />
                      <span>Contactless Dine-In Menu</span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-500 font-bold">
                      {initialTable}
                    </span>
                  </div>

                  <div
                    className={`p-4 transition-all ${getRadiusClass()} border space-y-3`}
                    style={{
                      backgroundColor: theme.cardBg,
                      borderColor: theme.cardBorder,
                      backdropFilter: theme.cardStyle === 'glass' ? 'blur(16px)' : undefined,
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold flex items-center gap-1.5">
                          <ChefHat className="w-4 h-4 text-amber-500" />
                          <span>Table-Side Order & Kitchen Ticket</span>
                        </div>
                        <p className="text-[11px] opacity-70 mt-0.5">
                          Order dishes directly from your phone to {initialTable}.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowTableOrderModal(true)}
                        className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs shadow-sm transition-transform hover:scale-105 active:scale-95 cursor-pointer shrink-0"
                      >
                        Order Now
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-black/10 dark:border-white/10">
                      {menuItems.slice(0, 4).map((dish) => (
                        <div
                          key={dish.id}
                          className="p-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 flex items-center justify-between text-xs"
                        >
                          <div className="min-w-0 pr-2">
                            <div className="font-semibold truncate">{dish.name}</div>
                            <div className="text-[10px] opacity-60 truncate">{dish.category}</div>
                          </div>
                          <span className="font-mono font-bold text-amber-500 shrink-0">
                            ${dish.price.toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Social Media Links Bar (rendered if not already placed via a canvas block) */}
        {(!activeBlocks.some((b) => b.type === 'socials') || activeBlocks.length === 0) && (
          <div className="flex items-center justify-center gap-4 pt-4">
            {profile.socials
              .filter((s) => s.enabled && s.url)
              .map((s) => (
                <a
                  key={s.platform}
                  href={s.url}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-full border transition-all hover:scale-110 opacity-80 hover:opacity-100"
                  style={{
                    borderColor: theme.cardBorder,
                    backgroundColor: theme.cardBg,
                  }}
                  title={s.platform}
                >
                  <span className="text-[11px] font-bold uppercase">{s.platform.slice(0, 2)}</span>
                </a>
              ))}
          </div>
        )}

        {/* Quiet Footer (Anti-Slop compliant, no telemetry tickers) */}
        <div className="pt-8 pb-4 text-center text-[11px] opacity-40">
          <span>{profile.customDomain || `omnilink.me/${profile.handle}`}</span>
        </div>
      </div>

      {/* Password Challenge Modal */}
      {lockedLinkSelected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="relative w-full max-w-sm p-6 rounded-2xl bg-neutral-900 border border-neutral-800 text-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-400" />
                <h4 className="text-sm font-semibold">Passcode Protected</h4>
              </div>
              <button
                type="button"
                onClick={() => setLockedLinkSelected(null)}
                className="text-neutral-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-neutral-400 leading-relaxed">
              This link is password-protected by {profile.name}. Enter the correct access code to continue.
            </p>

            {lockedLinkSelected.passwordHint && (
              <div className="p-2.5 rounded-lg bg-neutral-800/80 border border-neutral-700 text-[11px] text-neutral-300">
                <span className="font-semibold text-neutral-200">Hint:</span> {lockedLinkSelected.passwordHint}
              </div>
            )}

            <form onSubmit={handleUnlockPassword} className="space-y-3">
              <div>
                <input
                  type="password"
                  required
                  autoFocus
                  placeholder="Enter passcode..."
                  value={enteredPassword}
                  onChange={(e) => {
                    setEnteredPassword(e.target.value);
                    setPasswordError(false);
                  }}
                  className={`w-full px-3.5 py-2 text-xs font-mono rounded-lg border bg-neutral-800 text-white focus:outline-none ${
                    passwordError ? 'border-rose-500' : 'border-neutral-700'
                  }`}
                />
                {passwordError && (
                  <span className="text-[11px] text-rose-400 mt-1 block">
                    {getTranslation(lang, 'incorrectPassword')}
                  </span>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setLockedLinkSelected(null)}
                  className="px-3 py-1.5 text-xs text-neutral-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-black bg-white hover:bg-neutral-200 rounded-lg transition-colors cursor-pointer"
                >
                  {getTranslation(lang, 'unlock')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cookie Consent Banner (if enabled) */}
      {profile.privacySettings.cookieBanner && !cookieAccepted && (
        <div className="fixed bottom-4 left-4 right-4 max-w-md mx-auto z-40 p-4 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white/95 dark:bg-neutral-900/95 shadow-xl backdrop-blur-md text-neutral-900 dark:text-white flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-500 shrink-0" />
            <span className="text-[11px] leading-tight">
              {profile.privacySettings.gdprConsentNotice || getTranslation(lang, 'cookieNotice')}
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setCookieAccepted(true)}
              className="px-3 py-1 text-xs font-semibold rounded-md bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 cursor-pointer"
            >
              {getTranslation(lang, 'acceptCookies')}
            </button>
            <button
              type="button"
              onClick={() => setCookieAccepted(true)}
              className="px-2.5 py-1 text-xs text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 cursor-pointer"
            >
              {getTranslation(lang, 'declineCookies')}
            </button>
          </div>
        </div>
      )}

      {/* Contactless Dine-In Table Order Modal */}
      <TableOrderModal
        isOpen={showTableOrderModal}
        onClose={() => setShowTableOrderModal(false)}
        menuItems={menuItems}
        initialTable={initialTable}
        restaurantName={profile.name}
        onPlaceOrder={(order) => {
          onAddTableOrder?.(order);
        }}
      />
    </div>
  );
};
