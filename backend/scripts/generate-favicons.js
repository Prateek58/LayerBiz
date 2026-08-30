const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// 1. Transparent Icon SVG (centered in a 128x128 viewBox)
const iconSvgTransparent = `
<svg width="512" height="512" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
  <g transform="translate(16, 16)">
    <!-- Scaled LayerBiz Triple Block Icon -->
    <rect x="12" y="52" width="32" height="32" rx="4.5" fill="#f97316" />
    <rect x="32" y="32" width="32" height="32" rx="4.5" fill="#f97316" fill-opacity="0.8" />
    <rect x="52" y="12" width="32" height="32" rx="4.5" fill="#f97316" fill-opacity="0.6" />
  </g>
</svg>
`.trim();

// 2. Dark Slate Rounded Background Icon SVG (best for browser tabs & Apple touch icon)
const iconSvgDarkContainer = `
<svg width="512" height="512" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="128" height="128" rx="28" fill="#0f172a" />
  <rect x="0.5" y="0.5" width="127" height="127" rx="27.5" stroke="#334155" stroke-width="1" />
  <g transform="translate(16, 16)">
    <rect x="12" y="52" width="32" height="32" rx="4.5" fill="#f97316" />
    <rect x="32" y="32" width="32" height="32" rx="4.5" fill="#f97316" fill-opacity="0.8" />
    <rect x="52" y="12" width="32" height="32" rx="4.5" fill="#f97316" fill-opacity="0.6" />
  </g>
</svg>
`.trim();

async function generate() {
  const rootDir = path.resolve(__dirname, '../..');
  const frontendPublic = path.resolve(rootDir, 'frontend/public');
  const backendPublic = path.resolve(__dirname, '../public');

  if (!fs.existsSync(frontendPublic)) {
    fs.mkdirSync(frontendPublic, { recursive: true });
  }
  if (!fs.existsSync(backendPublic)) {
    fs.mkdirSync(backendPublic, { recursive: true });
  }

  // Save SVGs
  fs.writeFileSync(path.join(rootDir, 'favicon.svg'), iconSvgTransparent);
  fs.writeFileSync(path.join(frontendPublic, 'favicon.svg'), iconSvgTransparent);
  fs.writeFileSync(path.join(rootDir, 'favicon-dark.svg'), iconSvgDarkContainer);
  fs.writeFileSync(path.join(frontendPublic, 'favicon-dark.svg'), iconSvgDarkContainer);

  const targets = [
    // Standard favicons
    { buffer: Buffer.from(iconSvgDarkContainer), size: 16, filename: 'favicon-16x16.png' },
    { buffer: Buffer.from(iconSvgDarkContainer), size: 32, filename: 'favicon-32x32.png' },
    { buffer: Buffer.from(iconSvgDarkContainer), size: 48, filename: 'favicon-48x48.png' },
    { buffer: Buffer.from(iconSvgDarkContainer), size: 180, filename: 'apple-touch-icon.png' },
    { buffer: Buffer.from(iconSvgDarkContainer), size: 192, filename: 'android-chrome-192x192.png' },
    { buffer: Buffer.from(iconSvgDarkContainer), size: 512, filename: 'android-chrome-512x512.png' },
    { buffer: Buffer.from(iconSvgDarkContainer), size: 512, filename: 'favicon.png' },
    { buffer: Buffer.from(iconSvgTransparent), size: 512, filename: 'favicon-transparent.png' },
  ];

  for (const t of targets) {
    const pngBuf = await sharp(t.buffer).resize(t.size, t.size).png().toBuffer();
    
    // Save to root, frontend/public, and backend/public
    fs.writeFileSync(path.join(rootDir, t.filename), pngBuf);
    fs.writeFileSync(path.join(frontendPublic, t.filename), pngBuf);
    if (t.filename === 'favicon.png') {
      fs.writeFileSync(path.join(backendPublic, 'favicon.png'), pngBuf);
    }
  }

  // Copy root logos and images to frontend/public for static delivery
  const staticFiles = [
    'layerbiz-logo-light.svg',
    'layerbiz-logo-dark.svg',
    'xLogoLayerbiz.png',
    'xlogoHorizontal.png',
    'twitter-header.svg'
  ];

  for (const file of staticFiles) {
    const src = path.join(rootDir, file);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, path.join(frontendPublic, file));
    }
  }

  console.log('✅ Successfully generated all favicon assets across frontend/public, backend/public, and root!');
}

generate().catch(console.error);
