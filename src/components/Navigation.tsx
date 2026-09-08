import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Moon, Sun, Menu, X } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useGithubActivity } from '@/hooks/useGithubActivity';
import { useEscapeKey } from '@/hooks/useEscapeKey';
import { springPop } from '@/lib/motion';
import ColorSwatchPicker from './ColorSwatchPicker';
import SudoTerminal from './SudoTerminal';
import { RepoBadge, SocialLinks, LangToggleButton } from './NavExtras';

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
  const { lang, toggleLang, t } = useLanguage();
  const { publicRepos, loading: reposLoading } = useGithubActivity();
  const NAV_ITEMS = [
    { name: t.nav.home, id: 'header' },
    { name: t.nav.projects, id: 'projects' },
    { name: t.nav.skills, id: 'skills' },
    { name: t.nav.journey, id: 'timeline' },
    { name: t.nav.contact, id: 'contact' },
  ];
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [glitchText, setGlitchText] = useState<string | null>(null);
  const [activeId, setActiveId] = useState('header');

  const [scrolled, setScrolled] = useState(false);
  const holdTimer = useRef<ReturnType<typeof setTimeout>>();
  const glitchInterval = useRef<ReturnType<typeof setInterval>>();

  // Floats transparent over the hero, solidifies once the page actually
  // scrolls -- same macOS/iOS nav-bar behavior, same listener pattern as
  // ScrollProgress.tsx.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(
    () => () => {
      clearTimeout(holdTimer.current);
      clearInterval(glitchInterval.current);
    },
    []
  );

  // Menus opened via disclosure (not a modal dialog) still get the
  // conventional Escape-to-close keyboard behavior.
  useEscapeKey(isMobileMenuOpen, () => setIsMobileMenuOpen(false));

  // Scroll-spy: highlight whichever section currently sits in the vertical
  // "reading band" of the viewport, so the nav shows where you actually are.
  useEffect(() => {
    const sections = NAV_ITEMS.map((item) => document.getElementById(item.id)).filter((el): el is HTMLElement => el !== null);
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting);
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: '-40% 0px -55% 0px', threshold: 0 }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

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
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <>
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={() => setIsMobileMenuOpen(false)} aria-hidden="true" />
      )}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="fixed top-0 left-0 right-0 z-50"
      >
        {/* Blur/background/border stay always-on here; only opacity crossfades
            as the page scrolls -- animating backdrop-filter itself is janky
            in most browsers, opacity isn't (same two-layer-crossfade idea as
            BackgroundLayers.tsx, just one layer since "off" is just invisible). */}
        <div
          className="absolute inset-0 backdrop-blur-lg pointer-events-none transition-opacity duration-300 ease-out"
          style={{
            background: 'var(--surface-1)',
            borderBottom: '1px solid var(--border-1)',
            opacity: scrolled ? 1 : 0,
          }}
        />
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex items-center justify-between h-16 gap-4" data-testid="nav-bar">
            <button
              type="button"
              onMouseDown={() => {
                holdTimer.current = setTimeout(startGlitch, GLITCH_HOLD_MS);
              }}
              onMouseUp={() => clearTimeout(holdTimer.current)}
              onMouseLeave={() => clearTimeout(holdTimer.current)}
              onClick={() => scrollToSection('header')}
              className="text-lg font-extrabold tracking-wide select-none whitespace-nowrap flex-shrink-0"
              style={{ color: glitchText ? 'var(--accent)' : 'var(--fg-1)', fontFamily: glitchText ? 'monospace' : 'inherit' }}
            >
              {glitchText ?? (
                <>
                  Ricardo<span className="hidden xl:inline"> Andreotti</span>
                </>
              )}
            </button>

            <div className="hidden md:flex items-center gap-6">
              {NAV_ITEMS.map((item, index) => {
                const isActive = activeId === item.id;
                return (
                  <motion.button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    aria-current={isActive ? 'true' : undefined}
                    className="text-sm font-medium transition-colors duration-300 relative group"
                    style={{ color: isActive ? 'var(--fg-1)' : 'var(--fg-2)', fontWeight: isActive ? 700 : 500 }}
                    whileHover={{ scale: 1.05 }}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                  >
                    {item.name}
                    <span
                      className={`absolute -bottom-1 left-0 h-0.5 transition-all duration-300 ${isActive ? 'w-full' : 'w-0 group-hover:w-full'}`}
                      style={{ background: 'var(--accent)' }}
                    />
                  </motion.button>
                );
              })}
            </div>

            <div className="hidden md:flex items-center gap-3">
              <RepoBadge loading={reposLoading} count={publicRepos} label={t.nav.reposLabel} />

              <ColorSwatchPicker />

              <LangToggleButton lang={lang} onClick={toggleLang} ariaLabel={t.nav.langToggleAria} />

              <motion.button
                onClick={toggleTheme}
                aria-label={t.nav.themeToggleAria}
                className="glass w-9 h-9 rounded-full flex items-center justify-center"
                whileHover={{ scale: 1.1, rotate: theme === 'light' ? 180 : -180 }}
                whileTap={{ scale: 0.95 }}
                transition={springPop(0)}
              >
                {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              </motion.button>

              <SocialLinks />
            </div>

            <div className="md:hidden flex items-center gap-2">
              <LangToggleButton lang={lang} onClick={toggleLang} ariaLabel={t.nav.langToggleAria} />
              <motion.button
                onClick={toggleTheme}
                aria-label={t.nav.themeToggleAria}
                className="glass w-9 h-9 rounded-full flex items-center justify-center"
                whileTap={{ scale: 0.95 }}
              >
                {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              </motion.button>
              <motion.button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label={isMobileMenuOpen ? t.nav.menuCloseAria : t.nav.menuOpenAria}
                className="glass w-9 h-9 rounded-full flex items-center justify-center"
                whileTap={{ scale: 0.95 }}
              >
                {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </motion.button>
            </div>
          </div>

          {isMobileMenuOpen && (
            <motion.div className="md:hidden pb-4 pt-1 overflow-hidden" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} transition={{ duration: 0.4 }}>
              <div className="glass-strong rounded-2xl p-3 flex flex-col gap-1" data-testid="mobile-menu">
                <RepoBadge loading={reposLoading} count={publicRepos} label={t.nav.reposLabel} compact />

                {NAV_ITEMS.map((item) => {
                  const isActive = activeId === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => scrollToSection(item.id)}
                      aria-current={isActive ? 'true' : undefined}
                      className="text-left px-3.5 py-3 rounded-xl text-[15px] font-semibold transition-colors hover:bg-[var(--surface-2)] active:bg-[var(--surface-2)]"
                      style={{ color: isActive ? 'var(--accent)' : 'var(--fg-2)', background: isActive ? 'var(--surface-2)' : undefined }}
                    >
                      {item.name}
                    </button>
                  );
                })}

                <div className="h-px my-2 mx-1" style={{ background: 'var(--border-1)' }} />

                <div className="flex items-center justify-between px-1 pb-1">
                  <div className="flex items-center gap-2">
                    <SocialLinks size="md" />
                  </div>
                  <ColorSwatchPicker />
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </motion.nav>

      <SudoTerminal />
    </>
  );
};

export default Navigation;
