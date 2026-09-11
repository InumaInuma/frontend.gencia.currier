import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Registrar Service Worker para PWA (Google Chrome, Samsung Internet, Edge, etc.)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        console.log('✅ Service Worker FRAGATA COURIER activo:', reg.scope);
      })
      .catch((err) => {
        console.warn('SW registration failed:', err);
      });
  });
}

