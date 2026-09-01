import { createContext, useContext, useEffect, useState } from 'react';
import { buildHueTheme, hexToRgbTriplet, HUE_ORDER, type Hue } from '@/lib/theme';

export type { Hue };
export { HUE_ORDER, hexToRgbTriplet };

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  hue: Hue;
  setHue: (hue: Hue) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  toggleTheme: () => {},
  hue: 'black',
  setHue: () => {},
});

export const useTheme = () => useContext(ThemeContext);

// The gradient/glow tokens are consumed directly by BackgroundLayers (it
// needs the raw values in JS to crossfade), not via CSS var — everything
// else (accent, glass surface/border) is still read as var(...) throughout
// the component tree, so those stay as CSS custom properties.
const CSS_VAR_BY_TOKEN = {
  accent: '--accent',
  accentText: '--accent-text',
  glassSurface: '--surface-1',
  glassBorder: '--border-1',
  glassStrongSurface: '--surface-2',
  glassStrongBorder: '--border-2',
} as const;

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  // Default theme is dark black-glass, not the system preference — that is
  // the redesign's whole premise ("preto por padrão, não mais azul").
  const [theme, setTheme] = useState<Theme>('dark');
  const [hue, setHueState] = useState<Hue>('black');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    const savedHue = localStorage.getItem('hue') as Hue | null;
    if (savedTheme) setTheme(savedTheme);
    if (savedHue && HUE_ORDER.includes(savedHue)) setHueState(savedHue);
  }, []);

  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('hue', hue);
    const tokens = buildHueTheme(hue)[theme];
    const root = document.documentElement.style;
    (Object.keys(CSS_VAR_BY_TOKEN) as (keyof typeof CSS_VAR_BY_TOKEN)[]).forEach((key) => {
      root.setProperty(CSS_VAR_BY_TOKEN[key], tokens[key]);
    });
    root.setProperty('--accent-rgb', hexToRgbTriplet(tokens.accent));
  }, [hue, theme]);

  const toggleTheme = () => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  const setHue = (next: Hue) => setHueState(next);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, hue, setHue }}>
      {children}
    </ThemeContext.Provider>
  );
};
