import { useEffect, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Moon, Rss, Sun } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { contact } from '@/data/personal';
import { LangSwitch } from '@/components/NavExtras';
import ColorPickerPopover from '@/components/ColorPickerPopover';
import { USES_LINK } from '@/data/uses';

// The app's root on either deploy ("/" on devandreotti.com, "/frosted-motion-folio-v2/" on GitHub Pages).
export const HOME = import.meta.env.BASE_URL;

/** The blog pages' frame: a slim bar (home, blog, RSS, accent color, language, theme) and a one-line footer. */
const BlogShell = ({ title, children }: { title: string; children: ReactNode }) => {
  const { theme, toggleTheme } = useTheme();
  const { lang, setLang, t } = useLanguage();

  useEffect(() => {
    document.title = title;
  }, [title]);

  return (
    <div className="blog min-h-screen relative [overflow-x:clip]">
      <header className="nav">
        <div className="nav-in blog-nav">
          <a className="brand" href={HOME}>
            <span className="mono-b">RA</span>
            <span className="brand-name">Ricardo Andreotti</span>
          </a>
          <div className="nav-r">
            <nav className="blog-links" aria-label={t.nav.blog}>
              <a className="nl" href={HOME}>
                {t.nav.home}
              </a>
              <Link className="nl on" to="/blog/">
                {t.nav.blog}
              </Link>
              <Link className="nl" to="/uses">
                {USES_LINK[lang]}
              </Link>
            </nav>
            <a className="np" href={`${HOME}blog/rss.xml`} aria-label="RSS">
              <Rss className="ic s" />
              <span className="blog-rss-t">RSS</span>
            </a>
            <ColorPickerPopover />
            <LangSwitch lang={lang} onPick={setLang} ariaLabel={t.nav.langToggleAria} />
            <button type="button" onClick={toggleTheme} aria-label={t.nav.themeToggleAria} className="np sq">
              {theme === 'light' ? <Moon className="ic" /> : <Sun className="ic" />}
            </button>
          </div>
        </div>
      </header>

      {children}

      <footer className="nf-foot">
        <span>© {new Date().getFullYear()} Ricardo A. Gonçalves</span>
        <a href={`mailto:${contact.email}`}>{contact.email}</a>
        <Link to="/uses">{USES_LINK[lang]}</Link>
      </footer>
    </div>
  );
};

export default BlogShell;
