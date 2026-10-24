export type SocialPlatform =
  | 'twitter'
  | 'instagram'
  | 'youtube'
  | 'tiktok'
  | 'github'
  | 'linkedin'
  | 'spotify'
  | 'twitch'
  | 'newsletter'
  | 'website'
  | 'discord'
  | 'patreon';

export type LinkType =
  | 'standard'
  | 'header'
  | 'password'
  | 'newsletter'
  | 'tip_jar'
  | 'subscription_tiers'
  | 'spotify'
  | 'youtube'
  | 'product'
  | 'restaurant_menu';

// QR Studio Types (QR Monkey & QRCodeChimp)
export type QrEyeShape = 'square' | 'rounded' | 'circle';
export type QrBodyShape = 'square' | 'dots' | 'rounded';
export type QrFrameStyle = 'none' | 'scan-me-bottom' | 'scan-me-top' | 'polaroid' | 'badge';
export type QrLogoType = 'none' | 'avatar' | 'star' | 'sparkles' | 'link' | 'coffee' | 'heart' | 'shop' | 'utensils' | 'table';
export type QrDataType = 'url' | 'restaurant_table' | 'text' | 'wifi' | 'vcard' | 'store_product';

// Restaurant & Table Order System Types
export type DietaryTag = 'Vegan' | 'Vegetarian' | 'Gluten-Free' | 'Halal' | 'Spicy';
export type MenuCategory = 'Starters' | 'Mains' | 'Beverages' | 'Desserts' | 'Specials';
export type TableOrderStatus = 'Received' | 'Preparing' | 'Served' | 'Paid';

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: MenuCategory;
  dietary: DietaryTag[];
  available: boolean;
  imageUrl?: string;
  prepTimeMinutes?: number;
  calories?: number;
  orderCount: number;
}

export interface TableOrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
}

export interface TableOrder {
  id: string;
  tableNumber: string;
  items: TableOrderItem[];
  subtotal: number;
  tipAmount: number;
  totalAmount: number;
  status: TableOrderStatus;
  customerName?: string;
  specialInstructions?: string;
  paymentStatus: 'pending' | 'settled';
  paymentMethod: 'Dine-In Pay Later' | 'Card at Table' | 'Cash at Counter';
  createdAt: string;
  updatedAt: string;
}

// Webstudio-style Visual Block Canvas
export type CanvasBlockType =
  | 'link'
  | 'header'
  | 'menu_category'
  | 'menu_item'
  | 'product'
  | 'qr_card'
  | 'newsletter'
  | 'tip_jar'
  | 'subscription_tiers'
  | 'spotify'
  | 'video'
  | 'socials'
  | 'divider';

export interface CanvasBlockStyling {
  cardRadius?: 'none' | 'sm' | 'md' | 'xl' | 'full';
  cardStyle?: 'solid' | 'glass' | 'outline' | 'shadow' | 'glow';
  bgOverride?: string;
  textColor?: string;
  accentColor?: string;
  padding?: 'compact' | 'normal' | 'relaxed';
  animation?: 'none' | 'pulse' | 'bounce';
}

export interface CanvasBlock {
  id: string;
  type: CanvasBlockType;
  title: string;
  subtitle?: string;
  badge?: string;
  clicks?: number;
  uniqueClicks?: number;
  visible: boolean;
  order: number;
  data: Record<string, any>;
  styling?: CanvasBlockStyling;
}

export interface SubscriptionTier {
  id: string;
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  description: string;
  perks: string[];
  subscriberCount: number;
  highlighted?: boolean;
}

export interface DigitalProduct {
  id: string;
  title: string;
  tagline: string;
  description: string;
  coverImage: string;
  price: number;
  suggestedPrice?: number;
  minPrice: number; // 0 for pay-what-you-want $0+
  payWhatYouWant: boolean;
  currency: string;
  fileType: 'pdf' | 'zip' | 'code' | 'audio' | 'figma' | 'notion' | 'bundle';
  fileSize: string;
  deliverableName: string;
  deliverableContent: string;
  downloadUrl?: string;
  licenseKeyRequired?: boolean;
  salesCount: number;
  rating: number;
  reviewsCount: number;
  isPublished: boolean;
  category: string;
  tags: string[];
  previewHighlights: string[];
}

