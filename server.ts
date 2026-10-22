import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8568693060:AAEQP0Tk60G3DMIh4xo3NS7wgyIyKYW16rA';
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '7043475';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'ee.ee455@gmail.com';

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

async function startServer() {
  const PORT = Number(process.env.PORT) || 3000;

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
