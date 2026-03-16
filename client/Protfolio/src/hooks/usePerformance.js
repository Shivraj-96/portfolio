/**
 * usePerformance.js
 * Measures Core Web Vitals and sends them to GA4.
 * Place at: src/hooks/usePerformance.js
 *
 * Tracks:
 *  - LCP  (Largest Contentful Paint) — loading speed
 *  - FID  (First Input Delay)        — interactivity
 *  - CLS  (Cumulative Layout Shift)  — visual stability
 *  - FCP  (First Contentful Paint)   — perceived load speed
 *  - TTFB (Time To First Byte)       — server response
 */

import { useEffect } from 'react';

// Send metric to Google Analytics
function sendToGA(metric) {
  if (!window.gtag) return;
  window.gtag('event', metric.name, {
    event_category:    'Web Vitals',
    event_label:       metric.id,
    value:             Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
    non_interaction:   true,
  });
  // Also log to console in dev
  if (import.meta.env.DEV) {
    const rating = metric.rating || 'unknown';
    const color  = rating === 'good' ? '🟢' : rating === 'needs-improvement' ? '🟡' : '🔴';
    console.log(`${color} ${metric.name}: ${Math.round(metric.value)}ms [${rating}]`);
  }
}

export function usePerformance() {
  useEffect(() => {
    // Dynamically import web-vitals to avoid bundle bloat
    import('web-vitals').then(({ onCLS, onFID, onFCP, onLCP, onTTFB }) => {
      onCLS(sendToGA);
      onFID(sendToGA);
      onFCP(sendToGA);
      onLCP(sendToGA);
      onTTFB(sendToGA);
    }).catch(() => {
      // web-vitals not installed — silent fail
    });
  }, []);
}

// ── Simple in-app performance reporter (no GA needed) ────────────
export function useLoadTime() {
  useEffect(() => {
    if (!window.performance) return;

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'navigation') {
          const loadTime = Math.round(entry.loadEventEnd - entry.startTime);
          console.log(`⚡ Page load time: ${loadTime}ms`);
        }
      }
    });

    try {
      observer.observe({ type: 'navigation', buffered: true });
    } catch {
      // Not supported in all browsers
    }

    return () => observer.disconnect();
  }, []);
}