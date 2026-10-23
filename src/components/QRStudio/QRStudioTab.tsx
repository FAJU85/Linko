import React, { useState, useEffect, useCallback } from 'react';
import {
  Download,
  Copy,
  Check,
  RefreshCw,
  QrCode,
  Sparkles,
  Palette,
  LayoutTemplate,
  Sliders,
  Utensils,
  Share2,
  ExternalLink,
  Layers,
  FileCode,
  Image as ImageIcon,
  Wifi,
  User,
  ShoppingBag,
  Printer,
  Table as TableIcon,
} from 'lucide-react';
import {
  QrEyeShape,
  QrBodyShape,
  QrFrameStyle,
  QrLogoType,
  QrDataType,
} from '../../types.ts';

interface QRStudioTabProps {
  currentUrl?: string;
  creatorName?: string;
  creatorHandle?: string;
}

const PRESET_GRADIENTS = [
  { name: 'Obsidian Noir', start: '#090a0f', end: '#334155' },
  { name: 'Crimson Flame', start: '#e11d48', end: '#f97316' },
  { name: 'Cyberpunk Violet', start: '#7c3aed', end: '#ec4899' },
  { name: 'Ocean Cyan', start: '#0284c7', end: '#06b6d4' },
  { name: 'Emerald Forest', start: '#059669', end: '#10b981' },
  { name: 'Amber Gold', start: '#d97706', end: '#f59e0b' },
];

