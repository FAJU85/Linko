import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { injectSeoMetaTags, isSocialCrawler, ProfileSeoMeta } from './server/seoEngine.ts';
import { generateQrDataUrl, generateQrSvg, generateQrBuffer, QrErrorCorrectionLevel } from './server/qrEngine.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8568693060:AAEQP0Tk60G3DMIh4xo3NS7wgyIyKYW16rA';
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '7043475';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'ee.ee455@gmail.com';

// Default creator SEO profile for social crawler previews
const DEFAULT_SEO_PROFILE: ProfileSeoMeta = {
  name: 'Alex Rivera',
  handle: 'alexrivera',
  bio: 'Systems architect, writer & creative technologist. Exploring modular design, real-time systems, and creator economics.',
  customDomain: 'links.alexrivera.io',
  location: 'San Francisco, CA',
  allowIndexing: true,
  socialUrls: [
    'https://twitter.com/alexrivera',
    'https://github.com/alexrivera',
    'https://youtube.com/@alexrivera',
    'https://open.spotify.com/show/alexrivera',
  ],
};

// API: Send Telegram notification
app.post('/api/telegram/notify', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Notification text is required' });
    }

    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: text,
        parse_mode: 'Markdown',
      }),
    });

    const data = await response.json();
    if (!response.ok || !data.ok) {
      return res.status(response.status || 500).json({
        error: data.description || 'Telegram API error',
        details: data,
      });
    }

    return res.json({ success: true, result: data.result });
  } catch (error: any) {
    console.error('Telegram notification error:', error);
    return res.status(500).json({ error: error.message || 'Failed to dispatch Telegram message' });
  }
});

// API: Get admin and Telegram integration status
app.get('/api/admin/info', (_req, res) => {
  res.json({
    adminEmail: ADMIN_EMAIL,
    telegramBot: '@mob_con_bot',
    telegramUserId: TELEGRAM_CHAT_ID,
    configured: Boolean(TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID),
  });
});

// API: Backend SEO Engine - Render dynamic meta tags for any profile
app.post('/api/seo/render', (req, res) => {
  try {
    const profileMeta: ProfileSeoMeta = {
      ...DEFAULT_SEO_PROFILE,
      ...(req.body || {}),
    };

    const templatePath = path.resolve(__dirname, 'index.html');
    const rawHtml = fs.existsSync(templatePath)
      ? fs.readFileSync(templatePath, 'utf-8')
      : '<!DOCTYPE html><html><head></head><body><div id="root"></div></body></html>';

    const enrichedHtml = injectSeoMetaTags(rawHtml, profileMeta);

    return res.json({
      success: true,
      meta: {
        title: `${profileMeta.name} (@${profileMeta.handle}) – Official Links & Projects`,
        description: profileMeta.bio?.slice(0, 155),
        canonical: profileMeta.customDomain ? `https://${profileMeta.customDomain}` : `https://omnilink.me/@${profileMeta.handle}`,
        robots: profileMeta.allowIndexing === false ? 'noindex, nofollow' : 'index, follow',
      },
      previewHtml: enrichedHtml,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to render SEO meta tags' });
  }
});

// API: Inspect active SEO meta tags
app.get('/api/seo/meta', (req, res) => {
  const name = (req.query.name as string) || DEFAULT_SEO_PROFILE.name;
  const handle = (req.query.handle as string) || DEFAULT_SEO_PROFILE.handle;
  const bio = (req.query.bio as string) || DEFAULT_SEO_PROFILE.bio;

  const profileMeta: ProfileSeoMeta = {
    ...DEFAULT_SEO_PROFILE,
    name,
    handle,
    bio,
  };

  const title = `${profileMeta.name} (@${profileMeta.handle}) – Official Links & Projects`;
  const description = profileMeta.bio?.slice(0, 155) || '';

  res.json({
    title,
    description,
    openGraph: {
      'og:title': title,
      'og:description': description,
      'og:type': 'profile',
      'og:url': profileMeta.customDomain ? `https://${profileMeta.customDomain}` : `https://omnilink.me/@${profileMeta.handle}`,
      'og:site_name': 'OmniLink',
    },
    twitter: {
      'twitter:card': 'summary_large_image',
      'twitter:title': title,
      'twitter:description': description,
    },
    engine: 'cheerio-seo-v1',
  });
});

// API: Headless CMS Profile & Blocks REST Endpoint (Strapi / Contentful parity)
app.get('/api/public/profile', (_req, res) => {
  res.json({
    data: {
      profile: DEFAULT_SEO_PROFILE,
      meta: {
        version: '2026.1',
        engine: 'omnilink-headless-cms',
      },
    },
  });
});

// API: Headless Restaurant Menu REST Endpoint
app.get('/api/public/menu', (_req, res) => {
  res.json({
    restaurant: 'Lumière Dining & Lounge',
    categories: ['Starters', 'Mains', 'Beverages', 'Desserts'],
    dineInSupported: true,
  });
});

// API: Backend QR Engine - Generate JSON response with SVG or PNG Data URL
app.post('/api/qr/generate', async (req, res) => {
  try {
    const {
      url,
      format = 'png',
      margin = 2,
      darkColor = '#0f172a',
      lightColor = '#ffffff',
      errorCorrectionLevel = 'M',
      width = 512,
      eyeShape,
      bodyShape,
      eyeColor,
      isGradient,
      gradientColor,
      frameStyle,
      frameText,
      frameColor,
      logoType,
      logoUrl,
      creatorName,
      creatorHandle,
    } = req.body;

    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'URL is required' });
    }

    const ec = (['L', 'M', 'Q', 'H'].includes(errorCorrectionLevel) ? errorCorrectionLevel : 'M') as QrErrorCorrectionLevel;

    if (format === 'svg') {
      const svg = await generateQrSvg(url, {
        margin: Number(margin) || 2,
        darkColor,
        lightColor,
        errorCorrectionLevel: ec,
        width: Number(width) || 512,
        eyeShape,
        bodyShape,
        eyeColor,
        isGradient: Boolean(isGradient),
        gradientColor,
        frameStyle,
        frameText,
        frameColor,
        logoType,
        logoUrl,
        creatorName,
        creatorHandle,
      });
      return res.json({
        success: true,
        format: 'svg',
        data: svg,
        url,
      });
    }

    const dataUrl = await generateQrDataUrl(url, {
      margin: Number(margin) || 2,
      darkColor,
      lightColor,
      errorCorrectionLevel: ec,
      width: Number(width) || 512,
    });

    return res.json({
      success: true,
      format: 'png',
      data: dataUrl,
      url,
    });
  } catch (error: any) {
    console.error('QR code generation error:', error);
    return res.status(500).json({ error: error.message || 'Failed to generate QR code' });
  }
});

