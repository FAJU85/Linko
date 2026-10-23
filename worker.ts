interface Env {
  ASSETS?: { fetch: (request: Request) => Promise<Response> };
  TELEGRAM_BOT_TOKEN?: string;
  TELEGRAM_CHAT_ID?: string;
  ADMIN_EMAIL?: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Route: /api/telegram/notify
    if (url.pathname === '/api/telegram/notify' && request.method === 'POST') {
      try {
        const body: any = await request.json();
        const text = body?.text;

        if (!text) {
          return new Response(JSON.stringify({ error: 'Text is required' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          });
        }

        const token = env.TELEGRAM_BOT_TOKEN || '8568693060:AAEQP0Tk60G3DMIh4xo3NS7wgyIyKYW16rA';
        const chatId = env.TELEGRAM_CHAT_ID || '7043475';

        const telegramRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text,
            parse_mode: 'Markdown',
          }),
        });

        const data: any = await telegramRes.json();
        return new Response(JSON.stringify({ success: data.ok, result: data.result }), {
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message || 'Error sending Telegram message' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    // Route: /api/admin/info
    if (url.pathname === '/api/admin/info' && request.method === 'GET') {
      return new Response(
        JSON.stringify({
          adminEmail: env.ADMIN_EMAIL || 'ee.ee455@gmail.com',
          telegramBot: '@mob_con_bot',
          telegramUserId: env.TELEGRAM_CHAT_ID || '7043475',
          configured: true,
          platform: 'cloudflare-worker',
        }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Route: /api/seo/meta
    if (url.pathname === '/api/seo/meta' && request.method === 'GET') {
      const name = url.searchParams.get('name') || 'Alex Rivera';
      const handle = url.searchParams.get('handle') || 'alexrivera';
      const bio = url.searchParams.get('bio') || 'Systems architect, writer & creative technologist.';
      const title = `${name} (@${handle}) – Official Links & Projects`;

      return new Response(
        JSON.stringify({
          title,
          description: bio.slice(0, 155),
          openGraph: {
            'og:title': title,
            'og:description': bio.slice(0, 155),
            'og:type': 'profile',
            'og:site_name': 'OmniLink',
          },
          twitter: {
            'twitter:card': 'summary_large_image',
            'twitter:title': title,
            'twitter:description': bio.slice(0, 155),
          },
          engine: 'cloudflare-worker-edge-seo',
        }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Route: /api/qr/generate
    if (url.pathname === '/api/qr/generate' && request.method === 'POST') {
      try {
        const body: any = await request.json();
        const targetUrl = body?.url;
        if (!targetUrl) {
          return new Response(JSON.stringify({ error: 'URL is required' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          });
        }

        const format = body?.format === 'svg' ? 'svg' : 'png';
        const darkColor = body?.darkColor || '#0f172a';
        const lightColor = body?.lightColor || '#ffffff';
        const margin = Number(body?.margin) || 2;
        const width = Number(body?.width) || 512;
        const ec = body?.errorCorrectionLevel || 'M';

        const QRCodeModule = await import('qrcode');
        const QRCode = (QRCodeModule as any).default || QRCodeModule;

        if (format === 'svg') {
          const svg = await QRCode.toString(targetUrl, {
            type: 'svg',
            errorCorrectionLevel: ec,
            margin,
            width,
            color: { dark: darkColor, light: lightColor },
          });
          return new Response(
            JSON.stringify({ success: true, format: 'svg', data: svg, url: targetUrl }),
            { headers: { 'Content-Type': 'application/json' } }
          );
        }

        const dataUrl = await QRCode.toDataURL(targetUrl, {
          errorCorrectionLevel: ec,
          margin,
          width,
          color: { dark: darkColor, light: lightColor },
        });

        return new Response(
          JSON.stringify({ success: true, format: 'png', data: dataUrl, url: targetUrl }),
          { headers: { 'Content-Type': 'application/json' } }
        );
      } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message || 'QR generation failed' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    // Route: /api/qr
    if (url.pathname === '/api/qr' && request.method === 'GET') {
      try {
        const targetUrl = url.searchParams.get('url');
        if (!targetUrl) {
          return new Response('Missing url query parameter', { status: 400 });
        }

        const format = url.searchParams.get('format')?.toLowerCase() === 'svg' ? 'svg' : 'png';
        const darkColor = url.searchParams.get('dark') || '#0f172a';
        const lightColor = url.searchParams.get('light') || '#ffffff';
        const margin = Number(url.searchParams.get('margin')) || 2;
        const width = Number(url.searchParams.get('width')) || 512;
        const ec = (url.searchParams.get('ec') || 'M').toUpperCase();

        const QRCodeModule = await import('qrcode');
        const QRCode = (QRCodeModule as any).default || QRCodeModule;

        if (format === 'svg') {
          const svg = await QRCode.toString(targetUrl, {
            type: 'svg',
            errorCorrectionLevel: ec,
            margin,
            width,
            color: { dark: darkColor, light: lightColor },
          });

          return new Response(svg, {
            headers: {
              'Content-Type': 'image/svg+xml; charset=utf-8',
              'Cache-Control': 'public, max-age=86400',
            },
          });
        }

        // Return Data URL redirect or SVG for edge fallback
        const svg = await QRCode.toString(targetUrl, {
          type: 'svg',
          errorCorrectionLevel: ec,
          margin,
          width,
          color: { dark: darkColor, light: lightColor },
        });

        return new Response(svg, {
          headers: {
            'Content-Type': 'image/svg+xml; charset=utf-8',
            'Cache-Control': 'public, max-age=86400',
          },
        });
      } catch (err: any) {
        return new Response('Failed to generate QR code', { status: 500 });
      }
    }

    // Fallback: serve static assets from dist/
    if (env.ASSETS) {
      return await env.ASSETS.fetch(request);
    }

    return new Response('Not Found', { status: 404 });
  },
};
