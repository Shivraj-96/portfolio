/**
 * sitemap.js  —  Sitemap generator script
 * Run with:  node sitemap.js
 * Outputs:   client/Protfolio/public/sitemap.xml
 *
 * Also add to package.json scripts:
 *   "sitemap": "node sitemap.js"
 * Then run:  npm run sitemap
 */

const fs   = require('fs');
const path = require('path');

const SITE_URL  = 'https://shivrajshinde.dev'; // ← your real domain
const OUT_PATH  = path.join(__dirname, 'client', 'Protfolio', 'public', 'sitemap.xml');
const TODAY     = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

// ── Define all public URLs ────────────────────────────────────────
const URLS = [
  // Single-page portfolio sections (all anchor links, one real URL)
  {
    loc:        `${SITE_URL}/`,
    lastmod:    TODAY,
    changefreq: 'weekly',
    priority:   '1.0',
  },
  {
    loc:        `${SITE_URL}/#skills`,
    lastmod:    TODAY,
    changefreq: 'monthly',
    priority:   '0.8',
  },
  {
    loc:        `${SITE_URL}/#projects`,
    lastmod:    TODAY,
    changefreq: 'weekly',
    priority:   '0.9',
  },
  {
    loc:        `${SITE_URL}/#contact`,
    lastmod:    TODAY,
    changefreq: 'yearly',
    priority:   '0.6',
  },
  // Admin is intentionally excluded from sitemap (noindex page)
];

// ── Build XML ────────────────────────────────────────────────────
function buildSitemap(urls) {
  const entries = urls.map(({ loc, lastmod, changefreq, priority }) => `
  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${entries}
</urlset>`;
}

// ── Write file ───────────────────────────────────────────────────
const xml = buildSitemap(URLS);

// Make sure /public directory exists
const dir = path.dirname(OUT_PATH);
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

fs.writeFileSync(OUT_PATH, xml, 'utf8');
console.log(`✅ Sitemap generated → ${OUT_PATH}`);
console.log(`   ${URLS.length} URLs written.`);