export interface ProductOrder {
  id: string;
  productId: string;
  productTitle: string;
  customerEmail: string;
  amountPaid: number;
  discountCode?: string;
  discountAmount?: number;
  licenseKey?: string;
  downloadUrl: string;
  date: string;
  status: 'completed';
}

export interface LinkItem {
  id: string;
  type: LinkType;
  title: string;
  url?: string;
  description?: string;
  thumbnail?: string;
  isActive: boolean;
  isPinned: boolean;
  order: number;
  // Security & Password
  password?: string;
  passwordHint?: string;
  // Visual effects
  animation?: 'none' | 'pulse' | 'glow' | 'bounce';
  // Monetization details
  tipPresets?: number[];
  tipGoal?: {
    current: number;
    target: number;
    label: string;
  };
  subscriptionTiers?: SubscriptionTier[];
  // Gumroad Product details
  productId?: string;
  product?: DigitalProduct;
  // Analytics
  clicks: number;
  uniqueClicks: number;
  createdAt: string;
}

export interface CustomTheme {
  id: string;
  name: string;
  bgType: 'solid' | 'gradient' | 'mesh';
  bgColor: string;
  bgGradient: string;
  cardBg: string;
  cardText: string;
  cardBorder: string;
  cardRadius: 'none' | 'md' | 'xl' | 'full';
  cardStyle: 'solid' | 'glass' | 'outline' | 'shadow';
  fontFamily: 'sans' | 'serif' | 'display';
  accentColor: string;
  isDark: boolean;
}

export interface CreatorProfile {
  name: string;
  handle: string;
  bio: string;
  avatarUrl: string;
  verified: boolean;
  location: string;
  tagline: string;
  customDomain: string;
  customDomainVerified: boolean;
  theme: CustomTheme;
  socials: Array<{
    platform: SocialPlatform;
    url: string;
    enabled: boolean;
  }>;
  privacySettings: {
    cookieBanner: boolean;
    gdprConsentNotice: string;
    anonymizeIp: boolean;
    allowSearchIndexing: boolean;
    requireAgeVerification?: boolean;
  };
  thirdPartyIntegrations: {
    gaMeasurementId?: string;
    metaPixelId?: string;
    mailchimpApiKey?: string;
    zapierWebhookUrl?: string;
  };
}

export interface SubscriberRecord {
  id: string;
  email: string;
  source: string;
  date: string;
  gdprConsent: boolean;
}

export interface TipTransaction {
  id: string;
  amount: number;
  supporterName: string;
  message: string;
  date: string;
  status: 'completed';
}

export interface ApiKeyItem {
  id: string;
  name: string;
  key: string;
  createdAt: string;
  scopes: string[];
}

export interface WebhookItem {
  id: string;
  url: string;
  events: string[];
  status: 'active' | 'paused';
  lastDeliveredAt?: string;
}

export interface AnalyticsData {
  totalViews: number;
  uniqueVisitors: number;
  totalClicks: number;
  ctr: number;
  totalRevenue: number;
  subscribersCount: number;
  conversionRate: number;
  bounceRate: number;
  history: Array<{
    date: string;
    views: number;
    clicks: number;
    revenue: number;
  }>;
  topCountries: Array<{
    country: string;
    code: string;
    percentage: number;
    visitors: number;
  }>;
  topReferrers: Array<{
    name: string;
    percentage: number;
    count: number;
  }>;
  deviceBreakdown: {
    mobile: number;
    desktop: number;
    tablet: number;
  };
}

export type SupportedLanguage = 'en' | 'es' | 'fr' | 'de' | 'ja' | 'pt' | 'ar';
