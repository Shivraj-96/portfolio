/**
 * SEO.jsx
 * Reusable meta tag component using react-helmet-async.
 *
 * Install first:
 *   npm install react-helmet-async
 *
 * Usage:
 *   <SEO
 *     title="Projects | Shivraj Shinde"
 *     description="Full stack developer portfolio..."
 *     url="https://shivrajshinde.dev/projects"
 *     image="https://shivrajshinde.dev/og-image.png"
 *   />
 */

import { Helmet } from 'react-helmet-async';

const SITE_NAME    = 'Shivraj Shinde';
const SITE_URL     = 'https://shivrajshinde.dev'; // ← change to your real domain
const DEFAULT_IMG  = `${SITE_URL}/og-image.png`;  // 1200×630 image in /public
const TWITTER_HANDLE = '@shivrajshinde';           // ← your Twitter handle

export default function SEO({
  title       = `${SITE_NAME} | Full Stack Developer`,
  description = 'Passionate Full Stack Developer building modern web apps with React, Node.js, and MongoDB.',
  url         = SITE_URL,
  image       = DEFAULT_IMG,
  type        = 'website',      // 'website' | 'article'
  noIndex     = false,          // true on admin pages
}) {
  const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;

  return (
    <Helmet>
      {/* ── Primary meta ── */}
      <title>{fullTitle}</title>
      <meta name="description"        content={description} />
      <meta name="author"             content={SITE_NAME} />
      <link rel="canonical"           href={url} />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}

      {/* ── Open Graph (Facebook, LinkedIn, WhatsApp) ── */}
      <meta property="og:type"        content={type} />
      <meta property="og:title"       content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url"         content={url} />
      <meta property="og:image"       content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height"content="630" />
      <meta property="og:site_name"   content={SITE_NAME} />
      <meta property="og:locale"      content="en_US" />

      {/* ── Twitter Card ── */}
      <meta name="twitter:card"       content="summary_large_image" />
      <meta name="twitter:site"       content={TWITTER_HANDLE} />
      <meta name="twitter:creator"    content={TWITTER_HANDLE} />
      <meta name="twitter:title"      content={fullTitle} />
      <meta name="twitter:description"content={description} />
      <meta name="twitter:image"      content={image} />

      {/* ── Extra SEO signals ── */}
      <meta name="theme-color"        content="#6366f1" />
      <meta name="viewport"           content="width=device-width, initial-scale=1.0" />
    </Helmet>
  );
}

// ── Pre-built SEO configs for each section ────────────────────────
export const SEO_PAGES = {
  home: {
    title:       `${SITE_NAME} | Full Stack Developer`,
    description: 'Full Stack Developer skilled in React, Node.js, MongoDB. Building fast, beautiful, production-ready web applications.',
    url:         `${SITE_URL}/`,
  },
  skills: {
    title:       `Skills | ${SITE_NAME}`,
    description: 'Technical skills including React, Node.js, Express, MongoDB, JavaScript, CSS and more.',
    url:         `${SITE_URL}/#skills`,
  },
  projects: {
    title:       `Projects | ${SITE_NAME}`,
    description: 'Portfolio of full-stack web development projects built with React, Node.js, and MongoDB.',
    url:         `${SITE_URL}/#projects`,
  },
  contact: {
    title:       `Contact | ${SITE_NAME}`,
    description: 'Get in touch with Shivraj Shinde for freelance projects, collaborations or job opportunities.',
    url:         `${SITE_URL}/#contact`,
  },
  admin: {
    title:       'Admin | Dashboard',
    description: 'Portfolio admin dashboard.',
    url:         `${SITE_URL}/admin`,
    noIndex:     true,  // hide admin from search engines
  },
};