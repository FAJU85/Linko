import React, { useState, useEffect, useCallback } from 'react';
import {
  Download,
  Copy,
  Check,
  RefreshCw,
  QrCode,
  ExternalLink,
  Sliders,
  Sparkles,
  FileCode,
  Image as ImageIcon,
  Palette,
  LayoutTemplate,
  Smile,
  Shield,
  Layers,
} from 'lucide-react';
import {
  QrEyeShape,
  QrBodyShape,
  QrFrameStyle,
  QrLogoType,
} from '../../server/qrEngine.ts';

export type QrFormat = 'png' | 'svg';
export type QrErrorCorrection = 'L' | 'M' | 'Q' | 'H';

export interface QrCodeCardProps {
  url: string;
  title?: string;
  subtitle?: string;
  handle?: string;
  creatorName?: string;
  avatarUrl?: string;
  compact?: boolean;
  className?: string;
}

const PRESET_GRADIENTS = [
  { name: 'Obsidian', start: '#090a0f', end: '#334155' },
  { name: 'Sunset', start: '#e11d48', end: '#f97316' },
  { name: 'Cyberpunk', start: '#7c3aed', end: '#ec4899' },
  { name: 'Ocean', start: '#0284c7', end: '#06b6d4' },
  { name: 'Emerald', start: '#059669', end: '#10b981' },
  { name: 'Amber', start: '#d97706', end: '#f59e0b' },
];

