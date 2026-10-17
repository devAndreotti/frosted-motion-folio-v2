import { useEffect, type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Moon, Rss, Sun } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { contact } from '@/data/personal';
import { LangSwitch } from '@/components/NavExtras';
import ColorPickerPopover from '@/components/ColorPickerPopover';
import { USES_LINK } from '@/data/uses';
import NovidadesBadge from '@/components/NovidadesBadge';
import { blogNavActive, type BlogNavKey } from './blogNav';

// The app's root on either deploy ("/" on devandreotti.com, "/frosted-motion-folio-v2/" on GitHub Pages).
export const HOME = import.meta.env.BASE_URL;

/** The blog pages' frame: a slim bar (home, blog, RSS, accent color, language, theme) and a one-line footer. */
const BlogShell = ({ title, children, className }: { title: string; children: ReactNode; className?: string }) => {
  const { theme, toggleTheme } = useTheme();
  const { lang, setLang, t } = useLanguage();
  const active = blogNavActive(useLocation().pathname);
  const current = (key: BlogNavKey): 'page' | undefined => (active === key ? 'page' : undefined);

  useEffect(() => {
    document.title = title;
  }, [title]);

  return (
    <div className={`blog min-h-screen relative [overflow-x:clip]${className ? ` ${className}` : ''}`}>
      <header className="nav">
        <div className="nav-in blog-nav">
          <a className="brand" href={HOME}>
            <span className="mono-b">RA</span>
            <span className="brand-name">Ricardo Andreotti</span>
          </a>
          <div className="nav-r">
            <nav className="blog-links" aria-label={t.nav.blog}>
              <a className={`nl${active === 'home' ? ' on' : ''}`} href={HOME} aria-current={current('home')}>
                {t.nav.home}
              </a>
              <Link className={`nl${active === 'blog' ? ' on' : ''}`} to="/blog/" aria-current={current('blog')}>
                {t.nav.blog}
              </Link>
              <Link className={`nl${active === 'uses' ? ' on' : ''}`} to="/uses" aria-current={current('uses')}>
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
        <nav className="nf-links">
          <a href={HOME} aria-current={current('home')}>
            {t.nav.home}
          </a>
          <Link to="/blog/" aria-current={current('blog')}>
            {t.nav.blog}
          </Link>
          <Link to="/uses" aria-current={current('uses')}>
            {USES_LINK[lang]}
          </Link>
          <Link to="/novidades/" aria-current={current('novidades')}>
            {t.novidades.pageTitle}
          </Link>
        </nav>
        <NovidadesBadge />
      </footer>
    </div>
  );
};

export default BlogShell;