export const QRStudioTab: React.FC<QRStudioTabProps> = ({
  currentUrl = 'https://omnilink.me/lumiere',
  creatorName = 'Lumière Dining & Lounge',
  creatorHandle = 'lumiere',
}) => {
  // Input Data Type
  const [dataType, setDataType] = useState<QrDataType>('restaurant_table');
  const [targetUrl, setTargetUrl] = useState(currentUrl);
  const [tableNumber, setTableNumber] = useState('Table 4');
  const [wifiSsid, setWifiSsid] = useState('Lumiere-Guest');
  const [wifiPassword, setWifiPassword] = useState('truffle2026');
  const [vcardName, setVcardName] = useState('Chef Julian Vance');
  const [vcardPhone, setVcardPhone] = useState('+1 (555) 234-5678');
  const [plainText, setPlainText] = useState('Welcome to our table-side order system');

  // Styling Config (QR Monkey & QRCodeChimp)
  const [format, setFormat] = useState<'svg' | 'png'>('svg');
  const [darkColor, setDarkColor] = useState('#0f172a');
  const [lightColor, setLightColor] = useState('#ffffff');
  const [eyeShape, setEyeShape] = useState<QrEyeShape>('rounded');
  const [bodyShape, setBodyShape] = useState<QrBodyShape>('dots');
  const [eyeColor, setEyeColor] = useState('#0f172a');
  const [isGradient, setIsGradient] = useState(true);
  const [gradientColor, setGradientColor] = useState('#f97316');
  const [frameStyle, setFrameStyle] = useState<QrFrameStyle>('scan-me-bottom');
  const [frameText, setFrameText] = useState('SCAN TO ORDER');
  const [frameColor, setFrameColor] = useState('#0f172a');
  const [logoType, setLogoType] = useState<QrLogoType>('utensils');
  const [errorCorrection, setErrorCorrection] = useState<'L' | 'M' | 'Q' | 'H'>('Q');

  // State
  const [previewSvg, setPreviewSvg] = useState<string>('');
  const [previewPng, setPreviewPng] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [activeTabSection, setActiveTabSection] = useState<'content' | 'design' | 'batch'>('design');

  // Compute final encoded payload
  const getEncodedPayload = useCallback(() => {
    switch (dataType) {
      case 'restaurant_table': {
        const cleanTable = tableNumber.replace(/[^0-9]/g, '') || '1';
        const sep = targetUrl.includes('?') ? '&' : '?';
        return `${targetUrl}${sep}table=${cleanTable}`;
      }
      case 'wifi':
        return `WIFI:T:WPA;S:${wifiSsid};P:${wifiPassword};;`;
      case 'vcard':
        return `BEGIN:VCARD\nVERSION:3.0\nFN:${vcardName}\nTEL:${vcardPhone}\nEND:VCARD`;
      case 'text':
        return plainText;
      case 'url':
      case 'store_product':
      default:
        return targetUrl;
    }
  }, [dataType, targetUrl, tableNumber, wifiSsid, wifiPassword, vcardName, vcardPhone, plainText]);

  // Fetch vector preview from real backend
  const fetchQrPreview = useCallback(async () => {
    setIsLoading(true);
    const payload = getEncodedPayload();

    try {
      const resSvg = await fetch('/api/qr/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: payload,
          format: 'svg',
          errorCorrectionLevel: errorCorrection,
          eyeShape,
          bodyShape,
          darkColor,
          lightColor,
          eyeColor: eyeColor || darkColor,
          isGradient,
          gradientColor,
          frameStyle,
          frameText: dataType === 'restaurant_table' ? `${tableNumber} - ${frameText}` : frameText,
          frameColor,
          logoType,
          creatorName,
          creatorHandle,
        }),
      });

      if (resSvg.ok) {
        const data = await resSvg.json();
        setPreviewSvg(data.data);
      }

      const resPng = await fetch('/api/qr/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: payload,
          format: 'png',
          errorCorrectionLevel: errorCorrection,
          darkColor,
          lightColor,
        }),
      });

      if (resPng.ok) {
        const data = await resPng.json();
        setPreviewPng(data.data);
      }
    } catch (e) {
      console.error('Failed to generate QR preview:', e);
    } finally {
      setIsLoading(false);
    }
  }, [
    getEncodedPayload,
    errorCorrection,
    eyeShape,
    bodyShape,
    darkColor,
    lightColor,
    eyeColor,
    isGradient,
    gradientColor,
    frameStyle,
    frameText,
    frameColor,
    logoType,
    creatorName,
    creatorHandle,
    dataType,
    tableNumber,
  ]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchQrPreview();
    }, 200);
    return () => clearTimeout(timer);
  }, [fetchQrPreview]);

  // Download QR Code
  const handleDownload = () => {
    const payload = getEncodedPayload();
    if (format === 'svg') {
      const blob = new Blob([previewSvg], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `qr-${creatorHandle}-${dataType}.svg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else {
      const downloadUrl = `/api/qr?url=${encodeURIComponent(payload)}&format=png&download=true&dark=${encodeURIComponent(darkColor)}&light=${encodeURIComponent(lightColor)}`;
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `qr-${creatorHandle}-${dataType}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const handleCopySvg = () => {
    navigator.clipboard.writeText(previewSvg);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(getEncodedPayload());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-2xl bg-neutral-900 text-white border border-neutral-800 shadow-md">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-sm">
              <QrCode className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold tracking-tight">QR Studio & Table Dispatcher</h2>
          </div>
          <p className="mt-1.5 text-xs text-neutral-400 max-w-xl">
            Vector QR generator inspired by QR Monkey and QRCodeChimp. Render table-specific deep links, custom frame banners, dot/matrix modules, gradients, and center emblems.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={fetchQrPreview}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Regenerate</span>
          </button>
          <button
            type="button"
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors shadow-sm cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download {format.toUpperCase()}</span>
          </button>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Controls & Customizers (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Sub-nav tabs */}
          <div className="flex items-center gap-2 p-1 rounded-xl bg-neutral-100 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 text-xs">
            <button
              type="button"
              onClick={() => setActiveTabSection('design')}
              className={`flex-1 py-2 px-3 rounded-lg font-medium transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTabSection === 'design'
                  ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs font-semibold'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>Design & Frames</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTabSection('content')}
              className={`flex-1 py-2 px-3 rounded-lg font-medium transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTabSection === 'content'
                  ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs font-semibold'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Content & Payload</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTabSection('batch')}
              className={`flex-1 py-2 px-3 rounded-lg font-medium transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTabSection === 'batch'
                  ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs font-semibold'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Table Tent Batch</span>
            </button>
          </div>

          {/* Section 1: Content Type */}
          {activeTabSection === 'content' && (
            <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-4 shadow-xs">
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-amber-500" />
                Select Payload Type
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { id: 'restaurant_table', label: 'Restaurant Table', icon: Utensils, desc: 'Contactless deep link' },
                  { id: 'url', label: 'Website / Link', icon: ExternalLink, desc: 'Any custom destination' },
                  { id: 'store_product', label: 'Digital Product', icon: ShoppingBag, desc: 'Gumroad direct checkout' },
                  { id: 'wifi', label: 'Wi-Fi Access', icon: Wifi, desc: 'Direct connect credentials' },
                  { id: 'vcard', label: 'vCard Contact', icon: User, desc: 'Chef / manager business card' },
                  { id: 'text', label: 'Plain Text', icon: Layers, desc: 'Free-form string' },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setDataType(item.id as QrDataType)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        dataType === item.id
                          ? 'border-amber-500 bg-amber-500/10 text-neutral-900 dark:text-white ring-1 ring-amber-500'
                          : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/60 text-neutral-700 dark:text-neutral-300'
                      }`}
                    >
                      <Icon className="w-4 h-4 mb-1.5 text-amber-500" />
                      <div className="text-xs font-semibold">{item.label}</div>
                      <div className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-0.5">{item.desc}</div>
                    </button>
                  );
                })}
              </div>

              {/* Dynamic Payload Form */}
              <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 space-y-3">
                {dataType === 'restaurant_table' && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                          Base Profile / Menu URL
                        </label>
                        <input
                          type="text"
                          value={targetUrl}
                          onChange={(e) => setTargetUrl(e.target.value)}
                          className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                          Table Assigned
                        </label>
                        <select
                          value={tableNumber}
                          onChange={(e) => {
                            setTableNumber(e.target.value);
                            setFrameText(`${e.target.value} • SCAN TO ORDER`);
                          }}
                          className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none cursor-pointer"
                        >
                          {Array.from({ length: 20 }, (_, i) => `Table ${i + 1}`).map((tbl) => (
                            <option key={tbl} value={tbl}>
                              {tbl}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-800/60 text-[11px] font-mono text-neutral-600 dark:text-neutral-300 truncate">
                      Encoded: {getEncodedPayload()}
                    </div>
                  </div>
                )}

                {dataType === 'url' && (
                  <div>
                    <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                      Destination URL
                    </label>
                    <input
                      type="url"
                      value={targetUrl}
                      onChange={(e) => setTargetUrl(e.target.value)}
                      placeholder="https://yourdomain.com"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none"
                    />
                  </div>
                )}

                {dataType === 'wifi' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                        Network SSID
                      </label>
                      <input
                        type="text"
                        value={wifiSsid}
                        onChange={(e) => setWifiSsid(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                        Wi-Fi Password
                      </label>
                      <input
                        type="text"
                        value={wifiPassword}
                        onChange={(e) => setWifiPassword(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {dataType === 'vcard' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={vcardName}
                        onChange={(e) => setVcardName(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="text"
                        value={vcardPhone}
                        onChange={(e) => setVcardPhone(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {dataType === 'text' && (
                  <div>
                    <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                      Text Message / Note
                    </label>
                    <textarea
                      rows={3}
                      value={plainText}
                      onChange={(e) => setPlainText(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Section 2: Design & Frames (QR Monkey & QRCodeChimp) */}
          {activeTabSection === 'design' && (
            <div className="space-y-5">
              {/* Frame Card Styles (QRCodeChimp) */}
              <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-3.5 shadow-xs">
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-white flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <LayoutTemplate className="w-4 h-4 text-amber-500" />
                    Frame Template (QRCodeChimp)
                  </span>
                  <span className="text-[10px] text-neutral-500">CTA Banner & Badges</span>
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {[
                    { id: 'none', label: 'Clean QR' },
                    { id: 'scan-me-bottom', label: 'Bottom Banner' },
                    { id: 'scan-me-top', label: 'Top Banner' },
                    { id: 'polaroid', label: 'Polaroid' },
                    { id: 'badge', label: 'Border Badge' },
                  ].map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setFrameStyle(f.id as QrFrameStyle)}
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                        frameStyle === f.id
                          ? 'border-amber-500 bg-amber-500/10 text-neutral-900 dark:text-white ring-1 ring-amber-500 font-semibold'
                          : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                      }`}
                    >
                      <span className="text-xs">{f.label}</span>
                    </button>
                  ))}
                </div>

                {frameStyle !== 'none' && (
                  <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                        Frame CTA Text
                      </label>
                      <input
                        type="text"
                        value={frameText}
                        onChange={(e) => setFrameText(e.target.value)}
                        placeholder="SCAN ME / SCAN TO ORDER"
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                        Frame Accent Color
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={frameColor}
                          onChange={(e) => setFrameColor(e.target.value)}
                          className="w-8 h-8 rounded-lg border border-neutral-300 dark:border-neutral-700 cursor-pointer bg-transparent"
                        />
                        <input
                          type="text"
                          value={frameColor}
                          onChange={(e) => setFrameColor(e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs font-mono rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Eyes & Body Matrix (QR Monkey) */}
              <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-4 shadow-xs">
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-white flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    Finder Eyes & Body Pattern (QR Monkey)
                  </span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Eyes */}
                  <div>
                    <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-2">
                      Corner Eye Shape
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'square', label: 'Classic' },
                        { id: 'rounded', label: 'Smooth' },
                        { id: 'circle', label: 'Circular' },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setEyeShape(item.id as QrEyeShape)}
                          className={`py-2 px-2.5 rounded-lg border text-xs text-center transition-all cursor-pointer ${
                            eyeShape === item.id
                              ? 'border-amber-500 bg-amber-500/10 text-neutral-900 dark:text-white font-semibold'
                              : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Body Matrix */}
                  <div>
                    <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-2">
                      Module Dot Style
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'square', label: 'Square' },
                        { id: 'dots', label: 'Dots' },
                        { id: 'rounded', label: 'Rounded' },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setBodyShape(item.id as QrBodyShape)}
                          className={`py-2 px-2.5 rounded-lg border text-xs text-center transition-all cursor-pointer ${
                            bodyShape === item.id
                              ? 'border-amber-500 bg-amber-500/10 text-neutral-900 dark:text-white font-semibold'
                              : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Color & Linear Gradient */}
              <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
                    <Palette className="w-4 h-4 text-amber-500" />
                    Color Presets & Gradients
                  </h3>
                  <label className="flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isGradient}
                      onChange={(e) => setIsGradient(e.target.checked)}
                      className="rounded border-neutral-300 text-amber-500 focus:ring-amber-400"
                    />
                    <span>Enable Gradient</span>
                  </label>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {PRESET_GRADIENTS.map((p) => (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() => {
                        setDarkColor(p.start);
                        setGradientColor(p.end);
                        setIsGradient(true);
                      }}
                      className="p-2 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:scale-105 transition-all text-center cursor-pointer group"
                    >
                      <div
                        className="w-full h-6 rounded-md mb-1.5 shadow-2xs"
                        style={{ background: `linear-gradient(135deg, ${p.start}, ${p.end})` }}
                      />
                      <span className="text-[10px] font-medium text-neutral-600 dark:text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-white truncate block">
                        {p.name.split(' ')[0]}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Center Logo Badge */}
              <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-3.5 shadow-xs">
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
                  <Utensils className="w-4 h-4 text-amber-500" />
                  Center Icon & Brand Emblem
                </h3>

                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                  {[
                    { id: 'none', label: 'None' },
                    { id: 'utensils', label: 'Dining' },
                    { id: 'coffee', label: 'Café' },
                    { id: 'shop', label: 'Store' },
                    { id: 'sparkles', label: 'Sparkle' },
                    { id: 'star', label: 'Star' },
                    { id: 'heart', label: 'Heart' },
                    { id: 'link', label: 'Link' },
                  ].map((logo) => (
                    <button
                      key={logo.id}
                      type="button"
                      onClick={() => setLogoType(logo.id as QrLogoType)}
                      className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                        logoType === logo.id
                          ? 'border-amber-500 bg-amber-500/10 text-neutral-900 dark:text-white font-semibold ring-1 ring-amber-500'
                          : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                      }`}
                    >
                      <span className="text-xs">{logo.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Section 3: Batch Table Generator */}
          {activeTabSection === 'batch' && (
            <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
                    <Printer className="w-4 h-4 text-amber-500" />
                    Batch Table Tent Card Dispatcher
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                    Generate scannable QR cards for every dining table simultaneously.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => (
                  <div
                    key={num}
                    className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-850 flex flex-col items-center text-center space-y-2"
                  >
                    <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-500 flex items-center justify-center font-bold text-xs">
                      #{num}
                    </div>
                    <div className="text-xs font-semibold text-neutral-900 dark:text-white">Table {num}</div>
                    <div className="text-[10px] text-neutral-400 font-mono truncate w-full">
                      ?table={num}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setTableNumber(`Table ${num}`);
                        setDataType('restaurant_table');
                        setFrameText(`TABLE #${num} • SCAN TO ORDER`);
                        setActiveTabSection('design');
                      }}
                      className="w-full py-1 text-[11px] font-medium text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
                    >
                      Load Into Studio
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Live Vector Preview & Export Station (5 cols) */}
        <div className="lg:col-span-5 space-y-4 sticky top-20">
          <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-lg flex flex-col items-center text-center">
            <div className="flex items-center justify-between w-full pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                Live Vector Preview
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                Level Q (25% ECC)
              </span>
            </div>

            {/* Rendered SVG Preview */}
            <div className="my-6 w-full max-w-[280px] aspect-square flex items-center justify-center p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700/80 shadow-inner">
              {isLoading ? (
                <div className="flex flex-col items-center gap-2 text-neutral-400">
                  <RefreshCw className="w-6 h-6 animate-spin text-amber-500" />
                  <span className="text-xs">Compiling vector matrix...</span>
                </div>
              ) : previewSvg ? (
                <div
                  className="w-full h-full flex items-center justify-center [&>svg]:w-full [&>svg]:h-auto [&>svg]:drop-shadow-xs"
                  dangerouslySetInnerHTML={{ __html: previewSvg }}
                />
              ) : (
                <QrCode className="w-16 h-16 text-neutral-300 dark:text-neutral-700" />
              )}
            </div>

            {/* Target Encoded Info */}
            <div className="w-full p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-100 dark:border-neutral-800 text-left space-y-1">
              <div className="flex items-center justify-between text-[11px] text-neutral-500 dark:text-neutral-400">
                <span>Active Target:</span>
                <span className="font-semibold capitalize text-neutral-800 dark:text-neutral-200">
                  {dataType.replace('_', ' ')}
                </span>
              </div>
              <div className="text-xs font-mono text-neutral-800 dark:text-neutral-200 truncate">
                {getEncodedPayload()}
              </div>
            </div>

            {/* Export Format Selector */}
            <div className="w-full mt-4 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFormat('svg')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  format === 'svg'
                    ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 shadow-sm'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                }`}
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>Vector SVG</span>
              </button>
              <button
                type="button"
                onClick={() => setFormat('png')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  format === 'png'
                    ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 shadow-sm'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Raster PNG</span>
              </button>
            </div>

            {/* Primary Action Buttons */}
            <div className="w-full mt-3 space-y-2">
              <button
                type="button"
                onClick={handleDownload}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-neutral-950 bg-amber-400 hover:bg-amber-300 transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download {format.toUpperCase()} (Print-Ready)</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleCopySvg}
                  className="py-2 px-3 rounded-xl text-xs font-medium border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'Copied XML' : 'Copy SVG'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleCopyUrl}
                  className="py-2 px-3 rounded-xl text-xs font-medium border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy Link'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
