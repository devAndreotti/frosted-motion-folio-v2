import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Moon, Sun, Menu, X, Github, Linkedin } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useGithubActivity } from '@/hooks/useGithubActivity';
import { springPop } from '@/lib/motion';
import ColorSwatchPicker from './ColorSwatchPicker';
import SudoTerminal from './SudoTerminal';

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
  const { publicRepos } = useGithubActivity();
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

  const holdTimer = useRef<ReturnType<typeof setTimeout>>();
  const glitchInterval = useRef<ReturnType<typeof setInterval>>();

  useEffect(
    () => () => {
      clearTimeout(holdTimer.current);
      clearInterval(glitchInterval.current);
    },
    []
  );

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
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-lg"
        style={{ background: 'var(--surface-1)', borderBottom: '1px solid var(--border-1)' }}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 gap-4">
            <button
              type="button"
              onMouseDown={() => {
                holdTimer.current = setTimeout(startGlitch, GLITCH_HOLD_MS);
              }}
              onMouseUp={() => clearTimeout(holdTimer.current)}
              onMouseLeave={() => clearTimeout(holdTimer.current)}
              onClick={() => scrollToSection('header')}
              className="text-lg font-extrabold tracking-wide select-none"
              style={{ color: glitchText ? 'var(--accent)' : 'var(--fg-1)', fontFamily: glitchText ? 'monospace' : 'inherit' }}
            >
              {glitchText ?? NAME}
            </button>

            <div className="hidden md:flex items-center gap-6">
              {NAV_ITEMS.map((item, index) => {
                const isActive = activeId === item.id;
                return (
                  <motion.button
                    key={item.name}
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
              {publicRepos != null && (
                <div className="glass flex items-center gap-2 px-3 py-1.5 rounded-full">
                  <span className="relative w-1.5 h-1.5 rounded-full bg-green-400">
                    <span className="absolute inset-0 rounded-full bg-green-400 animate-pulse-dot" />
                  </span>
                  <span className="text-[11px]" style={{ color: 'var(--fg-3)' }}>
                    {t.nav.reposLabel(publicRepos)}
                  </span>
                </div>
              )}

              <ColorSwatchPicker />

              <button
                type="button"
                onClick={toggleLang}
                aria-label={t.nav.langToggleAria}
                className="glass w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-bold uppercase"
              >
                {lang === 'pt' ? 'EN' : 'PT'}
              </button>

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

              <a
                href="https://github.com/devAndreotti"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="glass w-9 h-9 rounded-full flex items-center justify-center"
              >
                <Github className="w-4 h-4" />
              </a>
              <a
                href="https://www.linkedin.com/in/ricardo-andreotti-gon%C3%A7alves-0b5785283/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="glass w-9 h-9 rounded-full flex items-center justify-center"
              >
                <Linkedin className="w-4 h-4" />
              </a>
            </div>

            <div className="md:hidden flex items-center gap-2">
              <button
                type="button"
                onClick={toggleLang}
                aria-label={t.nav.langToggleAria}
                className="glass w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-bold uppercase"
              >
                {lang === 'pt' ? 'EN' : 'PT'}
              </button>
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
            <motion.div className="md:hidden pb-4 pt-2" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} transition={{ duration: 0.4 }}>
              <div className="flex flex-col items-center gap-3">
                {NAV_ITEMS.map((item) => (
                  <button
                    key={item.name}
                    onClick={() => scrollToSection(item.id)}
                    className="glass w-full text-center px-4 py-2 rounded-md text-sm font-medium"
                    style={{ color: 'var(--fg-2)' }}
                  >
                    {item.name}
                  </button>
                ))}
                <div className="pt-2">
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
