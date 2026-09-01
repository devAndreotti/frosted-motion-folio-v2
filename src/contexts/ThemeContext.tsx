import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';
export type Hue = 'black' | 'blue' | 'purple' | 'orange' | 'red' | 'green' | 'yellow';

interface HueShade {
  accent: string;
  text: string;
}

interface HueDefinition {
  swatch: string;
  dark: HueShade;
  light: HueShade;
}

// Each hue carries a dark-mode shade and a light-mode shade, mirroring the
// site's original blue-only light/dark pair — now generalized to 7 hues.
// `swatch` is the fixed reference color shown in the color picker dot.
export const HUES: Record<Hue, HueDefinition> = {
  black: { swatch: '#8b8b8b', dark: { accent: '#e4e4e7', text: '#0a0a0a' }, light: { accent: '#18181b', text: '#fafafa' } },
  blue: { swatch: '#3b82f6', dark: { accent: '#3b82f6', text: '#ffffff' }, light: { accent: '#2563eb', text: '#ffffff' } },
  purple: { swatch: '#a855f7', dark: { accent: '#a855f7', text: '#ffffff' }, light: { accent: '#9333ea', text: '#ffffff' } },
  orange: { swatch: '#f97316', dark: { accent: '#f97316', text: '#1a0f00' }, light: { accent: '#ea580c', text: '#fff7ed' } },
  red: { swatch: '#ef4444', dark: { accent: '#ef4444', text: '#ffffff' }, light: { accent: '#dc2626', text: '#ffffff' } },
  green: { swatch: '#22c55e', dark: { accent: '#22c55e', text: '#052e16' }, light: { accent: '#16a34a', text: '#f0fdf4' } },
  yellow: { swatch: '#eab308', dark: { accent: '#eab308', text: '#1a1400' }, light: { accent: '#ca8a04', text: '#1a1400' } },
};

export const HUE_ORDER: Hue[] = ['black', 'blue', 'purple', 'orange', 'red', 'green', 'yellow'];

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

export function hexToRgbTriplet(hex: string): string {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return `${r} ${g} ${b}`;
}

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  // Default theme is dark black-glass, not the system preference — that is
  // the redesign's whole premise ("preto por padrão, não mais azul").
  const [theme, setTheme] = useState<Theme>('dark');
  const [hue, setHueState] = useState<Hue>('black');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    const savedHue = localStorage.getItem('hue') as Hue | null;
    if (savedTheme) setTheme(savedTheme);
    if (savedHue && savedHue in HUES) setHueState(savedHue);
  }, []);

  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('hue', hue);
    const shade = HUES[hue][theme];
    const root = document.documentElement.style;
    root.setProperty('--accent', shade.accent);
    root.setProperty('--accent-text', shade.text);
    root.setProperty('--accent-rgb', hexToRgbTriplet(shade.accent));
  }, [hue, theme]);

  const toggleTheme = () => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  const setHue = (next: Hue) => setHueState(next);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, hue, setHue }}>
      {children}
    </ThemeContext.Provider>
  );
};