export const QrCodeCard: React.FC<QrCodeCardProps> = ({
  url,
  title = 'Page QR Code',
  subtitle = 'Scan with any smartphone camera to visit profile',
  handle = 'profile',
  creatorName = 'OmniLink Creator',
  avatarUrl = '',
  compact = false,
  className = '',
}) => {
  const [format, setFormat] = useState<QrFormat>('svg');
  const [darkColor, setDarkColor] = useState('#0f172a');
  const [lightColor, setLightColor] = useState('#ffffff');
  const [margin, setMargin] = useState<number>(2);
  const [errorCorrection, setErrorCorrection] = useState<QrErrorCorrection>('Q');

  // QR-Monkey features
  const [eyeShape, setEyeShape] = useState<QrEyeShape>('rounded');
  const [bodyShape, setBodyShape] = useState<QrBodyShape>('rounded');
  const [eyeColor, setEyeColor] = useState('');
  const [isGradient, setIsGradient] = useState(false);
  const [gradientColor, setGradientColor] = useState('#3b82f6');

  // QRCodeChimp features
  const [frameStyle, setFrameStyle] = useState<QrFrameStyle>('scan-me-bottom');
  const [frameText, setFrameText] = useState('SCAN ME');
  const [frameColor, setFrameColor] = useState('#0f172a');
  const [logoType, setLogoType] = useState<QrLogoType>('sparkles');

  // Active studio tool tab
  const [activeTab, setActiveTab] = useState<'style' | 'frame' | 'logo' | 'colors'>('frame');

  const [qrData, setQrData] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedApi, setCopiedApi] = useState(false);
  const [copiedImage, setCopiedImage] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(!compact);

  // Fetch QR Code from Backend Engine
  const fetchQrCode = useCallback(async () => {
    if (!url) return;
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/qr/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url,
          format,
          darkColor,
          lightColor,
          margin,
          errorCorrectionLevel: logoType !== 'none' ? 'Q' : errorCorrection,
          width: format === 'png' ? 768 : 512,
          eyeShape,
          bodyShape,
          eyeColor: eyeColor || darkColor,
          isGradient,
          gradientColor,
          frameStyle,
          frameText,
          frameColor: frameColor || darkColor,
          logoType,
          logoUrl: avatarUrl,
          creatorName,
          creatorHandle: handle,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();
      if (data.success && data.data) {
        setQrData(data.data);
      } else {
        throw new Error(data.error || 'Failed to generate QR code');
      }
    } catch (err: any) {
      console.warn('Backend QR generation fallback:', err);
      const directUrl = `/api/qr?url=${encodeURIComponent(url)}&format=${format}&dark=${encodeURIComponent(darkColor)}&light=${encodeURIComponent(lightColor)}&margin=${margin}&frame=${frameStyle}&frameText=${encodeURIComponent(frameText)}`;
      setQrData(directUrl);
    } finally {
      setIsLoading(false);
    }
  }, [
    url,
    format,
    darkColor,
    lightColor,
    margin,
    errorCorrection,
    eyeShape,
    bodyShape,
    eyeColor,
    isGradient,
    gradientColor,
    frameStyle,
    frameText,
    frameColor,
    logoType,
    avatarUrl,
    creatorName,
    handle,
  ]);

  useEffect(() => {
    fetchQrCode();
  }, [fetchQrCode]);

  // Download QR Code to disk
  const handleDownload = () => {
    const filename = `omnilink-${handle}-qr.${format}`;

    if (format === 'svg') {
      let svgBlob: Blob;
      if (qrData.startsWith('<svg')) {
        svgBlob = new Blob([qrData], { type: 'image/svg+xml;charset=utf-8' });
      } else {
        const downloadUrl = `/api/qr?url=${encodeURIComponent(url)}&format=svg&dark=${encodeURIComponent(darkColor)}&light=${encodeURIComponent(lightColor)}&margin=${margin}&download=1`;
        window.location.href = downloadUrl;
        return;
      }
      const blobUrl = URL.createObjectURL(svgBlob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } else {
      if (qrData.startsWith('data:image/png')) {
        const link = document.createElement('a');
        link.href = qrData;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        const downloadUrl = `/api/qr?url=${encodeURIComponent(url)}&format=png&dark=${encodeURIComponent(darkColor)}&light=${encodeURIComponent(lightColor)}&margin=${margin}&download=1`;
        window.location.href = downloadUrl;
      }
    }
  };

  // Copy QR Image markup or PNG
  const handleCopyQr = async () => {
    try {
      if (format === 'svg' && qrData.startsWith('<svg')) {
        await navigator.clipboard.writeText(qrData);
        setCopiedImage(true);
        setTimeout(() => setCopiedImage(false), 2000);
      } else if (format === 'png' && qrData.startsWith('data:image/png')) {
        const res = await fetch(qrData);
        const blob = await res.blob();
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        setCopiedImage(true);
        setTimeout(() => setCopiedImage(false), 2000);
      } else {
        await navigator.clipboard.writeText(url);
        setCopiedImage(true);
        setTimeout(() => setCopiedImage(false), 2000);
      }
    } catch (err) {
      await navigator.clipboard.writeText(url);
      setCopiedImage(true);
      setTimeout(() => setCopiedImage(false), 2000);
    }
  };

  // Copy Direct API Embed URL
  const handleCopyApiUrl = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const apiUrl = `${origin}/api/qr?url=${encodeURIComponent(url)}&format=${format}&dark=${encodeURIComponent(darkColor)}&light=${encodeURIComponent(lightColor)}&frame=${frameStyle}&frameText=${encodeURIComponent(frameText)}`;
    navigator.clipboard.writeText(apiUrl);
    setCopiedApi(true);
    setTimeout(() => setCopiedApi(false), 2000);
  };

  return (
    <div
      className={`rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm overflow-hidden ${className}`}
    >
      {/* Header bar */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300">
              QRCodeChimp + QR-Monkey
            </span>
          </div>
          <h3 className="text-sm font-bold text-neutral-900 dark:text-white mt-1">
            {title}
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            {subtitle}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
            showAdvanced
              ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
              : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Customize</span>
        </button>
      </div>

      <div className="p-5 flex flex-col lg:flex-row items-center lg:items-start gap-6">
        {/* Left Column: QR Code Visual Preview */}
        <div className="flex flex-col items-center gap-3 shrink-0">
          <div className="relative p-3 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 shadow-inner flex items-center justify-center min-w-[240px] min-h-[240px] max-w-[280px]">
            {isLoading && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 dark:bg-neutral-950/80 backdrop-blur-xs rounded-2xl">
                <RefreshCw className="w-6 h-6 animate-spin text-neutral-900 dark:text-white" />
              </div>
            )}

            {format === 'svg' && qrData.startsWith('<svg') ? (
              <div
                className="w-full h-full flex items-center justify-center [&>svg]:w-full [&>svg]:h-auto [&>svg]:max-h-[260px]"
                dangerouslySetInnerHTML={{ __html: qrData }}
              />
            ) : qrData ? (
              <img
                src={qrData}
                alt={`QR code for ${url}`}
                className="w-full h-auto max-h-[260px] object-contain rounded-lg"
              />
            ) : null}
          </div>

          {/* Action buttons under QR */}
          <div className="flex items-center gap-2 w-full justify-center">
            <button
              type="button"
              onClick={handleDownload}
              className="flex-1 py-2 px-3 rounded-xl font-bold text-xs text-white bg-neutral-900 dark:bg-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download {format.toUpperCase()}</span>
            </button>

            <button
              type="button"
              onClick={handleCopyQr}
              className="p-2 rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              title="Copy QR to clipboard"
            >
              {copiedImage ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Right Column: Customization Tabs (Frames, Eyes, Body, Colors, Logos) */}
        {showAdvanced && (
          <div className="flex-1 w-full space-y-4 text-left">
            {/* Tab navigation */}
            <div className="flex border-b border-neutral-200 dark:border-neutral-800 gap-1 pb-1">
              <button
                type="button"
                onClick={() => setActiveTab('frame')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  activeTab === 'frame'
                    ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white'
                    : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                <LayoutTemplate className="w-3.5 h-3.5" />
                <span>Frames (Chimp)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('style')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  activeTab === 'style'
                    ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white'
                    : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Eyes & Body (Monkey)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('colors')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  activeTab === 'colors'
                    ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white'
                    : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                <Palette className="w-3.5 h-3.5" />
                <span>Gradients</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('logo')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  activeTab === 'logo'
                    ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white'
                    : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                <Smile className="w-3.5 h-3.5" />
                <span>Center Badge</span>
              </button>
            </div>

            {/* Sub-Panel: Frame Customization (QRCodeChimp) */}
            {activeTab === 'frame' && (
              <div className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                    Frame Style
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {[
                      { id: 'none', label: 'None' },
                      { id: 'scan-me-bottom', label: 'Bottom CTA' },
                      { id: 'scan-me-top', label: 'Top Badge' },
                      { id: 'polaroid', label: 'Polaroid' },
                      { id: 'badge', label: 'Verified' },
                    ].map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setFrameStyle(f.id as QrFrameStyle)}
                        className={`py-2 px-2 text-xs font-semibold rounded-xl border text-center transition-colors cursor-pointer ${
                          frameStyle === f.id
                            ? 'border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-900'
                            : 'border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:border-neutral-400'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                {frameStyle !== 'none' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                        Call-To-Action Text
                      </label>
                      <input
                        type="text"
                        value={frameText}
                        onChange={(e) => setFrameText(e.target.value)}
                        placeholder="SCAN ME"
                        maxLength={24}
                        className="w-full px-3 py-1.5 text-xs font-bold rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white uppercase"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                        Frame Color
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={frameColor}
                          onChange={(e) => setFrameColor(e.target.value)}
                          className="w-8 h-8 rounded border border-neutral-300 dark:border-neutral-700 cursor-pointer p-0.5"
                        />
                        <span className="text-xs font-mono text-neutral-500">{frameColor}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Sub-Panel: Eyes & Body (QR-Monkey) */}
            {activeTab === 'style' && (
              <div className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                    Corner Eye Shape
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'square', label: 'Square (Classic)' },
                      { id: 'rounded', label: 'Rounded (Smooth)' },
                      { id: 'circle', label: 'Circle (Target)' },
                    ].map((eye) => (
                      <button
                        key={eye.id}
                        type="button"
                        onClick={() => setEyeShape(eye.id as QrEyeShape)}
                        className={`py-2 px-3 text-xs font-semibold rounded-xl border text-center transition-colors cursor-pointer ${
                          eyeShape === eye.id
                            ? 'border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-900'
                            : 'border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:border-neutral-400'
                        }`}
                      >
                        {eye.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                    Body Module Shape
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'square', label: 'Square Modules' },
                      { id: 'rounded', label: 'Rounded Pixels' },
                      { id: 'dots', label: 'Circular Dots' },
                    ].map((b) => (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => setBodyShape(b.id as QrBodyShape)}
                        className={`py-2 px-3 text-xs font-semibold rounded-xl border text-center transition-colors cursor-pointer ${
                          bodyShape === b.id
                            ? 'border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-900'
                            : 'border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:border-neutral-400'
                        }`}
                      >
                        {b.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Sub-Panel: Gradients & Colors */}
            {activeTab === 'colors' && (
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    Linear Gradient Fill
                  </label>
                  <input
                    type="checkbox"
                    checked={isGradient}
                    onChange={(e) => setIsGradient(e.target.checked)}
                    className="w-4 h-4 rounded text-neutral-900 cursor-pointer"
                  />
                </div>

                {isGradient ? (
                  <div>
                    <label className="block text-xs text-neutral-500 mb-1.5">
                      Gradient Color Presets
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {PRESET_GRADIENTS.map((g) => (
                        <button
                          key={g.name}
                          type="button"
                          onClick={() => {
                            setDarkColor(g.start);
                            setGradientColor(g.end);
                          }}
                          className="flex items-center gap-2 p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:border-neutral-400 text-left cursor-pointer"
                        >
                          <div
                            className="w-4 h-4 rounded-full shrink-0"
                            style={{
                              background: `linear-gradient(135deg, ${g.start}, ${g.end})`,
                            }}
                          />
                          <span className="text-xs font-medium text-neutral-800 dark:text-neutral-200">
                            {g.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-neutral-500 mb-1">
                        QR Color
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={darkColor}
                          onChange={(e) => setDarkColor(e.target.value)}
                          className="w-8 h-8 rounded border border-neutral-300 dark:border-neutral-700 cursor-pointer p-0.5"
                        />
                        <span className="text-xs font-mono">{darkColor}</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-neutral-500 mb-1">
                        Background
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={lightColor}
                          onChange={(e) => setLightColor(e.target.value)}
                          className="w-8 h-8 rounded border border-neutral-300 dark:border-neutral-700 cursor-pointer p-0.5"
                        />
                        <span className="text-xs font-mono">{lightColor}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Sub-Panel: Center Logo Badge */}
            {activeTab === 'logo' && (
              <div className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                    Center Logo / Avatar Icon
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { id: 'none', label: 'None' },
                      { id: 'sparkles', label: 'Sparkles' },
                      { id: 'star', label: 'Star' },
                      { id: 'heart', label: 'Heart' },
                      { id: 'shop', label: 'Shop' },
                      { id: 'coffee', label: 'Coffee' },
                      { id: 'link', label: 'Link' },
                      ...(avatarUrl ? [{ id: 'avatar', label: 'My Avatar' }] : []),
                    ].map((icon) => (
                      <button
                        key={icon.id}
                        type="button"
                        onClick={() => setLogoType(icon.id as QrLogoType)}
                        className={`py-2 px-2 text-xs font-semibold rounded-xl border text-center transition-colors cursor-pointer ${
                          logoType === icon.id
                            ? 'border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-900'
                            : 'border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:border-neutral-400'
                        }`}
                      >
                        {icon.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-neutral-100/70 dark:bg-neutral-800/40 text-[11px] text-neutral-500 flex items-center gap-2">
                  <Shield className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>
                    When a center logo is active, high error-correction (Level Q) is applied automatically to maintain 100% scan fidelity.
                  </span>
                </div>
              </div>
            )}

            {/* Format toggle & API Embed Link */}
            <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="text-neutral-400 font-medium">Format:</span>
                <button
                  type="button"
                  onClick={() => setFormat('svg')}
                  className={`px-2 py-0.5 rounded text-xs font-bold transition-colors cursor-pointer ${
                    format === 'svg'
                      ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                      : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                  }`}
                >
                  SVG (Vector)
                </button>
                <button
                  type="button"
                  onClick={() => setFormat('png')}
                  className={`px-2 py-0.5 rounded text-xs font-bold transition-colors cursor-pointer ${
                    format === 'png'
                      ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                      : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                  }`}
                >
                  PNG (Raster)
                </button>
              </div>

              <button
                type="button"
                onClick={handleCopyApiUrl}
                className="text-[11px] font-medium text-pink-600 dark:text-pink-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                {copiedApi ? <Check className="w-3 h-3 text-emerald-500" /> : <ExternalLink className="w-3 h-3" />}
                <span>{copiedApi ? 'API Link Copied!' : 'Copy API Embed URL'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
