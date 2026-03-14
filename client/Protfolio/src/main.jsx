import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async'; // ← SEO provider
import { AuthProvider } from './hooks/useAuth';
import App from './App.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* HelmetProvider must wrap everything for Helmet to work in all components */}
    <HelmetProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </HelmetProvider>
  </StrictMode>
);