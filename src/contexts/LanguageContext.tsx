import { createContext, useContext, useEffect, useState } from 'react';
import { strings, type Lang } from '@/lib/i18n';

export type { Lang };

interface LanguageContextType {
  lang: Lang;
  toggleLang: () => void;
  setLang: (lang: Lang) => void;
  t: (typeof strings)['pt'];
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'pt',
  toggleLang: () => {},
  setLang: () => {},
  t: strings.pt,
});

export const useLanguage = () => useContext(LanguageContext);

/** Only an explicit pick (the PT | EN switch) is stored -- a new key, so the old always-'pt' default doesn't stick. */
export const PICK_KEY = 'lang.picked';

const isLang = (value: unknown): value is Lang => value === 'pt' || value === 'en';

/**
 * The visitor's language when they haven't picked one: Portuguese browsers
 * get PT, any other language gets EN, and no information at all keeps PT.
 */
export function detectLang(languages?: readonly (string | undefined)[]): Lang {
  let list = languages;
  if (!list) {
    try {
      list = navigator.languages?.length ? navigator.languages : [navigator.language];
    } catch {
      list = [];
    }
  }
  const first = (list[0] ?? '').toLowerCase();
  if (!first) return 'pt';
  return first.startsWith('pt') ? 'pt' : 'en';
}

/**
 * A ?lang= in the URL (what the hreflang alternates in index.html point at)
 * wins, then the visitor's own pick, then the browser's language.
 */
export function initialLang(): Lang {
  try {
    const urlLang = new URLSearchParams(window.location.search).get('lang');
    if (isLang(urlLang)) return urlLang;
    const picked = localStorage.getItem(PICK_KEY);
    if (isLang(picked)) return picked;
  } catch {
    // storage blocked: fall through to the browser language
  }
  return detectLang();
}

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [lang, setLangState] = useState<Lang>(initialLang);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = (next: Lang) => {
    setLangState(next);
    try {
      localStorage.setItem(PICK_KEY, next);
    } catch {
      // the switch still works for this visit
    }
  };
  const toggleLang = () => setLang(lang === 'pt' ? 'en' : 'pt');

  return <LanguageContext.Provider value={{ lang, toggleLang, setLang, t: strings[lang] }}>{children}</LanguageContext.Provider>;
};
