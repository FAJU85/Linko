interface Env {
  TELEGRAM_BOT_TOKEN?: string;
  TELEGRAM_CHAT_ID?: string;
}

interface RequestBody {
  text?: string;
}

export const onRequestPost = async (context: {
  request: Request;
  env: Env;
}) => {
  try {
    const { request, env } = context;
    const body = (await request.json()) as RequestBody;
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

    const data = await telegramRes.json() as { ok: boolean; result?: any };
    return new Response(JSON.stringify({ success: data.ok, result: data.result }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message || 'Error dispatching Telegram message' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
