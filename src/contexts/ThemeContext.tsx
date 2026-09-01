import { createContext, useContext, useEffect, useState } from 'react';

// Tipagem do tema
type Theme = 'light' | 'dark';

// Interface do contexto
interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

// Contexto inicial
const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  toggleTheme: () => {},
});

// Hook personalizado para consumir o tema
export const useTheme = () => useContext(ThemeContext);

// Provedor do tema
export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<Theme>('light');

  // Ao carregar, busca tema salvo ou preferência do sistema
  useEffect(() => {
    const saved = localStorage.getItem('theme') as Theme | null;

    if (saved) {
      setTheme(saved);
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'dark' : 'light');
    }
  }, []);

  // Atualiza localStorage e classe do HTML sempre que o tema muda
  useEffect(() => {
    localStorage.setItem('theme', theme);

    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  // Alterna entre light e dark
  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
