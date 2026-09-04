import { createContext, useContext, useEffect, useState } from 'react';
import { strings, type Lang } from '@/lib/i18n';

export type { Lang };

interface LanguageContextType {
  lang: Lang;
  toggleLang: () => void;
  t: (typeof strings)['pt'];
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'pt',
  toggleLang: () => {},
  t: strings.pt,
});

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [lang, setLang] = useState<Lang>('pt');

  useEffect(() => {
    const saved = localStorage.getItem('lang') as Lang | null;
    if (saved === 'pt' || saved === 'en') setLang(saved);
  }, []);

  useEffect(() => {
    localStorage.setItem('lang', lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const toggleLang = () => setLang((prev) => (prev === 'pt' ? 'en' : 'pt'));

  return <LanguageContext.Provider value={{ lang, toggleLang, t: strings[lang] }}>{children}</LanguageContext.Provider>;
};
