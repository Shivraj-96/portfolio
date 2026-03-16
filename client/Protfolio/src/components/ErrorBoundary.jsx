/**
 * ErrorBoundary.jsx
 * Catches React errors and shows a friendly fallback UI.
 * Sends errors to Google Analytics automatically.
 */

import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info);

    // Send to Google Analytics if available
    if (window.gtag) {
      window.gtag('event', 'exception', {
        description: error.message,
        fatal: false,
      });
    }
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        minHeight: '60vh', padding: '40px',
        fontFamily: 'Sora, sans-serif', textAlign: 'center',
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>⚠️</div>
        <h2 style={{ color: '#0f172a', marginBottom: '8px', fontSize: '1.4rem' }}>
          Something went wrong
        </h2>
        <p style={{ color: '#64748b', marginBottom: '24px', maxWidth: '400px' }}>
          An unexpected error occurred. Please refresh the page.
        </p>
        {import.meta.env.DEV && (
          <pre style={{
            background: '#fef2f2', color: '#dc2626',
            padding: '16px', borderRadius: '8px',
            fontSize: '0.75rem', textAlign: 'left',
            maxWidth: '600px', overflow: 'auto',
          }}>
            {this.state.error?.message}
          </pre>
        )}
        <button
          onClick={() => window.location.reload()}
          style={{
            marginTop: '20px', padding: '12px 28px',
            background: '#6366f1', color: '#fff',
            border: 'none', borderRadius: '10px',
            cursor: 'pointer', fontSize: '0.9rem',
            fontFamily: 'Sora, sans-serif', fontWeight: '600',
          }}>
          🔄 Refresh Page
        </button>
      </div>
    );
  }
}