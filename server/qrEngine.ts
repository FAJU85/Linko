import QRCode from 'qrcode';

export type QrErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';
export type QrEyeShape = 'square' | 'rounded' | 'circle';
export type QrBodyShape = 'square' | 'dots' | 'rounded';
export type QrFrameStyle = 'none' | 'scan-me-bottom' | 'scan-me-top' | 'polaroid' | 'badge';
export type QrLogoType = 'none' | 'avatar' | 'star' | 'sparkles' | 'link' | 'coffee' | 'heart' | 'shop' | 'utensils' | 'table';

export interface QrOptions {
  errorCorrectionLevel?: QrErrorCorrectionLevel;
  margin?: number;
  width?: number;
  darkColor?: string;
  lightColor?: string;
  // QR-Monkey features:
  eyeShape?: QrEyeShape;
  bodyShape?: QrBodyShape;
  eyeColor?: string;
  isGradient?: boolean;
  gradientColor?: string;
  gradientType?: 'linear-diag' | 'linear-vert' | 'radial';
  // QR-Code-Chimp features:
  frameStyle?: QrFrameStyle;
  frameText?: string;
  frameColor?: string;
  logoType?: QrLogoType;
  logoUrl?: string;
  creatorName?: string;
  creatorHandle?: string;
  tableNumber?: string;
}

const DEFAULT_OPTIONS: Required<QrOptions> = {
  errorCorrectionLevel: 'M',
  margin: 2,
  width: 512,
  darkColor: '#0f172a',
  lightColor: '#ffffff',
  eyeShape: 'square',
  bodyShape: 'square',
  eyeColor: '',
  isGradient: false,
  gradientColor: '#3b82f6',
  gradientType: 'linear-diag',
  frameStyle: 'none',
  frameText: 'SCAN ME',
  frameColor: '#0f172a',
  logoType: 'none',
  logoUrl: '',
  creatorName: 'OmniLink Creator',
  creatorHandle: 'profile',
  tableNumber: '',
};

/**
 * Validates and normalizes hex color code or returns fallback
 */
function sanitizeColor(color?: string, fallback: string = '#000000'): string {
  if (!color) return fallback;
  const trimmed = color.trim();
  if (/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/.test(trimmed)) {
    return trimmed;
  }
  return fallback;
}

/**
 * Escapes XML strings for safe SVG rendering
 */
function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

/**
 * SVG icon paths for center logos (24x24 viewBox)
 */
const CENTER_ICONS: Record<string, string> = {
  star: '<path fill="currentColor" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>',
  sparkles: '<path fill="currentColor" d="M12 2L9.5 8.5 3 11l6.5 2.5L12 20l2.5-6.5L21 11l-6.5-2.5L12 2zm7 13l-1.25 2.75L15 19l2.75 1.25L19 23l1.25-2.75L23 19l-2.75-1.25L19 15z"/>',
  link: '<path fill="currentColor" d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zm5.1 1h6v-2H9v2zm7.9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/>',
  coffee: '<path fill="currentColor" d="M20 3H4v10c0 2.21 1.79 4 4 4h6c2.21 0 4-1.79 4-4v-3h2c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 5h-2V5h2v3zM4 19h16v2H4z"/>',
  heart: '<path fill="currentColor" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>',
  shop: '<path fill="currentColor" d="M16 6V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H2v13c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6h-6zm-6-2h4v2h-4V4zm10 15H4V8h16v11z"/>',
  utensils: '<path fill="currentColor" d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z"/>',
  table: '<path fill="currentColor" d="M4 6h16v2H4zm1 4h14v2H5zm1 4h12v6h-2v-4H8v4H6z"/>',
};

/**
 * Checks if a coordinate belongs to one of the three standard QR finder patterns (eyes)
 */
function isFinderPattern(r: number, c: number, size: number): boolean {
  // Top-left 7x7
  if (r < 7 && c < 7) return true;
  // Top-right 7x7
  if (r < 7 && c >= size - 7) return true;
  // Bottom-left 7x7
  if (r >= size - 7 && c < 7) return true;
  return false;
}

