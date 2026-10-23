import * as cheerio from 'cheerio';

export interface ProfileSeoMeta {
  name: string;
  handle: string;
  bio?: string;
  avatarUrl?: string;
  customDomain?: string;
  location?: string;
  allowIndexing?: boolean;
  socialUrls?: string[];
  canonicalUrl?: string;
}

/**
 * Server-side SEO Engine using Cheerio.
 * Injects dynamic titles, descriptions, OpenGraph tags, Twitter cards,
 * and Schema.org JSON-LD into the HTML template for social crawlers and search bots.
 */
export function injectSeoMetaTags(html: string, meta: ProfileSeoMeta): string {
  const $ = cheerio.load(html);

  const title = `${meta.name} (@${meta.handle}) – Official Links & Projects`;
  const rawBio = meta.bio?.trim() || `${meta.name}'s verified links, projects, and creative writing.`;
  const description = rawBio.length > 155 ? `${rawBio.slice(0, 152)}...` : rawBio;
  const canonical = meta.canonicalUrl || (meta.customDomain ? `https://${meta.customDomain}` : `https://omnilink.me/@${meta.handle}`);
  const robots = meta.allowIndexing === false ? 'noindex, nofollow' : 'index, follow';

  // 1. Update <title>
  if ($('title').length > 0) {
    $('title').text(title);
  } else {
    $('head').prepend(`<title>${title}</title>`);
  }

  // Helper to ensure meta tag exists
  function setMeta(keyAttr: string, keyVal: string, content: string) {
    const existing = $(`meta[${keyAttr}="${keyVal}"]`);
    if (existing.length > 0) {
      existing.attr('content', content);
    } else {
      $('head').append(`<meta ${keyAttr}="${keyVal}" content="${content}" />\n`);
    }
  }

  // 2. Standard Search Meta
  setMeta('name', 'description', description);
  setMeta('name', 'robots', robots);

  // Canonical Link
  if ($('link[rel="canonical"]').length > 0) {
    $('link[rel="canonical"]').attr('href', canonical);
  } else {
    $('head').append(`<link rel="canonical" href="${canonical}" />\n`);
  }

  // 3. OpenGraph Tags (Facebook, LinkedIn, Discord, Slack, iMessage)
  setMeta('property', 'og:title', title);
  setMeta('property', 'og:description', description);
  setMeta('property', 'og:url', canonical);
  setMeta('property', 'og:type', 'profile');
  setMeta('property', 'og:site_name', 'OmniLink');
  setMeta('property', 'profile:username', meta.handle);

  if (meta.avatarUrl) {
    setMeta('property', 'og:image', meta.avatarUrl);
    setMeta('property', 'og:image:alt', `${meta.name}'s avatar`);
  }

  // 4. Twitter / X Cards
  setMeta('name', 'twitter:card', 'summary_large_image');
  setMeta('name', 'twitter:title', title);
  setMeta('name', 'twitter:description', description);
  if (meta.avatarUrl) {
    setMeta('name', 'twitter:image', meta.avatarUrl);
  }

  // 5. Schema.org JSON-LD Structured Data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    mainEntity: {
      '@type': 'Person',
      name: meta.name,
      alternateName: `@${meta.handle}`,
      description: meta.bio || `${meta.name}'s projects and creative profile.`,
      image: meta.avatarUrl || undefined,
      url: canonical,
      sameAs: meta.socialUrls || [],
      address: meta.location
        ? {
            '@type': 'PostalAddress',
            addressLocality: meta.location,
          }
        : undefined,
    },
  };

  // Remove existing JSON-LD if present to avoid duplicates
  $('script[type="application/ld+json"][data-seo="profile-jsonld"]').remove();
  $('head').append(
    `<script type="application/ld+json" data-seo="profile-jsonld">\n${JSON.stringify(jsonLd, null, 2)}\n</script>\n`
  );

  return $.html();
}

/**
 * Detects whether an incoming HTTP request User-Agent belongs to a social media unfurler or web crawler.
 */
export function isSocialCrawler(userAgent: string = ''): boolean {
  const crawlerKeywords = [
    'twitterbot',
    'facebookexternalhit',
    'facebot',
    'linkedinbot',
    'slackbot',
    'discordbot',
    'whatsapp',
    'telegrambot',
    'pinterest',
    'googlebot',
    'bingbot',
    'applebot',
    'yandex',
    'duckduckbot',
    'embedly',
    'quora link preview',
    'outbrain',
    'vkshare',
    'w3c_validator',
  ];

  const lower = userAgent.toLowerCase();
  return crawlerKeywords.some((keyword) => lower.includes(keyword));
}
