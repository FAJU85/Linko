import React, { useState } from 'react';
import {
  X,
  Lock,
  Download,
  CheckCircle2,
  Tag,
  Sparkles,
  CreditCard,
  Key,
  FileText,
  ShieldCheck,
  Copy,
  Check,
  ArrowRight,
} from 'lucide-react';
import { DigitalProduct, ProductOrder, CreatorProfile } from '../../types.ts';

interface GumroadCheckoutModalProps {
  product: DigitalProduct;
  profile: CreatorProfile;
  isOpen: boolean;
  onClose: () => void;
  onOrderCompleted: (order: ProductOrder) => void;
}

export const GumroadCheckoutModal: React.FC<GumroadCheckoutModalProps> = ({
  product,
  profile,
  isOpen,
  onClose,
  onOrderCompleted,
}) => {
  const [email, setEmail] = useState('');
  const [customPrice, setCustomPrice] = useState<number>(
    product.payWhatYouWant ? (product.suggestedPrice || product.price || 0) : product.price
  );
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discountPct?: number; discountFixed?: number } | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<ProductOrder | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);

  if (!isOpen) return null;

  // Calculate pricing with pay-what-you-want and discounts
  const basePrice = product.payWhatYouWant ? Math.max(product.minPrice, Number(customPrice) || 0) : product.price;
  let discountAmount = 0;
  if (appliedPromo) {
    if (appliedPromo.discountPct) {
      discountAmount = (basePrice * appliedPromo.discountPct) / 100;
    } else if (appliedPromo.discountFixed) {
      discountAmount = Math.min(basePrice, appliedPromo.discountFixed);
    }
  }
  const finalPrice = Math.max(0, basePrice - discountAmount);

  // Apply promo code logic
  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError(null);
    const code = promoCode.trim().toUpperCase();
    if (!code) return;

    if (code === 'LAUNCH50' || code === 'HALF') {
      setAppliedPromo({ code, discountPct: 50 });
    } else if (code === 'GUMROAD20' || code === 'SAVE20') {
      setAppliedPromo({ code, discountPct: 20 });
    } else if (code === 'CREATOR10') {
      setAppliedPromo({ code, discountFixed: 10 });
    } else if (code === 'FREE' || code === '100OFF') {
      setAppliedPromo({ code, discountPct: 100 });
    } else {
      setPromoError('Invalid or expired discount code. Try "LAUNCH50" or "GUMROAD20"');
    }
  };

  // Process instant checkout
  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      alert('Please enter a valid email address for delivery.');
      return;
    }

    if (product.payWhatYouWant && Number(customPrice) < product.minPrice) {
      alert(`The minimum price for this item is $${product.minPrice}.`);
      return;
    }

    setIsProcessing(true);

    setTimeout(() => {
      const generatedLicense = product.licenseKeyRequired
        ? `${product.title.slice(0, 4).toUpperCase()}-2026-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`
        : undefined;

      const order: ProductOrder = {
        id: `ord-${Date.now().toString().slice(-4)}`,
        productId: product.id,
        productTitle: product.title,
        customerEmail: email.trim(),
        amountPaid: Number(finalPrice.toFixed(2)),
        discountCode: appliedPromo?.code,
        discountAmount: Number(discountAmount.toFixed(2)),
        licenseKey: generatedLicense,
        downloadUrl: product.downloadUrl || 'https://cdn.omnilink.me/sample-download.pdf',
        date: new Date().toISOString().replace('T', ' ').slice(0, 16),
        status: 'completed',
      };

      setCompletedOrder(order);
      onOrderCompleted(order);
      setIsProcessing(false);
    }, 900);
  };

  const handleCopyLicense = () => {
    if (completedOrder?.licenseKey) {
      navigator.clipboard.writeText(completedOrder.licenseKey);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-800/50">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300">
              Gumroad Checkout
            </span>
            <span className="text-xs text-neutral-500 dark:text-neutral-400">
              by {profile.name} (@{profile.handle})
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto">
          {!completedOrder ? (
            /* Checkout Form */
            <div className="space-y-6">
              {/* Product preview card */}
              <div className="flex gap-4 p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/30">
                <img
                  src={product.coverImage}
                  alt={product.title}
                  className="w-20 h-20 rounded-lg object-cover shrink-0 border border-neutral-200 dark:border-neutral-700"
                />
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-semibold tracking-wide uppercase text-neutral-500 dark:text-neutral-400">
                    {product.fileType.toUpperCase()} • {product.fileSize}
                  </span>
                  <h4 className="text-sm font-bold text-neutral-900 dark:text-white leading-snug truncate">
                    {product.title}
                  </h4>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2 mt-0.5">
                    {product.tagline || product.description}
                  </p>
                </div>
              </div>

              {/* Pay What You Want Controls (Gumroad feature) */}
              {product.payWhatYouWant ? (
                <div className="p-4 rounded-xl border border-sky-200 dark:border-sky-900/50 bg-sky-50/40 dark:bg-sky-950/20 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-neutral-900 dark:text-white flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-sky-500" />
                      Name a fair price
                    </span>
                    <span className="text-neutral-500 dark:text-neutral-400">
                      Minimum: ${product.minPrice}+
                    </span>
                  </div>

                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base font-bold text-neutral-500">
                      $
                    </span>
                    <input
                      type="number"
                      min={product.minPrice}
                      step="1"
                      value={customPrice}
                      onChange={(e) => setCustomPrice(Math.max(product.minPrice, Number(e.target.value)))}
                      className="w-full pl-8 pr-4 py-2 text-lg font-bold rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>

                  {/* Preset quick buttons */}
                  <div className="flex gap-2">
                    {[
                      product.minPrice,
                      product.suggestedPrice || product.minPrice + 10,
                      (product.suggestedPrice || product.minPrice) + 20,
                    ]
                      .filter((val, idx, arr) => arr.indexOf(val) === idx)
                      .map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setCustomPrice(val)}
                          className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                            customPrice === val
                              ? 'bg-sky-600 text-white'
                              : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 hover:border-neutral-400'
                          }`}
                        >
                          {val === 0 ? 'Free ($0)' : `$${val}`}
                        </button>
                      ))}
                  </div>
                </div>
              ) : null}

              {/* Customer Email Input */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Send files & receipt to:
                </label>
                <input
                  type="email"
                  required
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
                <span className="text-[11px] text-neutral-400 mt-1 block">
                  You will receive an instant download link and license key.
                </span>
              </div>

              {/* Discount Promo Code Input */}
              <div className="pt-1">
                <form onSubmit={handleApplyPromo} className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                    <input
                      type="text"
                      placeholder="Discount code (e.g. LAUNCH50)"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-pink-500 uppercase"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 transition-colors cursor-pointer"
                  >
                    Apply
                  </button>
                </form>

                {appliedPromo && (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1.5 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    Promo code <b>{appliedPromo.code}</b> applied (-${discountAmount.toFixed(2)})!
                  </p>
                )}
                {promoError && (
                  <p className="text-xs text-rose-500 mt-1.5">{promoError}</p>
                )}
              </div>

              {/* Order Breakdown */}
              <div className="p-3 rounded-lg bg-neutral-100/70 dark:bg-neutral-800/40 text-xs space-y-1 border border-neutral-200 dark:border-neutral-700/60">
                <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                  <span>Item price</span>
                  <span>${basePrice.toFixed(2)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium">
                    <span>Discount</span>
                    <span>-${discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold text-neutral-900 dark:text-white pt-1 border-t border-neutral-200 dark:border-neutral-700">
                  <span>Total Amount</span>
                  <span className="text-pink-600 dark:text-pink-400">
                    {finalPrice === 0 ? 'Free' : `$${finalPrice.toFixed(2)}`}
                  </span>
                </div>
              </div>

              {/* Instant Checkout Button */}
              <button
                type="button"
                onClick={handleCheckout}
                disabled={isProcessing}
                className="w-full py-3.5 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 shadow-lg shadow-pink-500/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? (
                  <span className="inline-block animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>
                      {finalPrice === 0
                        ? 'Get Free Download'
                        : `Pay $${finalPrice.toFixed(2)} & Download`}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-3 text-[11px] text-neutral-400">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  256-Bit SSL Encrypted
                </span>
                <span>•</span>
                <span>Instant access guaranteed</span>
              </div>
            </div>
          ) : (
            /* Order Completion Screen (Gumroad style) */
            <div className="text-center space-y-5 py-2 animate-fadeIn">
              <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                  Payment Successful!
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                  We've delivered the receipt and access token to{' '}
                  <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                    {completedOrder.customerEmail}
                  </span>
                </p>
              </div>

              {/* License Key box (if applicable) */}
              {completedOrder.licenseKey && (
                <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/60 text-left">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
                      <Key className="w-3 h-3 text-pink-500" />
                      YOUR LICENSE KEY
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyLicense}
                      className="text-[11px] text-pink-600 dark:text-pink-400 font-medium hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      {copiedKey ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                      {copiedKey ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <div className="font-mono text-sm font-bold text-neutral-900 dark:text-white tracking-wider select-all bg-white dark:bg-neutral-900 p-2 rounded border border-neutral-200 dark:border-neutral-700 text-center">
                    {completedOrder.licenseKey}
                  </div>
                </div>
              )}

              {/* Deliverable Download CTA */}
              <div className="p-4 rounded-xl border border-pink-200 dark:border-pink-900/60 bg-pink-50/50 dark:bg-pink-950/30 text-left space-y-2.5">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-pink-600 dark:text-pink-400" />
                  <span className="text-xs font-bold text-neutral-900 dark:text-white">
                    {product.deliverableName}
                  </span>
                  <span className="text-[10px] text-neutral-500">
                    ({product.fileSize})
                  </span>
                </div>
                <p className="text-xs text-neutral-600 dark:text-neutral-300">
                  {product.deliverableContent}
                </p>
                <a
                  href={completedOrder.downloadUrl}
                  download={product.deliverableName}
                  className="w-full py-2.5 px-4 rounded-lg font-bold text-xs text-white bg-neutral-900 dark:bg-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-100 flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download Deliverable Now
                </a>
              </div>

              {/* Order Receipt Details */}
              <div className="text-left text-xs text-neutral-500 dark:text-neutral-400 pt-2 border-t border-neutral-200 dark:border-neutral-800 space-y-1">
                <div className="flex justify-between">
                  <span>Order Reference</span>
                  <span className="font-mono">{completedOrder.id}</span>
                </div>
                <div className="flex justify-between">
                  <span>Amount Paid</span>
                  <span className="font-semibold text-neutral-900 dark:text-white">
                    ${completedOrder.amountPaid.toFixed(2)} USD
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Date</span>
                  <span>{completedOrder.date}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 text-xs font-semibold text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                Close & Return to Profile
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
