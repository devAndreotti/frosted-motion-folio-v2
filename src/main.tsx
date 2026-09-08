import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { initWebVitals } from './lib/vitals'
import './index.css'
import './bones/registry'

createRoot(document.getElementById("root")!).render(<App />);
initWebVitals();
