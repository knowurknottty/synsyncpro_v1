/**
 * FIX #13: Complete Meta SEO — Open Graph, Twitter Cards, JSON-LD
 * 
 * PROBLEM: Zero Open Graph tags, no Twitter Card meta, no structured data.
 * When someone shares synsyncpro.netlify.app on social media, Discord,
 * Slack, iMessage, etc. — there's no preview image, no description,
 * no rich card. Just a bare URL. This is free traffic left on the table.
 * 
 * Every share without a rich preview card = a lost click opportunity.
 * Rich previews increase click-through rate by 2-5x on social platforms.
 * 
 * SOLUTION: Complete meta tag suite + JSON-LD structured data.
 * Drop this into the <head> of index.html.
 */

// ============================================================
// META TAGS FOR index.html <head>
// ============================================================

export const META_TAGS = `
<!-- ============================================ -->
<!-- PRIMARY META TAGS                            -->
<!-- ============================================ -->
<title>SynSync Pro — Open Source Brainwave Entrainment Platform</title>
<meta name="title" content="SynSync Pro — Open Source Brainwave Entrainment Platform">
<meta name="description" content="114 neuroscience-backed brainwave entrainment protocols. Zero tracking. Zero data collection. Your brain, your device, your data. The Linux of brain technology.">
<meta name="keywords" content="brainwave entrainment, binaural beats, isochronic tones, neurofeedback, meditation, focus, sleep, open source, privacy, brain technology">
<meta name="author" content="SynSync">
<meta name="robots" content="index, follow">
<meta name="theme-color" content="#030508">

<!-- ============================================ -->
<!-- OPEN GRAPH (Facebook, LinkedIn, Discord,     -->
<!-- iMessage, Slack, WhatsApp, etc.)             -->
<!-- ============================================ -->
<meta property="og:type" content="website">
<meta property="og:url" content="https://synsyncpro.netlify.app/">
<meta property="og:title" content="SynSync Pro — Open Source Brainwave Entrainment">
<meta property="og:description" content="114 neuroscience-backed protocols for sleep, focus, anxiety relief, and consciousness exploration. Zero tracking. 100% private. Free.">
<meta property="og:image" content="https://synsyncpro.netlify.app/og-image.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="SynSync Pro — The Linux of Brain Technology. 114 protocols. Zero tracking. Open source.">
<meta property="og:site_name" content="SynSync Pro">
<meta property="og:locale" content="en_US">

<!-- ============================================ -->
<!-- TWITTER CARD                                 -->
<!-- ============================================ -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:url" content="https://synsyncpro.netlify.app/">
<meta name="twitter:title" content="SynSync Pro — Open Source Brainwave Entrainment">
<meta name="twitter:description" content="114 neuroscience-backed protocols. Zero tracking. Your brain data never leaves your device.">
<meta name="twitter:image" content="https://synsyncpro.netlify.app/og-image.png">
<meta name="twitter:image:alt" content="SynSync Pro brainwave entrainment platform interface">

<!-- ============================================ -->
<!-- PWA / MOBILE                                 -->
<!-- ============================================ -->
<meta name="application-name" content="SynSync Pro">
<meta name="apple-mobile-web-app-title" content="SynSync Pro">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="mobile-web-app-capable" content="yes">
<meta name="msapplication-TileColor" content="#030508">
<link rel="canonical" href="https://synsyncpro.netlify.app/">
`;

// ============================================================
// JSON-LD STRUCTURED DATA
// ============================================================

export const JSON_LD = `
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "SynSync Pro",
  "applicationCategory": "HealthApplication",
  "applicationSubCategory": "Brainwave Entrainment",
  "operatingSystem": "Web Browser (Chrome, Firefox, Safari, Edge)",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "description": "Open-source brainwave entrainment platform with 114 neuroscience-backed protocols. Privacy-first design with zero data collection.",
  "url": "https://synsyncpro.netlify.app/",
  "featureList": [
    "114 neuroscience-backed entrainment protocols",
    "Multi-modal entrainment (binaural, isochronic, monaural)",
    "Zero data collection — all processing on-device",
    "Offline-capable Progressive Web App",
    "Real-time DSP visualization",
    "Harmonic stacking with octave layering",
    "Split-hemisphere targeting",
    "Evidence-level transparency for every protocol"
  ],
  "softwareVersion": "2.0",
  "releaseNotes": "Complete protocol library with Phase Builder v5 architecture",
  "screenshot": "https://synsyncpro.netlify.app/og-image.png",
  "creator": {
    "@type": "Organization",
    "name": "SynSync",
    "url": "https://synsynckb.netlify.app/"
  },
  "isAccessibleForFree": true,
  "browserRequirements": "Requires Web Audio API support",
  "permissions": "none"
}
</script>
`;

