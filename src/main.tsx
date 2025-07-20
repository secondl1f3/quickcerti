import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { addResourceHints } from './utils/performance';

// Initialize performance optimizations
addResourceHints();

// Preload critical resources
const preloadComponents = () => {
  import('./components/TemplateSelection');
  import('./components/CertificateHub');
};

if ('requestIdleCallback' in window) {
  requestIdleCallback(preloadComponents);
} else {
  // Fallback for browsers without requestIdleCallback
  setTimeout(preloadComponents, 1000);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
