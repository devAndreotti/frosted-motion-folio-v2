import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { initWebVitals } from './lib/vitals'
import { decodeImage, dismissBootLoader } from './lib/bootLoader'
import { loadUmami } from './lib/track'
import '@fontsource-variable/geist'
import '@fontsource-variable/geist-mono'
import './index.css'
import './styles/v2.css'
import './styles/hero-cards.css'

createRoot(document.getElementById("root")!).render(<App />);
initWebVitals();
// Umami only where the build is configured for it (the Cloudflare deploy, see .github/workflows/cloudflare.yml).
loadUmami(import.meta.env.VITE_UMAMI_SRC, import.meta.env.VITE_UMAMI_ID);
// The hero photo is the first thing the eye lands on -- reveal the page once
// it's decoded (capped by dismissBootLoader's maxMs), not with a blank card.
dismissBootLoader({ waitFor: decodeImage(`${import.meta.env.BASE_URL}profile.webp`) });
