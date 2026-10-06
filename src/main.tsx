import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { initWebVitals } from './lib/vitals'
import { decodeImage, dismissBootLoader } from './lib/bootLoader'
import '@fontsource-variable/geist'
import '@fontsource-variable/geist-mono'
import './index.css'
import './bones/registry'

createRoot(document.getElementById("root")!).render(<App />);
initWebVitals();
// The hero photo is the first thing the eye lands on -- reveal the page once
// it's decoded (capped by dismissBootLoader's maxMs), not with a blank card.
dismissBootLoader({ waitFor: decodeImage(`${import.meta.env.BASE_URL}profile.webp`) });
