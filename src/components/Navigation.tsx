import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Menu, Moon, Sun, X } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useGithubActivity } from '@/hooks/useGithubActivity';
import { useEscapeKey } from '@/hooks/useEscapeKey';
import ColorSwatchPicker from './ColorSwatchPicker';
import ColorPickerPopover from './ColorPickerPopover';
import SudoTerminal from './SudoTerminal';
import { LangSwitch, RepoPill } from './NavExtras';

const GLITCH_CHARS = '#$%&01</>{}=+*';
const GLITCH_TICKS = 10;
const GLITCH_HOLD_MS = 3000;

export function scrambled(text: string): string {
  return text
    .split('')
    .map((char) => (char === ' ' ? ' ' : Math.random() < 0.4 ? GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)] : char))
    .join('');
}

const NAME = 'Ricardo Andreotti';

const Navigation = () => {
  const { theme, toggleTheme } = useTheme();
  const { lang, setLang, t } = useLanguage();
  const { publicRepos, loading: reposLoading } = useGithubActivity();
  const NAV_ITEMS = [
    { name: t.nav.home, id: 'header' },
    { name: t.nav.now, id: 'now' },
    { name: t.nav.projects, id: 'projects' },
    { name: t.nav.skills, id: 'skills' },
    { name: t.nav.journey, id: 'timeline' },
    { name: t.nav.contact, id: 'contact' },
  ];
  const [menuOpen, setMenuOpen] = useState(false);
  const [glitchText, setGlitchText] = useState<string | null>(null);
  const [activeId, setActiveId] = useState('header');
  const holdTimer = useRef<ReturnType<typeof setTimeout>>();
  const glitchInterval = useRef<ReturnType<typeof setInterval>>();

  useEffect(
    () => () => {
      clearTimeout(holdTimer.current);
      clearInterval(glitchInterval.current);
    },
    []
  );

  useEscapeKey(menuOpen, () => setMenuOpen(false));

  // Scroll-spy: highlight whichever section currently sits in the vertical
  // "reading band" of the viewport, so the nav shows where you actually are.
  useEffect(() => {
    const sections = NAV_ITEMS.map((item) => document.getElementById(item.id)).filter((el): el is HTMLElement => el !== null);
    if (sections.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting);
        if (visible.length > 0) setActiveId(visible[0].target.id);
      },
      { rootMargin: '-40% 0px -55% 0px', threshold: 0 }
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Holding the name for 3 s scrambles it -- the way into the sudo terminal.
  const startGlitch = () => {
    let ticks = 0;
    clearInterval(glitchInterval.current);
    glitchInterval.current = setInterval(() => {
      ticks++;
      setGlitchText(scrambled(NAME));
      if (ticks > GLITCH_TICKS) {
        clearInterval(glitchInterval.current);
        setGlitchText(null);
      }
    }, 70);
  };

  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);
  };

  return (
    <>
      {menuOpen && <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} aria-hidden="true" />}
      <header className="nav">
        <div className="nav-in" data-testid="nav-bar">
          <button
            type="button"
            className="brand"
            onMouseDown={() => {
              holdTimer.current = setTimeout(startGlitch, GLITCH_HOLD_MS);
            }}
            onMouseUp={() => clearTimeout(holdTimer.current)}
            onMouseLeave={() => clearTimeout(holdTimer.current)}
            onClick={() => scrollToSection('header')}
          >
            <span className="mono-b">RA</span>
            <span className="brand-name" style={glitchText ? { color: 'var(--accent)', fontFamily: 'var(--font-mono)' } : undefined}>
              {glitchText ?? NAME}
            </span>
          </button>

          <nav className="nav-links" aria-label={t.nav.home}>
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => scrollToSection(item.id)}
                aria-current={activeId === item.id ? 'true' : undefined}
                className={`nl${activeId === item.id ? ' on' : ''}`}
              >
                {item.name}
              </button>
            ))}
          </nav>

          <div className="nav-r">
            <RepoPill loading={reposLoading} count={publicRepos} label={t.nav.reposLabel} />
            <ColorPickerPopover />
            <LangSwitch lang={lang} onPick={setLang} ariaLabel={t.nav.langToggleAria} className="lang-d" />
            <button type="button" onClick={toggleTheme} aria-label={t.nav.themeToggleAria} className="np sq">
              {theme === 'light' ? <Moon className="ic" /> : <Sun className="ic" />}
            </button>
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? t.nav.menuCloseAria : t.nav.menuOpenAria}
              aria-expanded={menuOpen}
              className="np sq nav-menu"
            >
              {menuOpen ? <X className="ic" /> : <Menu className="ic" />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="sheet relative z-50" data-testid="mobile-menu">
            {NAV_ITEMS.map((item) => (
              <button key={item.id} type="button" onClick={() => scrollToSection(item.id)} aria-current={activeId === item.id ? 'true' : undefined}>
                <span>{item.name}</span>
                <ArrowRight className="ic s" />
              </button>
            ))}
            <div className="sheet-row">
              <LangSwitch lang={lang} onPick={setLang} ariaLabel={t.nav.langToggleAria} />
              <div className="sheet-sw">
                <ColorSwatchPicker />
              </div>
            </div>
          </div>
        )}
      </header>

      <SudoTerminal />
    </>
  );
};

export default Navigation;