/**
 * Advanced Vector SVG Generator supporting QR-Monkey and QRCodeChimp features:
 * - Custom Eye Frame & Ball shapes (Square, Rounded, Circle)
 * - Module shapes (Square, Dots, Rounded)
 * - Linear Gradients
 * - Center quiet-zone with embedded Avatar / Icon logo
 * - Frame styles ("SCAN ME" banner, Polaroid, Badge, etc.)
 */
export async function generateQrSvg(text: string, options?: QrOptions): Promise<string> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const dark = sanitizeColor(opts.darkColor, DEFAULT_OPTIONS.darkColor);
  const light = sanitizeColor(opts.lightColor, DEFAULT_OPTIONS.lightColor);
  const eyeColor = sanitizeColor(opts.eyeColor || dark, dark);
  const gradEnd = sanitizeColor(opts.gradientColor, '#3b82f6');
  const frameColor = sanitizeColor(opts.frameColor, dark);

  // When a center logo is specified, enforce at least 'Q' error correction to preserve scanability
  let ec: QrErrorCorrectionLevel = opts.errorCorrectionLevel;
  const hasLogo = opts.logoType && opts.logoType !== 'none';
  if (hasLogo && (ec === 'L' || ec === 'M')) {
    ec = 'Q';
  }

  // Create QR bit matrix
  const qr = QRCode.create(text, { errorCorrectionLevel: ec });
  const size = qr.modules.size;
  const margin = Math.max(0, opts.margin);

  // Logo Quiet Zone calculation
  let logoModules = 0;
  let logoStart = -1;
  let logoEnd = -1;
  if (hasLogo) {
    logoModules = Math.floor(size * 0.24); // ~24% of size
    if (logoModules % 2 === 0) logoModules += 1; // keep odd for symmetric centering
    logoStart = Math.floor((size - logoModules) / 2);
    logoEnd = logoStart + logoModules;
  }

  // Generate body modules
  let bodyPaths = '';
  const bodyFill = opts.isGradient ? 'url(#qrGradient)' : dark;

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      // Skip finder patterns (rendered separately with custom eye styles)
      if (isFinderPattern(r, c, size)) continue;

      // Skip quiet zone for center logo
      if (hasLogo && r >= logoStart && r < logoEnd && c >= logoStart && c < logoEnd) {
        continue;
      }

      const isDark = qr.modules.get(r, c) === 1;
      if (!isDark) continue;

      const x = c + margin;
      const y = r + margin;

      if (opts.bodyShape === 'dots') {
        bodyPaths += `<circle cx="${(x + 0.5).toFixed(2)}" cy="${(y + 0.5).toFixed(2)}" r="0.42" fill="${bodyFill}"/>`;
      } else if (opts.bodyShape === 'rounded') {
        bodyPaths += `<rect x="${(x + 0.08).toFixed(2)}" y="${(y + 0.08).toFixed(2)}" width="0.84" height="0.84" rx="0.32" fill="${bodyFill}"/>`;
      } else {
        // Standard square module
        bodyPaths += `<rect x="${x}" y="${y}" width="1" height="1" fill="${bodyFill}"/>`;
      }
    }
  }

  // Generate custom eye components (QR Monkey feature)
  const eyeCoords = [
    { r: 0, c: 0 }, // Top-left
    { r: 0, c: size - 7 }, // Top-right
    { r: size - 7, c: 0 }, // Bottom-left
  ];

  let eyesMarkup = '';
  for (const { r, c } of eyeCoords) {
    const x = c + margin;
    const y = r + margin;

    if (opts.eyeShape === 'circle') {
      // Circular Eye Outer Ring & Inner Ball
      eyesMarkup += `
        <!-- Eye Ring -->
        <circle cx="${x + 3.5}" cy="${y + 3.5}" r="3" fill="none" stroke="${eyeColor}" stroke-width="1"/>
        <!-- Eye Ball -->
        <circle cx="${x + 3.5}" cy="${y + 3.5}" r="1.5" fill="${eyeColor}"/>
      `;
    } else if (opts.eyeShape === 'rounded') {
      // Rounded Eye Frame & Ball
      eyesMarkup += `
        <!-- Eye Outer Frame -->
        <rect x="${x}" y="${y}" width="7" height="7" rx="1.8" fill="${eyeColor}"/>
        <rect x="${x + 1}" y="${y + 1}" width="5" height="5" rx="1.2" fill="${light}"/>
        <!-- Eye Center Ball -->
        <rect x="${x + 2}" y="${y + 2}" width="3" height="3" rx="0.8" fill="${eyeColor}"/>
      `;
    } else {
      // Classic Square Eye
      eyesMarkup += `
        <!-- Eye Outer Frame -->
        <rect x="${x}" y="${y}" width="7" height="7" fill="${eyeColor}"/>
        <rect x="${x + 1}" y="${y + 1}" width="5" height="5" fill="${light}"/>
        <!-- Eye Center Ball -->
        <rect x="${x + 2}" y="${y + 2}" width="3" height="3" fill="${eyeColor}"/>
      `;
    }
  }

  // Center Logo / Avatar Badge
  let centerLogoMarkup = '';
  if (hasLogo && logoStart >= 0) {
    const cx = logoStart + margin + logoModules / 2;
    const cy = logoStart + margin + logoModules / 2;
    const logoRadius = (logoModules / 2) + 0.1;
    const iconBoxSize = logoModules * 0.7;

    centerLogoMarkup += `
      <!-- Center quiet badge -->
      <circle cx="${cx}" cy="${cy}" r="${logoRadius}" fill="${light}" stroke="${frameColor}" stroke-width="0.3" />
    `;

    if (opts.logoType === 'avatar' && opts.logoUrl) {
      // Embedded Avatar Image
      const imgX = cx - (iconBoxSize / 2);
      const imgY = cy - (iconBoxSize / 2);
      centerLogoMarkup += `
        <clipPath id="avatarClip">
          <circle cx="${cx}" cy="${cy}" r="${iconBoxSize / 2}" />
        </clipPath>
        <image href="${escapeXml(opts.logoUrl)}" x="${imgX}" y="${imgY}" width="${iconBoxSize}" height="${iconBoxSize}" preserveAspectRatio="xMidYMid slice" clip-path="url(#avatarClip)" />
      `;
    } else if (opts.logoType && CENTER_ICONS[opts.logoType]) {
      // Embedded Vector Icon
      const imgX = cx - (iconBoxSize / 2);
      const imgY = cy - (iconBoxSize / 2);
      centerLogoMarkup += `
        <g transform="translate(${imgX}, ${imgY}) scale(${iconBoxSize / 24})" color="${frameColor}">
          ${CENTER_ICONS[opts.logoType]}
        </g>
      `;
    }
  }

  // Frame calculation (QRCodeChimp style)
  const qrTotalSize = size + margin * 2;
  const frameText = escapeXml(opts.frameText || 'SCAN ME');
  const creatorName = escapeXml(opts.creatorName || 'OmniLink Creator');
  const creatorHandle = escapeXml(opts.creatorHandle || 'profile');

  // Linear Gradient Definition
  const gradientDef = opts.isGradient
    ? `
      <linearGradient id="qrGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${dark}" />
        <stop offset="100%" stop-color="${gradEnd}" />
      </linearGradient>
    `
    : '';

  // Base QR Symbol
  const qrSymbolMarkup = `
    <rect width="${qrTotalSize}" height="${qrTotalSize}" fill="${light}" />
    ${gradientDef}
    ${bodyPaths}
    ${eyesMarkup}
    ${centerLogoMarkup}
  `;

  // Apply Frame Wrappers
  if (opts.frameStyle === 'scan-me-bottom') {
    const bannerHeight = 8;
    const framePadding = 2;
    const totalW = qrTotalSize + framePadding * 2;
    const totalH = qrTotalSize + bannerHeight + framePadding * 2;

    return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalW} ${totalH}" width="${opts.width}" height="${Math.round((opts.width * totalH) / totalW)}" shape-rendering="geometricPrecision">
  <defs>
    <style>
      .cta-text { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-weight: 800; font-size: 3px; letter-spacing: 0.1em; }
    </style>
  </defs>
  <!-- Frame Background Card -->
  <rect width="${totalW}" height="${totalH}" rx="4" fill="${light}" stroke="${frameColor}" stroke-width="0.8" />
  
  <!-- Embedded QR Code -->
  <g transform="translate(${framePadding}, ${framePadding})">
    ${qrSymbolMarkup}
  </g>

  <!-- Bottom CTA Ribbon -->
  <g transform="translate(${framePadding}, ${qrTotalSize + framePadding})">
    <rect width="${qrTotalSize}" height="${bannerHeight - 0.5}" rx="2.5" fill="${frameColor}" />
    <!-- Scan Icon -->
    <path fill="${light}" d="M4 2v2H2V2h2zm1 0h1v1H5V2zm-3 3h1v1H2V5zm6-3h2v2H8V2zm-1 3h1v1H7V5zm3 0h1v1h-1V5zm-8 4v2h2V9H2zm1-2h1v1H3V7zm4 2h1v1H7V9zm3 0h2v2h-2V9zm-1-2h1v1H9V7z" transform="translate(4, 1.2) scale(0.45)" />
    <!-- Text -->
    <text class="cta-text" x="${qrTotalSize / 2}" y="4.8" fill="${light}" text-anchor="middle">${frameText}</text>
  </g>
