import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  QrCode,
  Share2,
  ExternalLink,
  Sliders,
  Send,
} from 'lucide-react';
import { CreatorProfile } from '../types.ts';
import { QrCodeCard } from './QrCodeCard.tsx';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: CreatorProfile;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, profile }) => {
  const [copied, setCopied] = useState(false);
  const [showUtmBuilder, setShowUtmBuilder] = useState(false);
  const [utmSource, setUtmSource] = useState('instagram');
  const [utmMedium, setUtmMedium] = useState('social');
  const [utmCampaign, setUtmCampaign] = useState('october_bio');
  const [utmCopied, setUtmCopied] = useState(false);

  if (!isOpen) return null;

  const baseUrl = profile.customDomain
    ? `https://${profile.customDomain}`
    : `https://omnilink.me/${profile.handle}`;

  const utmUrl = `${baseUrl}?utm_source=${encodeURIComponent(utmSource)}&utm_medium=${encodeURIComponent(utmMedium)}&utm_campaign=${encodeURIComponent(utmCampaign)}`;

  const handleCopyBase = () => {
    navigator.clipboard.writeText(baseUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyUtm = () => {
    navigator.clipboard.writeText(utmUrl);
    setUtmCopied(true);
    setTimeout(() => setUtmCopied(false), 2000);
  };

  const shareText = `Check out my links and projects on OmniLink: ${profile.name}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="relative w-full max-w-xl max-h-[90vh] bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl p-6 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-neutral-800 dark:text-neutral-200" />
            <h3 className="text-base font-semibold text-neutral-900 dark:text-white">
              Share Your OmniLink Profile
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* URL Box */}
        <div className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1.5">
              Public Profile URL
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={baseUrl}
                className="w-full px-3.5 py-2.5 text-xs font-mono rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/80 text-neutral-800 dark:text-neutral-200 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleCopyBase}
                className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium text-white bg-neutral-900 dark:bg-sky-600 hover:bg-neutral-800 dark:hover:bg-sky-500 rounded-lg transition-colors shrink-0 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Social One-Click Share Buttons */}
          <div>
            <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-2">
              One-Click Social Channels
            </label>
            <div className="grid grid-cols-4 gap-2 text-xs">
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(baseUrl)}`}
                target="_blank"
                rel="noreferrer"
                className="flex flex-col items-center justify-center py-2.5 px-2 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-200 transition-colors"
              >
                <span className="font-semibold text-xs">X / Twitter</span>
              </a>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(baseUrl)}`}
                target="_blank"
                rel="noreferrer"
                className="flex flex-col items-center justify-center py-2.5 px-2 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-200 transition-colors"
              >
                <span className="font-semibold text-xs">LinkedIn</span>
              </a>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`${shareText} ${baseUrl}`)}`}
                target="_blank"
                rel="noreferrer"
                className="flex flex-col items-center justify-center py-2.5 px-2 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-200 transition-colors"
              >
                <span className="font-semibold text-xs">WhatsApp</span>
              </a>
              <a
                href={`mailto:?subject=${encodeURIComponent(`Links for ${profile.name}`)}&body=${encodeURIComponent(`${shareText}\n\n${baseUrl}`)}`}
                className="flex flex-col items-center justify-center py-2.5 px-2 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-200 transition-colors"
              >
                <span className="font-semibold text-xs">Email</span>
              </a>
            </div>
          </div>

          {/* Interactive Backend-Powered QR Code Generator */}
          <QrCodeCard
            url={baseUrl}
            handle={profile.handle}
            creatorName={profile.name}
            avatarUrl={profile.avatarUrl}
            title="Profile QR Code"
            subtitle="Scannable QR code encoded with your live profile URL. Download as crisp PNG or vector SVG."
          />

          {/* Campaign UTM Generator Accordion */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setShowUtmBuilder(!showUtmBuilder)}
              className="flex items-center justify-between w-full text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-neutral-400" />
                Campaign UTM Tag Generator (For Cross-Platform Tracking)
              </span>
              <span className="text-neutral-400">{showUtmBuilder ? 'Hide' : 'Configure'}</span>
            </button>

            {showUtmBuilder && (
              <div className="mt-3 p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/60 space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[11px] font-medium text-neutral-500 dark:text-neutral-400 mb-1">
                      utm_source
                    </label>
                    <input
                      type="text"
                      value={utmSource}
                      onChange={(e) => setUtmSource(e.target.value)}
                      placeholder="e.g. instagram"
                      className="w-full px-2.5 py-1.5 text-xs rounded-md border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-neutral-500 dark:text-neutral-400 mb-1">
                      utm_medium
                    </label>
                    <input
                      type="text"
                      value={utmMedium}
                      onChange={(e) => setUtmMedium(e.target.value)}
                      placeholder="e.g. social"
                      className="w-full px-2.5 py-1.5 text-xs rounded-md border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-neutral-500 dark:text-neutral-400 mb-1">
                      utm_campaign
                    </label>
                    <input
                      type="text"
                      value={utmCampaign}
                      onChange={(e) => setUtmCampaign(e.target.value)}
                      placeholder="e.g. launch_2026"
                      className="w-full px-2.5 py-1.5 text-xs rounded-md border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="pt-1">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={utmUrl}
                      className="w-full px-3 py-1.5 text-[11px] font-mono rounded-md border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleCopyUtm}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-neutral-800 dark:bg-neutral-700 hover:bg-neutral-700 dark:hover:bg-neutral-600 rounded-md transition-colors shrink-0 cursor-pointer"
                    >
                      {utmCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{utmCopied ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-neutral-100 dark:border-neutral-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
