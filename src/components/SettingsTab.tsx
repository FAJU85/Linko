import React, { useState } from 'react';
import {
  Globe,
  Shield,
  Key,
  Webhook,
  Check,
  AlertCircle,
  Copy,
  Plus,
  Trash2,
  Send,
  Lock,
  Layers,
  Save,
  CheckCircle2,
  Bot,
  Bell,
} from 'lucide-react';
import { sendTelegramNotification } from '../utils/telegram.ts';
import { CreatorProfile, ApiKeyItem, WebhookItem, SocialPlatform } from '../types.ts';
import { INITIAL_API_KEYS, INITIAL_WEBHOOKS } from '../data/mockData.ts';

interface SettingsTabProps {
  profile: CreatorProfile;
  setProfile: React.Dispatch<React.SetStateAction<CreatorProfile>>;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({ profile, setProfile }) => {
  const [domainInput, setDomainInput] = useState(profile.customDomain || '');
  const [isVerifyingDomain, setIsVerifyingDomain] = useState(false);
  const [domainVerified, setDomainVerified] = useState(profile.customDomainVerified);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [dnsProvider, setDnsProvider] = useState<'cloudflare' | 'standard'>('cloudflare');

  // API Keys & Webhooks
  const [apiKeys, setApiKeys] = useState<ApiKeyItem[]>(INITIAL_API_KEYS);
  const [webhooks, setWebhooks] = useState<WebhookItem[]>(INITIAL_WEBHOOKS);
  const [newKeyName, setNewKeyName] = useState('');
  const [showAddKeyModal, setShowAddKeyModal] = useState(false);
  const [pingStatus, setPingStatus] = useState<string | null>(null);

  // Form states for 3P integrations
  const [gaId, setGaId] = useState(profile.thirdPartyIntegrations.gaMeasurementId || '');
  const [pixelId, setPixelId] = useState(profile.thirdPartyIntegrations.metaPixelId || '');
  const [zapierUrl, setZapierUrl] = useState(profile.thirdPartyIntegrations.zapierWebhookUrl || '');

  // Privacy toggles
  const [cookieBanner, setCookieBanner] = useState(profile.privacySettings.cookieBanner);
  const [anonymizeIp, setAnonymizeIp] = useState(profile.privacySettings.anonymizeIp);
  const [allowIndexing, setAllowIndexing] = useState(profile.privacySettings.allowSearchIndexing);
  const [gdprNotice, setGdprNotice] = useState(profile.privacySettings.gdprConsentNotice);

  // Social Links
  const [socials, setSocials] = useState(profile.socials);
  const [telegramTestStatus, setTelegramTestStatus] = useState<string | null>(null);

  const handleSendTestTelegram = async () => {
    setTelegramTestStatus('Dispatching alert to @mob_con_bot...');
    const res = await sendTelegramNotification(
      '👋 *OmniLink Creator Alert Test*\n\nYour Telegram bot *@mob_con_bot* is connected to OmniLink for admin *ee.ee455@gmail.com*.\nYou will receive instant mobile push notifications for new supporter tips, newsletter signups, and locked asset accesses!'
    );
    if (res.success) {
      setTelegramTestStatus('Delivered to Telegram User ID 7043475!');
    } else {
      setTelegramTestStatus(`Error: ${res.error || 'Check bot configuration'}`);
    }
    setTimeout(() => setTelegramTestStatus(null), 5000);
  };

  const handleVerifyDomain = () => {
    setIsVerifyingDomain(true);
    setTimeout(() => {
      setIsVerifyingDomain(false);
      setDomainVerified(true);
      setProfile((prev) => ({
        ...prev,
        customDomain: domainInput.trim(),
        customDomainVerified: true,
      }));
    }, 900);
  };

  const handleSaveAllSettings = () => {
    setProfile((prev) => ({
      ...prev,
      customDomain: domainInput.trim(),
      customDomainVerified: domainVerified,
      privacySettings: {
        ...prev.privacySettings,
        cookieBanner,
        anonymizeIp,
        allowSearchIndexing: allowIndexing,
        gdprConsentNotice: gdprNotice,
      },
      thirdPartyIntegrations: {
        ...prev.thirdPartyIntegrations,
        gaMeasurementId: gaId.trim() || undefined,
        metaPixelId: pixelId.trim() || undefined,
        zapierWebhookUrl: zapierUrl.trim() || undefined,
      },
      socials,
    }));

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleCreateApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;
    const newKey: ApiKeyItem = {
      id: `key-${Date.now()}`,
      name: newKeyName.trim(),
      key: `lt_live_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
      createdAt: new Date().toISOString().slice(0, 10),
      scopes: ['read:analytics', 'read:subscribers'],
    };
    setApiKeys((prev) => [...prev, newKey]);
    setNewKeyName('');
    setShowAddKeyModal(false);
  };

  const handleDeleteApiKey = (id: string) => {
    setApiKeys((prev) => prev.filter((k) => k.id !== id));
  };

  const handleTestPingWebhook = (hookId: string) => {
    setPingStatus(`Ping dispatched to endpoint...`);
    setTimeout(() => {
      setWebhooks((prev) =>
        prev.map((h) =>
          h.id === hookId
            ? { ...h, lastDeliveredAt: `${new Date().toLocaleTimeString()} (200 OK - 42ms)` }
            : h
        )
      );
      setPingStatus('Delivered: 200 OK');
      setTimeout(() => setPingStatus(null), 3000);
    }, 600);
  };

  const handleUpdateSocialUrl = (platform: SocialPlatform, url: string) => {
    setSocials((prev) =>
      prev.map((s) => (s.platform === platform ? { ...s, url } : s))
    );
  };

  const handleToggleSocial = (platform: SocialPlatform) => {
    setSocials((prev) =>
      prev.map((s) => (s.platform === platform ? { ...s, enabled: !s.enabled } : s))
    );
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Top Banner with Save Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2">
        <div>
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
            Domain, Privacy & API Settings
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Configure custom domains, GDPR privacy options, and secure marketing webhooks.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSaveAllSettings}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-sky-600 dark:hover:bg-sky-500 rounded-xl transition-colors shadow-xs cursor-pointer"
        >
          {savedSuccess ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Save className="w-3.5 h-3.5" />}
          <span>{savedSuccess ? 'Settings Saved!' : 'Save Settings'}</span>
        </button>
      </div>

      {/* 1. Custom Domain Support */}
      <div className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-sky-500" />
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
              Custom Domain Connection
            </h3>
          </div>
          {domainVerified ? (
            <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" /> DNS Validated & SSL Active
            </span>
          ) : (
            <span className="text-[11px] font-mono text-amber-500">Pending Verification</span>
          )}
        </div>

        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          Serve your profile directly on your own apex or subdomain (e.g. <span className="font-mono text-neutral-700 dark:text-neutral-300">links.yourbrand.com</span>) with automatic SSL certificates.
        </p>

        {/* DNS Provider Selector */}
        <div className="flex items-center gap-2 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg max-w-sm">
          <button
            type="button"
            onClick={() => setDnsProvider('cloudflare')}
            className={`flex-1 py-1 px-3 text-xs font-medium rounded-md transition-all cursor-pointer text-center ${
              dnsProvider === 'cloudflare'
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs font-semibold'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            Cloudflare (Active)
          </button>
          <button
            type="button"
            onClick={() => setDnsProvider('standard')}
            className={`flex-1 py-1 px-3 text-xs font-medium rounded-md transition-all cursor-pointer text-center ${
              dnsProvider === 'standard'
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs font-semibold'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            Standard DNS
          </button>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={domainInput}
            onChange={(e) => {
              setDomainInput(e.target.value);
              setDomainVerified(false);
            }}
            placeholder="links.yourname.com"
            className="w-full max-w-md px-3.5 py-2 text-xs font-mono rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none"
          />
          <button
            type="button"
            disabled={isVerifyingDomain || !domainInput}
            onClick={handleVerifyDomain}
            className="px-4 py-2 text-xs font-medium text-white bg-neutral-900 dark:bg-neutral-800 dark:hover:bg-neutral-700 rounded-lg disabled:opacity-50 transition-colors cursor-pointer shrink-0"
          >
            {isVerifyingDomain ? (dnsProvider === 'cloudflare' ? 'Querying 1.1.1.1...' : 'Validating DNS...') : 'Verify DNS'}
          </button>
        </div>

        {dnsProvider === 'cloudflare' ? (
          /* Cloudflare Specific Instructions & Controls */
          <div className="p-4 rounded-xl border border-amber-200/80 dark:border-amber-900/40 bg-amber-50/40 dark:bg-amber-950/20 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                <h4 className="text-xs font-bold text-neutral-900 dark:text-white">
                  Cloudflare DNS & Proxy Instructions
                </h4>
              </div>
              <span className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400">
                Cloudflare 1.1.1.1 Compatible
              </span>
            </div>

            {/* Cloudflare Records Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-amber-200/60 dark:border-amber-900/60 text-neutral-500 dark:text-neutral-400 font-mono">
                    <th className="py-2 pr-3 font-normal">Type</th>
                    <th className="py-2 px-3 font-normal">Name (Host)</th>
                    <th className="py-2 px-3 font-normal">Target</th>
                    <th className="py-2 px-3 font-normal">Proxy Status</th>
                    <th className="py-2 pl-3 font-normal text-right">TTL</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-200/40 dark:divide-amber-900/30 font-mono text-[11px]">
                  <tr>
                    <td className="py-2.5 pr-3 font-bold text-amber-600 dark:text-amber-400">CNAME</td>
                    <td className="py-2.5 px-3 text-neutral-800 dark:text-neutral-200">
                      {domainInput.includes('.') ? domainInput.split('.')[0] : 'links'} (or @)
                    </td>
                    <td className="py-2.5 px-3 text-neutral-800 dark:text-neutral-200">cname.omnilink.me</td>
                    <td className="py-2.5 px-3">
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-500/20 text-amber-700 dark:text-amber-300">
                        🟠 Proxied or ⚪ DNS Only
                      </span>
                    </td>
                    <td className="py-2.5 pl-3 text-right text-neutral-500 dark:text-neutral-400">Auto</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Critical Cloudflare Settings Checklist */}
            <div className="space-y-2 pt-1 text-xs text-neutral-700 dark:text-neutral-300">
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-neutral-900 dark:text-white">SSL/TLS Mode: </span>
                  In Cloudflare dashboard &rarr; <span className="font-mono text-[11px]">SSL/TLS</span> tab, ensure mode is set to <span className="font-semibold text-neutral-900 dark:text-white">Full</span> or <span className="font-semibold text-neutral-900 dark:text-white">Full (Strict)</span>. Avoid <em>Flexible</em> to prevent redirect loop errors.
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-neutral-900 dark:text-white">Apex Domain CNAME Flattening: </span>
                  If using your root domain (<span className="font-mono text-[11px]">@</span>), Cloudflare handles CNAME Flattening automatically at the edge with zero latency penalty.
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-neutral-900 dark:text-white">Initial Certificate Issuance: </span>
                  If you experience an SSL warning right after setup, temporarily toggle Proxy status to <span className="font-mono text-[11px]">DNS Only (Grey Cloud)</span> for 2 minutes while Let's Encrypt issues the certificate, then re-enable <span className="font-mono text-[11px]">Proxied (Orange Cloud)</span>.
                </div>
              </div>
            </div>

            {/* Copy Cloudflare BIND Format */}
            <div className="pt-2 flex items-center justify-between border-t border-amber-200/50 dark:border-amber-900/30">
              <span className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400">
                BIND Zone line: {domainInput.split('.')[0] || 'links'} IN CNAME cname.omnilink.me.
              </span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(`${domainInput.split('.')[0] || 'links'} IN CNAME cname.omnilink.me.`);
                  alert('Copied Cloudflare DNS BIND record to clipboard!');
                }}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded border border-neutral-300 dark:border-neutral-700 hover:bg-white dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                <Copy className="w-3 h-3 text-neutral-500" />
                <span>Copy Record</span>
              </button>
            </div>
          </div>
        ) : (
          /* Standard DNS Configuration Guide Table */
          <div className="pt-2">
            <h4 className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 mb-2">
              Required DNS Records in Your Domain Registrar
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-neutral-200 dark:border-neutral-800 text-neutral-400 font-mono">
                    <th className="py-2 pr-4 font-normal">Type</th>
                    <th className="py-2 px-4 font-normal">Host / Name</th>
                    <th className="py-2 px-4 font-normal">Target / Value</th>
                    <th className="py-2 pl-4 font-normal text-right">TTL</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 font-mono text-[11px]">
                  <tr>
                    <td className="py-2.5 pr-4 text-sky-600 dark:text-sky-400 font-semibold">CNAME</td>
                    <td className="py-2.5 px-4 text-neutral-700 dark:text-neutral-300">links (or @)</td>
                    <td className="py-2.5 px-4 text-neutral-700 dark:text-neutral-300">cname.omnilink.me</td>
                    <td className="py-2.5 pl-4 text-right text-neutral-400">Automatic / 3600</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-4 text-purple-600 dark:text-purple-400 font-semibold">A Record</td>
                    <td className="py-2.5 px-4 text-neutral-700 dark:text-neutral-300">@</td>
                    <td className="py-2.5 px-4 text-neutral-700 dark:text-neutral-300">76.76.21.21</td>
                    <td className="py-2.5 pl-4 text-right text-neutral-400">3600</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* 2. Data Privacy Compliance (GDPR & CCPA) */}
      <div className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs space-y-5">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-500" />
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
            Data Privacy & GDPR / CCPA Compliance
          </h3>
        </div>

        <div className="space-y-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={cookieBanner}
              onChange={(e) => setCookieBanner(e.target.checked)}
              className="mt-0.5 rounded border-neutral-300 dark:border-neutral-700 text-sky-600 focus:ring-0 cursor-pointer"
            />
            <div>
              <span className="text-xs font-medium text-neutral-900 dark:text-white block">
                Enable Privacy & Cookie Consent Banner on Public Profile
              </span>
              <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
                Displays an unobtrusive consent drawer with Accept/Decline options before logging non-essential visits.
              </span>
            </div>
          </label>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={anonymizeIp}
              onChange={(e) => setAnonymizeIp(e.target.checked)}
              className="mt-0.5 rounded border-neutral-300 dark:border-neutral-700 text-sky-600 focus:ring-0 cursor-pointer"
            />
            <div>
              <span className="text-xs font-medium text-neutral-900 dark:text-white block">
                Anonymize Visitor IP Addresses (Zero-PII Analytics)
              </span>
              <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
                Strips the last octet of visitor IP addresses prior to storing metrics in the telemetry database.
              </span>
            </div>
          </label>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={allowIndexing}
              onChange={(e) => setAllowIndexing(e.target.checked)}
              className="mt-0.5 rounded border-neutral-300 dark:border-neutral-700 text-sky-600 focus:ring-0 cursor-pointer"
            />
            <div>
              <span className="text-xs font-medium text-neutral-900 dark:text-white block">
                Allow Search Engine Indexing (Google & Bing SEO)
              </span>
              <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
                Includes robots meta tags allowing search engines to index your landing page.
              </span>
            </div>
          </label>

          <div className="pt-2">
            <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1.5">
              Custom Legal Consent Statement
            </label>
            <input
              type="text"
              value={gdprNotice}
              onChange={(e) => setGdprNotice(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* 3. Social Media Platforms Integration */}
      <div className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-sky-500" />
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
            Connected Social Media Accounts
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {socials.map((s) => (
            <div key={s.platform} className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/40 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase text-neutral-700 dark:text-neutral-300">
                  {s.platform}
                </span>
                <label className="flex items-center gap-1.5 text-[11px] cursor-pointer text-neutral-500">
                  <input
                    type="checkbox"
                    checked={s.enabled}
                    onChange={() => handleToggleSocial(s.platform)}
                    className="rounded text-sky-600 focus:ring-0 cursor-pointer"
                  />
                  <span>Show</span>
                </label>
              </div>
              <input
                type="url"
                value={s.url}
                onChange={(e) => handleUpdateSocialUrl(s.platform, e.target.value)}
                placeholder={`https://${s.platform}.com/username`}
                className="w-full px-2.5 py-1 text-xs font-mono rounded border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 focus:outline-none"
              />
            </div>
          ))}
        </div>
      </div>

      {/* 4. Third-Party Marketing Tracking Tools */}
      <div className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs space-y-5">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-purple-500" />
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
            Marketing Analytics & Attribution Pixels
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1.5">
              Google Analytics 4 Measurement ID
            </label>
            <input
              type="text"
              value={gaId}
              onChange={(e) => setGaId(e.target.value)}
              placeholder="G-XXXXXXXXXX"
              className="w-full px-3.5 py-2 text-xs font-mono rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1.5">
              Meta (Facebook / Instagram) Pixel ID
            </label>
            <input
              type="text"
              value={pixelId}
              onChange={(e) => setPixelId(e.target.value)}
              placeholder="e.g. 10984712093847"
              className="w-full px-3.5 py-2 text-xs font-mono rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1.5">
            Zapier Catch Hook URL
          </label>
          <input
            type="url"
            value={zapierUrl}
            onChange={(e) => setZapierUrl(e.target.value)}
            placeholder="https://hooks.zapier.com/hooks/catch/..."
            className="w-full px-3.5 py-2 text-xs font-mono rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none"
          />
        </div>
      </div>

      {/* 5. Secure API Integration & Webhooks */}
      <div className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-sky-500" />
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
              Secure API Keys & Scopes
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setShowAddKeyModal(true)}
            className="flex items-center gap-1 px-3 py-1 text-xs font-semibold text-neutral-800 dark:text-neutral-200 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 rounded-lg cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Generate New Key</span>
          </button>
        </div>

        <div className="space-y-2.5">
          {apiKeys.map((key) => (
            <div
              key={key.id}
              className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 flex items-center justify-between gap-4"
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-neutral-900 dark:text-white truncate">
                    {key.name}
                  </span>
                  <span className="text-[10px] font-mono text-neutral-400">Created {key.createdAt}</span>
                </div>
                <div className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400 truncate">
                  {key.key}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => navigator.clipboard.writeText(key.key)}
                  className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-md cursor-pointer"
                  title="Copy Key"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteApiKey(key.id)}
                  className="p-1.5 text-neutral-400 hover:text-rose-500 rounded-md cursor-pointer"
                  title="Revoke Key"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Webhooks Section */}
        <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Webhook className="w-4 h-4 text-emerald-500" />
              <h4 className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                Outbound Webhooks (Real-Time Events)
              </h4>
            </div>
            {pingStatus && (
              <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400">
                {pingStatus}
              </span>
            )}
          </div>

          <div className="space-y-2">
            {webhooks.map((hook) => (
              <div
                key={hook.id}
                className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 flex items-center justify-between gap-4"
              >
                <div className="min-w-0 space-y-1">
                  <div className="text-xs font-mono text-neutral-800 dark:text-neutral-200 truncate">
                    {hook.url}
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-neutral-400 font-mono">
                    <span>Events: {hook.events.join(', ')}</span>
                    <span aria-hidden="true">·</span>
                    <span>Last: {hook.lastDeliveredAt || 'Never'}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleTestPingWebhook(hook.id)}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-200 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors cursor-pointer shrink-0"
                >
                  <Send className="w-3 h-3 text-sky-500" />
                  <span>Send Test Ping</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 6. Admin & Telegram Instant Alerts */}
      <div className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-sky-500" />
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
              Admin & Telegram Instant Alerts
            </h3>
          </div>
          <span className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5" /> Bot Active: @mob_con_bot
          </span>
        </div>

        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          Real-time mobile push notifications sent directly to your Telegram chat when followers send tips, subscribe to your newsletter, or unlock protected links.
        </p>

        {/* Telegram Config Details */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/40 space-y-1">
            <span className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">Admin Email</span>
            <div className="text-xs font-mono font-semibold text-neutral-900 dark:text-white truncate">
              ee.ee455@gmail.com
            </div>
          </div>

          <div className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/40 space-y-1">
            <span className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">Telegram Bot</span>
            <div className="text-xs font-mono font-semibold text-sky-600 dark:text-sky-400 truncate">
              @mob_con_bot
            </div>
          </div>

          <div className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/40 space-y-1">
            <span className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">Telegram User ID</span>
            <div className="text-xs font-mono font-semibold text-neutral-900 dark:text-white truncate">
              7043475
            </div>
          </div>
        </div>

        {/* Real-time Event Triggers */}
        <div className="space-y-2 pt-1 text-xs">
          <div className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
            Active Real-Time Alert Triggers
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div className="p-2.5 rounded-lg border border-neutral-200 dark:border-neutral-800 flex items-center gap-2">
              <Bell className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span className="text-neutral-800 dark:text-neutral-200 text-xs">New Supporter Tip Alert</span>
            </div>
            <div className="p-2.5 rounded-lg border border-neutral-200 dark:border-neutral-800 flex items-center gap-2">
              <Bell className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span className="text-neutral-800 dark:text-neutral-200 text-xs">Newsletter Signup Alert</span>
            </div>
            <div className="p-2.5 rounded-lg border border-neutral-200 dark:border-neutral-800 flex items-center gap-2">
              <Bell className="w-3.5 h-3.5 text-purple-500 shrink-0" />
              <span className="text-neutral-800 dark:text-neutral-200 text-xs">Secret Link Unlock Alert</span>
            </div>
          </div>
        </div>

        {/* Test Alert Button */}
        <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-neutral-100 dark:border-neutral-800">
          <div className="text-xs text-neutral-500 dark:text-neutral-400">
            {telegramTestStatus ? (
              <span className="font-mono text-emerald-600 dark:text-emerald-400">{telegramTestStatus}</span>
            ) : (
              <span>Verify Telegram delivery by sending an instant test ping.</span>
            )}
          </div>

          <button
            type="button"
            onClick={handleSendTestTelegram}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-sky-600 hover:bg-sky-500 text-white transition-colors shadow-2xs cursor-pointer shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send Test Telegram Alert</span>
          </button>
        </div>
      </div>

      {/* Add API Key Modal */}
      {showAddKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl p-6">
            <h3 className="text-base font-semibold text-neutral-900 dark:text-white mb-3">
              Generate Developer API Key
            </h3>
            <form onSubmit={handleCreateApiKey} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                  Application / Integration Label
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Production Analytics Ingestion"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddKeyModal(false)}
                  className="px-4 py-2 text-xs font-medium text-neutral-600 dark:text-neutral-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-neutral-900 dark:bg-sky-600 rounded-lg"
                >
                  Generate Key
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