</svg>`.trim();
  }

  if (opts.frameStyle === 'scan-me-top') {
    const bannerHeight = 8;
    const framePadding = 2;
    const totalW = qrTotalSize + framePadding * 2;
    const totalH = qrTotalSize + bannerHeight + framePadding * 2;

    return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalW} ${totalH}" width="${opts.width}" height="${Math.round((opts.width * totalH) / totalW)}" shape-rendering="geometricPrecision">
  <defs>
    <style>
      .cta-text { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-weight: 800; font-size: 3px; letter-spacing: 0.1em; }
    </style>
  </defs>
  <!-- Frame Card -->
  <rect width="${totalW}" height="${totalH}" rx="4" fill="${light}" stroke="${frameColor}" stroke-width="0.8" />
  
  <!-- Top Banner Ribbon -->
  <g transform="translate(${framePadding}, ${framePadding})">
    <rect width="${qrTotalSize}" height="${bannerHeight - 0.5}" rx="2.5" fill="${frameColor}" />
    <text class="cta-text" x="${qrTotalSize / 2}" y="4.8" fill="${light}" text-anchor="middle">${frameText}</text>
  </g>

  <!-- Embedded QR Code -->
  <g transform="translate(${framePadding}, ${framePadding + bannerHeight})">
    ${qrSymbolMarkup}
  </g>
</svg>`.trim();
  }

  if (opts.frameStyle === 'polaroid') {
    const bottomSpace = 14;
    const framePadding = 3;
    const totalW = qrTotalSize + framePadding * 2;
    const totalH = qrTotalSize + bottomSpace + framePadding * 2;

    return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalW} ${totalH}" width="${opts.width}" height="${Math.round((opts.width * totalH) / totalW)}" shape-rendering="geometricPrecision">
  <defs>
    <style>
      .pol-title { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-weight: 700; font-size: 3.2px; }
      .pol-sub { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-weight: 500; font-size: 2.2px; }
    </style>
    <filter id="cardShadow" x="-5%" y="-5%" width="110%" height="110%">
      <feDropShadow dx="0" dy="2" stdDeviation="1.5" flood-opacity="0.12" />
    </filter>
  </defs>
  <!-- Polaroid Paper -->
  <rect width="${totalW}" height="${totalH}" rx="2" fill="${light}" filter="url(#cardShadow)" />
  <rect width="${totalW}" height="${totalH}" rx="2" fill="none" stroke="#e2e8f0" stroke-width="0.5" />
  
  <!-- QR Code photo window -->
  <g transform="translate(${framePadding}, ${framePadding})">
    <rect width="${qrTotalSize}" height="${qrTotalSize}" fill="${light}" stroke="#f1f5f9" stroke-width="0.3" />
    ${qrSymbolMarkup}
  </g>

  <!-- Bottom Handwritten / Signature area -->
  <g transform="translate(${framePadding}, ${qrTotalSize + framePadding + 4})">
    <text class="pol-title" x="${qrTotalSize / 2}" y="3" fill="${dark}" text-anchor="middle">${creatorName}</text>
    <text class="pol-sub" x="${qrTotalSize / 2}" y="6.8" fill="#64748b" text-anchor="middle">@${creatorHandle} • omnilink.me</text>
  </g>
