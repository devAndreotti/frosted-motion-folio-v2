import { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { DEBUG_EVENT, isDebugOn, pageLoadMs, setDebugOn } from '@/lib/debugOverlay';

const viewportSize = () => `${window.innerWidth} × ${window.innerHeight}`;

/** Small fixed panel shown while debug mode is on (triple-click the RA logo). Esc turns it off. Outlines are CSS, see styles/eggs.css. */
export const DebugOverlay = () => {
  const { lang, t } = useLanguage();
  const { theme } = useTheme();
  const [on, setOn] = useState(isDebugOn);
  const [viewport, setViewport] = useState(viewportSize);

  useEffect(() => {
    const sync = () => setOn(isDebugOn());
    window.addEventListener(DEBUG_EVENT, sync);
    return () => window.removeEventListener(DEBUG_EVENT, sync);
  }, []);

  useEffect(() => {
    if (!on) return;
    const onResize = () => setViewport(viewportSize());
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDebugOn(false);
    };
    window.addEventListener('resize', onResize);
    window.addEventListener('keydown', onEscape);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('keydown', onEscape);
    };
  }, [on]);

  if (!on) return null;

  const load = pageLoadMs();
  const debug = t.eggs.debug;
  const rows: [string, string][] = [
    [debug.viewport, viewport],
    [debug.theme, debug.themeNames[theme]],
    [debug.language, lang.toUpperCase()],
    [debug.loadTime, load === null ? debug.notAvailable : `${load} ms`],
  ];

  return (
    <aside className="egg-debug-panel" role="status" aria-label={debug.ariaLabel}>
      <p className="egg-debug-title">{debug.title}</p>
      <dl>
        {rows.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      <p className="egg-debug-hint">{debug.exitHint}</p>
    </aside>
  );
};

export default DebugOverlay;
