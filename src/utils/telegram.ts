export interface TelegramNotifyOptions {
  text: string;
}

export async function sendTelegramNotification(text: string): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch('/api/telegram/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      return { success: false, error: data.error || 'Failed to dispatch Telegram message' };
    }
    return { success: true };
  } catch (err: any) {
    console.error('Failed to send Telegram alert:', err);
    return { success: false, error: err.message };
  }
}

export function notifyNewTip(amount: number, supporterName: string, message?: string) {
  const text = `💰 *New Tip Received on OmniLink!*\n\n*Amount:* $${amount.toFixed(2)}\n*Supporter:* ${supporterName || 'Anonymous'}\n*Message:* "${message || 'No message'}"\n*Time:* ${new Date().toLocaleTimeString()}`;
  sendTelegramNotification(text);
}

export function notifyNewSubscriber(email: string, source: string) {
  const text = `📬 *New Newsletter Subscriber on OmniLink!*\n\n*Email:* \`${email}\`\n*Source:* ${source}\n*Time:* ${new Date().toLocaleTimeString()}`;
  sendTelegramNotification(text);
}

export function notifySecretUnlocked(linkTitle: string) {
  const text = `🔐 *Passcode Protected Link Unlocked!*\n\n*Content:* ${linkTitle}\n*Time:* ${new Date().toLocaleTimeString()}`;
  sendTelegramNotification(text);
}

export function notifyTierSubscribed(tierName: string, cadence: string, price: number) {
  const text = `👑 *New Membership Tier Joined!*\n\n*Tier:* ${tierName}\n*Plan:* ${cadence} ($${price})\n*Time:* ${new Date().toLocaleTimeString()}`;
  sendTelegramNotification(text);
}
