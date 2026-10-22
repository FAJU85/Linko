interface Env {
  ADMIN_EMAIL?: string;
  TELEGRAM_CHAT_ID?: string;
}

export const onRequestGet = async (context: {
  request: Request;
  env: Env;
}) => {
  const { env } = context;
  const adminEmail = env.ADMIN_EMAIL || 'ee.ee455@gmail.com';
  const chatId = env.TELEGRAM_CHAT_ID || '7043475';

  return new Response(
    JSON.stringify({
      adminEmail,
      telegramBot: '@mob_con_bot',
      telegramUserId: chatId,
      configured: true,
      platform: 'cloudflare-pages',
    }),
    {
      headers: { 'Content-Type': 'application/json' },
    }
  );
};
