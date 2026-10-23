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
  | 'product';

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

export type SupportedLanguage = 'en' | 'es' | 'fr' | 'de' | 'ja' | 'pt';
