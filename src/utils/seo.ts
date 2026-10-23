import { CreatorProfile } from '../types.ts';

/**
 * Ensures or updates a meta tag in document.head
 */
function setMetaTag(selector: string, attribute: string, attrName: string, content: string) {
  let element = document.querySelector(selector);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attrName, attribute);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

/**
 * Ensures or updates a link tag in document.head
 */
function setLinkTag(rel: string, href: string) {
  let element = document.querySelector(`link[rel="${rel}"]`);
  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', rel);
    document.head.appendChild(element);
  }
  element.setAttribute('href', href);
}

/**
 * Generates Schema.org JSON-LD structured data for the creator's profile
 */
export function generateProfileJsonLd(profile: CreatorProfile, canonicalUrl: string) {
  const activeSocialUrls = profile.socials
    .filter((s) => s.enabled && s.url)
    .map((s) => s.url);

  return {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    mainEntity: {
      '@type': 'Person',
      name: profile.name,
      alternateName: `@${profile.handle}`,
      description: profile.bio || profile.tagline || 'Creator and technologist links.',
      image: profile.avatarUrl || undefined,
      url: canonicalUrl,
      sameAs: activeSocialUrls,
      address: profile.location
        ? {
            '@type': 'PostalAddress',
            addressLocality: profile.location,
          }
        : undefined,
    },
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: canonicalUrl,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: profile.name,
          item: canonicalUrl,
        },
      ],
    },
  };
}

/**
 * Updates document title, meta tags, OpenGraph cards, Twitter cards, and Schema.org JSON-LD
 * based on the creator's active profile in real time.
 */
export function updateDynamicMetaTags(profile: CreatorProfile): void {
  if (typeof document === 'undefined') return;

  const siteTitle = `${profile.name} (@${profile.handle}) – Official Links & Projects`;
  const cleanBio = profile.bio?.trim() || `${profile.name}'s verified links, projects, and creative writing.`;
  const metaDescription = cleanBio.length > 155 ? `${cleanBio.slice(0, 152)}...` : cleanBio;

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://omnilink.me';
  const canonicalUrl = profile.customDomain
    ? `https://${profile.customDomain}`
    : `${origin}/@${profile.handle}`;

  // 1. Update Document Title
  document.title = siteTitle;

  // 2. Standard Search Meta Tags
  setMetaTag('meta[name="description"]', 'description', 'name', metaDescription);
  setMetaTag(
    'meta[name="robots"]',
    'robots',
    'name',
    profile.privacySettings?.allowSearchIndexing === false ? 'noindex, nofollow' : 'index, follow'
  );
  setLinkTag('canonical', canonicalUrl);

  // 3. OpenGraph / Facebook / LinkedIn / Discord / Slack
  setMetaTag('meta[property="og:title"]', 'og:title', 'property', siteTitle);
  setMetaTag('meta[property="og:description"]', 'og:description', 'property', metaDescription);
  setMetaTag('meta[property="og:url"]', 'og:url', 'property', canonicalUrl);
  setMetaTag('meta[property="og:type"]', 'og:type', 'property', 'profile');
  setMetaTag('meta[property="og:site_name"]', 'og:site_name', 'property', 'OmniLink Studio');
  setMetaTag('meta[property="profile:username"]', 'profile:username', 'property', profile.handle);

  if (profile.avatarUrl) {
    setMetaTag('meta[property="og:image"]', 'og:image', 'property', profile.avatarUrl);
    setMetaTag('meta[property="og:image:alt"]', 'og:image:alt', 'property', `${profile.name}'s avatar`);
  }

  // 4. Twitter / X Social Cards
  setMetaTag('meta[name="twitter:card"]', 'twitter:card', 'name', 'summary_large_image');
  setMetaTag('meta[name="twitter:title"]', 'twitter:title', 'name', siteTitle);
  setMetaTag('meta[name="twitter:description"]', 'twitter:description', 'name', metaDescription);
  if (profile.avatarUrl) {
    setMetaTag('meta[name="twitter:image"]', 'twitter:image', 'name', profile.avatarUrl);
  }

  // 5. Schema.org JSON-LD Structured Data
  const jsonLdPayload = generateProfileJsonLd(profile, canonicalUrl);
  let scriptTag = document.querySelector('script[data-seo="profile-jsonld"]');
  if (!scriptTag) {
    scriptTag = document.createElement('script');
    scriptTag.setAttribute('type', 'application/ld+json');
    scriptTag.setAttribute('data-seo', 'profile-jsonld');
    document.head.appendChild(scriptTag);
  }
  scriptTag.textContent = JSON.stringify(jsonLdPayload, null, 2);
}
