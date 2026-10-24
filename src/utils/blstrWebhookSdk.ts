/**
 * blstrco Webhook Verification SDK Utility
 * Organization: blstrco (Linktree Engineering Architecture)
 *
 * Implements HMAC-SHA256 signature verification for outbound webhook events with
 * timestamp tolerance checks against replay attacks.
 */

export interface BlstrWebhookVerificationResult {
  valid: boolean;
  timestamp?: number;
  timeDeltaSeconds?: number;
  reason?: string;
}

/**
 * Verifies an incoming X-Blstr-Signature header.
 * Header format: t=1761280000,v1=a3f8902b...
 */
export async function verifyBlstrWebhookSignature(
  rawBody: string,
  signatureHeader: string,
  secret: string,
  toleranceSeconds: number = 300
): Promise<BlstrWebhookVerificationResult> {
  if (!signatureHeader || !secret) {
    return { valid: false, reason: 'Missing signature header or secret key' };
  }

  const parts = signatureHeader.split(',');
  const timestampPart = parts.find((p) => p.startsWith('t='));
  const signaturePart = parts.find((p) => p.startsWith('v1='));

  if (!timestampPart || !signaturePart) {
    return { valid: false, reason: 'Malformed signature header format' };
  }

  const timestamp = parseInt(timestampPart.substring(2), 10);
  const signature = signaturePart.substring(3);

  if (isNaN(timestamp)) {
    return { valid: false, reason: 'Invalid signature timestamp' };
  }

  const now = Math.floor(Date.now() / 1000);
  const timeDelta = Math.abs(now - timestamp);

  if (timeDelta > toleranceSeconds) {
    return {
      valid: false,
      timestamp,
      timeDeltaSeconds: timeDelta,
      reason: `Signature timestamp expired (delta: ${timeDelta}s > limit: ${toleranceSeconds}s)`,
    };
  }

  // Compute HMAC-SHA256 signature over "t={timestamp}.{rawBody}"
  const dataToSign = `t=${timestamp}.${rawBody}`;

  try {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const signatureBuffer = await crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(dataToSign));
    const computedSignature = Array.from(new Uint8Array(signatureBuffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    const isValid = computedSignature.toLowerCase() === signature.toLowerCase();

    return {
      valid: isValid,
      timestamp,
      timeDeltaSeconds: timeDelta,
      reason: isValid ? 'Signature valid' : 'Signature digest mismatch',
    };
  } catch (error: any) {
    return { valid: false, reason: `Crypto error: ${error.message || 'SubtleCrypto failed'}` };
  }
}
