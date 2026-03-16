/**
 * Analytics.jsx
 * Google Analytics 4 integration for React.
 * Place at: src/components/Analytics.jsx
 *
 * Setup:
 * 1. Go to https://analytics.google.com
 * 2. Create account → property → Web stream
 * 3. Copy your Measurement ID (looks like G-XXXXXXXXXX)
 * 4. Add to client/Protfolio/.env:
 *    VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
 */

import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';

const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

// ── Page view tracker ─────────────────────────────────────────────
export function usePageTracking(pageName, pageUrl) {
  useEffect(() => {
    if (!GA_ID || !window.gtag) return;
    window.gtag('event', 'page_view', {
      page_title:    pageName,
      page_location: pageUrl || window.location.href,
      page_path:     window.location.pathname,
    });
  }, [pageName, pageUrl]);
}

// ── Event tracker — call this anywhere ───────────────────────────
export function trackEvent(eventName, params = {}) {
  if (!GA_ID || !window.gtag) return;
  window.gtag('event', eventName, params);
}

// ── Pre-built events for your portfolio ───────────────────────────
export const Analytics = {
  // Called when someone clicks GitHub link on a project
  projectGitHub:  (projectTitle) => trackEvent('project_github_click',  { project: projectTitle }),
  // Called when someone clicks Live Demo on a project
  projectLive:    (projectTitle) => trackEvent('project_live_click',    { project: projectTitle }),
  // Called when contact form is submitted
  contactSubmit:  ()             => trackEvent('contact_form_submit',   { category: 'engagement' }),
  // Called when someone clicks Download CV
  downloadCV:     ()             => trackEvent('cv_download',           { category: 'engagement' }),
  // Called when dark/light mode is toggled
  themeToggle:    (theme)        => trackEvent('theme_toggle',          { theme }),
  // Called when admin logs in
  adminLogin:     ()             => trackEvent('admin_login',           { category: 'admin' }),
};

// ── Google Analytics script injector ─────────────────────────────
export default function GoogleAnalytics() {
  if (!GA_ID) return null; // Skip if no GA ID configured

  return (
    <Helmet>
      {/* Load GA4 script */}
      <script async src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} />
      {/* Initialize GA4 */}
      <script>{`
        window.dataLayer = window.dataLayer || [];
        function gtag(){ dataLayer.push(arguments); }
        gtag('js', new Date());
        gtag('config', '${GA_ID}', {
          page_title: document.title,
          send_page_view: true,
          anonymize_ip: true
        });
      `}</script>
    </Helmet>
  );
}