// API: Backend QR Engine - Direct image endpoint (supports image/png, image/svg+xml, and file download)
app.get('/api/qr', async (req, res) => {
  try {
    const targetUrl = req.query.url as string;
    if (!targetUrl) {
      return res.status(400).send('Missing url query parameter');
    }

    const format = (req.query.format as string)?.toLowerCase() === 'svg' ? 'svg' : 'png';
    const darkColor = (req.query.dark as string) || '#0f172a';
    const lightColor = (req.query.light as string) || '#ffffff';
    const margin = Number(req.query.margin) || 2;
    const width = Number(req.query.width) || 512;
    const rawEc = ((req.query.ec as string) || 'M').toUpperCase();
    const ec = (['L', 'M', 'Q', 'H'].includes(rawEc) ? rawEc : 'M') as QrErrorCorrectionLevel;
    const shouldDownload = req.query.download === 'true' || req.query.download === '1';

    // Extended styling params
    const eyeShape = (req.query.eye as any) || undefined;
    const bodyShape = (req.query.body as any) || undefined;
    const eyeColor = (req.query.eyeColor as string) || undefined;
    const isGradient = req.query.gradient === 'true' || req.query.gradient === '1';
    const gradientColor = (req.query.gradColor as string) || undefined;
    const frameStyle = (req.query.frame as any) || undefined;
    const frameText = (req.query.frameText as string) || undefined;
    const frameColor = (req.query.frameColor as string) || undefined;
    const logoType = (req.query.logo as any) || undefined;
    const logoUrl = (req.query.logoUrl as string) || undefined;
    const creatorName = (req.query.name as string) || undefined;
    const creatorHandle = (req.query.handle as string) || undefined;

    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400');

    if (format === 'svg') {
      const svg = await generateQrSvg(targetUrl, {
        margin,
        darkColor,
        lightColor,
        errorCorrectionLevel: ec,
        width,
        eyeShape,
        bodyShape,
        eyeColor,
        isGradient,
        gradientColor,
        frameStyle,
        frameText,
        frameColor,
        logoType,
        logoUrl,
        creatorName,
        creatorHandle,
      });

      res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8');
      if (shouldDownload) {
        res.setHeader('Content-Disposition', 'attachment; filename="qrcode.svg"');
      }
      return res.status(200).send(svg);
    }

    const buffer = await generateQrBuffer(targetUrl, {
      margin,
      darkColor,
      lightColor,
      errorCorrectionLevel: ec,
      width,
    });

    res.setHeader('Content-Type', 'image/png');
    if (shouldDownload) {
      res.setHeader('Content-Disposition', 'attachment; filename="qrcode.png"');
    }
    return res.status(200).send(buffer);
  } catch (error: any) {
    console.error('QR code streaming error:', error);
    return res.status(500).send('Failed to generate QR code image');
  }
});

async function startServer() {
  const PORT = Number(process.env.PORT) || 3000;

  // Social crawler interceptor middleware
  app.use((req, res, next) => {
    const userAgent = req.headers['user-agent'] || '';
    const isBot = isSocialCrawler(userAgent);

    // If a social media crawler (Twitterbot, Discord, Facebook, etc.) visits a page route
    if (isBot && req.method === 'GET' && !req.path.startsWith('/api') && !req.path.includes('.')) {
      try {
        const distIndex = path.resolve(__dirname, 'dist', 'index.html');
        const devIndex = path.resolve(__dirname, 'index.html');
        const indexPath = fs.existsSync(distIndex) ? distIndex : devIndex;

        if (fs.existsSync(indexPath)) {
          const rawHtml = fs.readFileSync(indexPath, 'utf-8');
          const enrichedHtml = injectSeoMetaTags(rawHtml, DEFAULT_SEO_PROFILE);
          res.setHeader('Content-Type', 'text/html; charset=utf-8');
          return res.status(200).send(enrichedHtml);
        }
      } catch (err) {
        console.error('Crawler SEO rendering error:', err);
      }
    }
    next();
  });

  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