</svg>`.trim();
  }

  if (opts.frameStyle === 'badge') {
    const headerHeight = 7;
    const footerHeight = 6;
    const framePadding = 2.5;
    const totalW = qrTotalSize + framePadding * 2;
    const totalH = qrTotalSize + headerHeight + footerHeight + framePadding * 2;

    return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalW} ${totalH}" width="${opts.width}" height="${Math.round((opts.width * totalH) / totalW)}" shape-rendering="geometricPrecision">
  <defs>
    <style>
      .badge-hdr { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-weight: 800; font-size: 2.4px; letter-spacing: 0.15em; }
      .badge-ftr { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-weight: 600; font-size: 2.2px; }
    </style>
  </defs>
  <!-- Outer Badge Card with Border -->
  <rect width="${totalW}" height="${totalH}" rx="6" fill="${light}" stroke="${frameColor}" stroke-width="1" />
  
  <!-- Top Tag Ribbon -->
  <path d="M${totalW / 2 - 12} 0 H${totalW / 2 + 12} L${totalW / 2 + 10} 5 H${totalW / 2 - 10} Z" fill="${frameColor}" />
  <text class="badge-hdr" x="${totalW / 2}" y="3.6" fill="${light}" text-anchor="middle">VERIFIED</text>

  <!-- Embedded QR Code -->
  <g transform="translate(${framePadding}, ${headerHeight + framePadding})">
    ${qrSymbolMarkup}
  </g>

  <!-- Footer CTA -->
  <text class="badge-ftr" x="${totalW / 2}" y="${totalH - 3}" fill="${frameColor}" text-anchor="middle">${frameText}</text>
</svg>`.trim();
  }

  // Standard Frameless QR code
  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${qrTotalSize} ${qrTotalSize}" width="${opts.width}" height="${opts.width}" shape-rendering="geometricPrecision">
  ${qrSymbolMarkup}
</svg>`.trim();
}

/**
 * Generate a PNG Data URL (Base64) for client rendering or download
 */
export async function generateQrDataUrl(text: string, options?: QrOptions): Promise<string> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const dark = sanitizeColor(opts.darkColor, DEFAULT_OPTIONS.darkColor);
  const light = sanitizeColor(opts.lightColor, DEFAULT_OPTIONS.lightColor);

  return QRCode.toDataURL(text, {
    errorCorrectionLevel: opts.errorCorrectionLevel,
    margin: opts.margin,
    width: opts.width,
    color: {
      dark,
      light,
    },
  });
}

/**
 * Generate a raw PNG Buffer for binary HTTP responses
 */
export async function generateQrBuffer(text: string, options?: QrOptions): Promise<Buffer> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const dark = sanitizeColor(opts.darkColor, DEFAULT_OPTIONS.darkColor);
  const light = sanitizeColor(opts.lightColor, DEFAULT_OPTIONS.lightColor);

  return QRCode.toBuffer(text, {
    type: 'png',
    errorCorrectionLevel: opts.errorCorrectionLevel,
    margin: opts.margin,
    width: opts.width,
    color: {
      dark,
      light,
    },
  });
}