// ============================================================
// OG IMAGE SPECIFICATIONS
// ============================================================

/**
 * You need to create an og-image.png (1200x630px) and place it
 * in the /public/ directory. This is the image that appears in
 * social media preview cards.
 * 
 * Design specs for the OG image:
 * 
 * Dimensions: 1200 x 630 pixels (Facebook/LinkedIn optimal)
 * Background: #030508 (void black) with subtle grid pattern
 * 
 * Layout:
 * ┌─────────────────────────────────────────────┐
 * │                                             │
 * │    [SynSync Pro Logo]                       │
 * │                                             │
 * │    THE LINUX OF BRAIN TECHNOLOGY            │
 * │                                             │
 * │    114 Protocols · Zero Tracking · Free     │
 * │                                             │
 * │    ▓▓▓▓▓▓▓ [frequency visualization] ▓▓▓▓▓ │
 * │                                             │
 * │    synsyncpro.netlify.app                   │
 * └─────────────────────────────────────────────┘
 * 
 * Typography:
 * - "SynSync Pro": Teko 600, #00d4ff (cyan)
 * - Tagline: Rajdhani 500, #ffffff
 * - Stats: JetBrains Mono 400, #9b6dff (purple)
 * - URL: JetBrains Mono 400, #00d4ff at 50% opacity
 * 
 * Visual elements:
 * - Subtle waveform/frequency visualization across middle
 * - Scanline overlay at 5% opacity
 * - Thin #00d4ff border (1px)
 * 
 * IMPORTANT: Keep critical content within the "safe zone" — 
 * inner 1080x560 area. Some platforms crop edges.
 */

// ============================================================
// NOSCRIPT FALLBACK (Bonus from original issue list)
// ============================================================

export const NOSCRIPT_FALLBACK = `
<noscript>
  <div style="
    background: #030508; 
    color: #00d4ff; 
    min-height: 100vh; 
    display: flex; 
    flex-direction: column;
    align-items: center; 
    justify-content: center; 
    font-family: monospace;
    padding: 2rem;
    text-align: center;
  ">
    <h1 style="font-size: 2rem; margin-bottom: 1rem;">SynSync Pro</h1>
    <p style="color: #ccc; max-width: 500px; line-height: 1.6;">
      SynSync Pro requires JavaScript to generate real-time audio signals.
      Please enable JavaScript in your browser to use the platform.
    </p>
    <p style="margin-top: 2rem;">
      <a href="https://synsynckb.netlify.app/" 
         style="color: #9b6dff; text-decoration: underline;">
        View documentation →
      </a>
    </p>
  </div>
</noscript>
`;

// ============================================================
// VIEWPORT FIX (Accessibility - from original issue list)
// ============================================================

/**
 * CURRENT (violates WCAG 1.4.4):
 *   <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
 * 
 * FIXED:
 *   <meta name="viewport" content="width=device-width, initial-scale=1.0">
 * 
 * If you need to prevent accidental zoom during protocol playback,
 * use CSS on the player container instead:
 *   .protocol-player { touch-action: manipulation; }
 */

// ============================================================
// INTEGRATION CHECKLIST
// ============================================================
/**
 * □ Create og-image.png (1200x630) and place in /public/
 * □ Add META_TAGS to <head> in index.html
 * □ Add JSON_LD script to <head> in index.html
 * □ Add NOSCRIPT_FALLBACK inside <div id="root">
 * □ Fix viewport meta tag (remove user-scalable=no)
 * □ Test with:
 *   - https://developers.facebook.com/tools/debug/ (Facebook)
 *   - https://cards-dev.twitter.com/validator (Twitter/X)
 *   - https://www.linkedin.com/post-inspector/ (LinkedIn)
 *   - https://metatags.io/ (All platforms preview)
 * □ Verify OG image loads correctly (must be absolute URL)
 * □ Test JSON-LD at https://validator.schema.org/
 */
