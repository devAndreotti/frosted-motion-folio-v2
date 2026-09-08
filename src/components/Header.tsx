import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { track } from '@/lib/track';
import { useScrollLock } from '@/hooks/useScrollLock';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import CardStack from './CardStack';
import CopyEmailButton from './CopyEmailButton';

const ROLE_INTERVAL_MS = 2600;
const RECRUITER_EMAIL = 'OrlaEK@proton.me';

const Header = () => {
  const { t } = useLanguage();
  const [roleIdx, setRoleIdx] = useState(0);
  const [recruiterMode, setRecruiterMode] = useState(false);
  const [magnet, setMagnet] = useState({ x: 0, y: 0 });
  const [parallax, setParallax] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const timer = setInterval(() => setRoleIdx((prev) => (prev + 1) % t.header.roles.length), ROLE_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [t.header.roles.length]);

  const recruiterDialogRef = useRef<HTMLDivElement>(null);
  useScrollLock(recruiterMode);
  useFocusTrap(recruiterMode, recruiterDialogRef, () => setRecruiterMode(false));

  const handleHeroMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setParallax({ x: x * 30, y: y * 30 });
  };

  const handleMagnetMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMagnet({ x: x * 14, y: y * 10 });
  };

  return (
    <header
      id="header"
      className="relative overflow-hidden pt-16 min-h-[960px] flex flex-col"
      onMouseMove={handleHeroMove}
    >
      {/* dot-grid texture */}
      <div
        className="absolute inset-0 opacity-50 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(var(--dot) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
          maskImage: 'radial-gradient(ellipse 900px 600px at 70% 20%, #000 0%, transparent 75%)',
        }}
      />

      {/* These stay subtle on purpose — <BackgroundLayers> already carries the
          hue's color wash site-wide; a local orb this size only needs to add
          a little emphasis behind the hero, not repeat the whole effect. */}
      <div
        className="absolute -top-24 -right-36 w-[280px] h-[280px] sm:w-[420px] sm:h-[420px] md:w-[640px] md:h-[640px] rounded-full pointer-events-none animate-orb-drift"
        style={{ background: 'radial-gradient(circle, rgb(var(--accent-rgb) / 0.09) 0%, transparent 70%)' }}
      />
      <div
        className="absolute -bottom-40 -left-28 w-[220px] h-[220px] sm:w-[340px] sm:h-[340px] md:w-[480px] md:h-[480px] rounded-full pointer-events-none animate-orb-drift-reverse"
        style={{ background: 'radial-gradient(circle, rgb(var(--accent-rgb) / 0.05) 0%, transparent 70%)' }}
      />
      <div
        className="absolute w-[360px] h-[360px] rounded-full pointer-events-none transition-transform duration-300 ease-out"
        style={{
          top: '38%',
          left: '38%',
          marginTop: -180,
          marginLeft: -180,
          background: 'radial-gradient(circle, rgb(var(--accent-rgb) / 0.05) 0%, transparent 70%)',
          transform: `translate(${parallax.x}px, ${parallax.y}px)`,
        }}
      />

      <div className="relative z-10 flex-1 flex items-center px-4 sm:px-6 md:px-16">
        <div className="w-full grid grid-cols-[1fr_auto] gap-3 sm:gap-6 items-start md:grid-cols-[1.15fr_1fr] md:gap-12 md:items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 mb-3 sm:mb-5">
              <span className="glass px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-full text-[10px] sm:text-xs uppercase tracking-wider" style={{ color: 'var(--fg-2)' }}>
                {t.header.badge}
              </span>
              <span className="text-[11px] sm:text-[13px]" style={{ color: 'var(--fg-4)' }}>
                Sorocaba, SP
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl md:text-6xl font-extrabold leading-[1.08] md:leading-[1.03] tracking-tight">
              {t.header.lead1}
              <br />
              {t.header.lead2}
              <br />
              <span className="relative block min-h-[60px] sm:min-h-[86px] md:min-h-[136px] overflow-hidden" style={{ color: 'var(--accent)' }}>
                <AnimatePresence mode="wait">
                  <motion.span
                    key={roleIdx}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -14 }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                    className="absolute inset-x-0 top-0"
                  >
                    {t.header.roles[roleIdx]}
                  </motion.span>
                </AnimatePresence>
              </span>
            </h1>

            <p className="mt-3 sm:mt-6 max-w-[460px] text-xs sm:text-base md:text-lg leading-relaxed" style={{ color: 'var(--fg-3)' }}>
              {t.header.paragraph}
            </p>

            <div className="flex items-center gap-2 mt-3 sm:mt-5">
              <span className="relative w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-400">
                <span className="absolute inset-0 rounded-full bg-green-400 animate-pulse-dot" />
              </span>
              <span className="text-[10px] sm:text-[12.5px]" style={{ color: 'var(--fg-3)' }}>
                {t.header.availability}
              </span>
            </div>

            <div className="flex flex-wrap gap-2 sm:gap-3.5 mt-3 sm:mt-6">
              <div
                onMouseMove={handleMagnetMove}
                onMouseLeave={() => setMagnet({ x: 0, y: 0 })}
                style={{
                  background: 'var(--accent)',
                  color: 'var(--accent-text)',
                  transform: `translate(${magnet.x}px, ${magnet.y}px)`,
                }}
                className="glass-strong px-3.5 py-2 sm:px-6 sm:py-3.5 rounded-xl sm:rounded-2xl font-semibold text-xs sm:text-[15px] cursor-pointer transition-transform duration-150 ease-out"
              >
                <a href="#projects" onClick={(e) => { e.preventDefault(); track('cta-projects'); document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' }); }}>
                  {t.header.ctaProjects}
                </a>
              </div>
              <button
                type="button"
                onClick={() => setRecruiterMode(true)}
                className="glass px-3.5 py-2 sm:px-6 sm:py-3.5 rounded-xl sm:rounded-2xl font-semibold text-xs sm:text-[15px]"
              >
                {t.header.ctaRecruiter}
              </button>
            </div>
            <p className="mt-3 sm:mt-6 text-[10px] sm:text-xs hidden sm:block" style={{ color: 'var(--fg-4)' }}>
              {t.header.cardStackHint}
            </p>
          </motion.div>

          <div>
            <CardStack />
          </div>
        </div>
      </div>

      <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 mx-6 md:mx-16" style={{ borderTop: '1px solid var(--border-1)' }}>
        {t.header.stats.map((stat, i) => {
          // Divider goes on the right of every item except the last overall
          // (desktop, 4 cols) *and* the last of each pair (mobile, 2 cols) —
          // without this, item 2 (top-right of row 1) keeps a stray border on
          // narrow screens where it's no longer followed by another item.
          const isLastOverall = i === t.header.stats.length - 1;
          const isLastInMobileRow = i % 2 === 1;
          let dividerClass = 'border-r';
          if (isLastOverall) dividerClass = '';
          else if (isLastInMobileRow) dividerClass = 'max-md:border-r-0 md:border-r';
          return (
          <div
            key={stat.label}
            className={`py-6 px-4 md:px-6 flex gap-3.5 items-start ${dividerClass}`}
            style={{ borderColor: 'var(--border-1)' }}
          >
            <div>
              <div className="text-2xl md:text-[28px] font-extrabold" style={{ color: 'var(--accent)' }}>
                {stat.value}
              </div>
              <div className="text-[13.5px] font-semibold mt-0.5">{stat.label}</div>
              <div className="text-xs mt-1 leading-snug" style={{ color: 'var(--fg-4)' }}>
                {stat.desc}
              </div>
            </div>
          </div>
          );
        })}
      </div>

      <div className="relative z-10 flex justify-center py-6">
        <button
          type="button"
          aria-label={t.header.scrollCueAria}
          onClick={() => document.getElementById('marquee')?.scrollIntoView({ behavior: 'smooth' })}
          className="animate-bob glass w-9 h-9 rounded-full flex items-center justify-center hover:bg-[var(--surface-2)] transition-colors"
          style={{ color: 'var(--fg-4)' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none">
            <path d="M12 5v14M5 12l7 7 7-7" />
          </svg>
        </button>
      </div>

      {recruiterMode && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md p-6 md:p-10"
          onClick={() => setRecruiterMode(false)}
        >
          <div
            ref={recruiterDialogRef}
            className="glass-strong w-full max-w-2xl max-h-full overflow-auto rounded-[28px] p-10 md:p-12"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={t.header.recruiterDialogAria}
            data-print-target="recruiter-summary"
          >
            <div className="text-[11px] uppercase tracking-wider mb-3.5" style={{ color: 'var(--fg-4)' }}>
              {t.header.recruiterLabel}
            </div>
            <div className="text-3xl md:text-[34px] font-extrabold mb-1.5">Ricardo A. Gonçalves</div>
            <div className="text-[15.5px] mb-7" style={{ color: 'var(--fg-2)' }}>
              {t.header.badge} — Sorocaba, SP
            </div>
            <ul className="flex flex-col gap-4 mb-8">
              {t.header.recruiterBullets.map((bullet) => (
                <li key={bullet} className="flex gap-2.5 items-start">
                  <span className="w-1.5 h-1.5 mt-2 rounded-full flex-shrink-0" style={{ background: 'var(--accent)' }} />
                  <span className="text-[14.5px] leading-relaxed" style={{ color: 'var(--fg-2)' }}>
                    {bullet}
                  </span>
                </li>
              ))}
            </ul>
            <div className="flex gap-3 items-center" data-print-hide>
              <a
                href={`mailto:${RECRUITER_EMAIL}`}
                className="px-6 py-3 rounded-xl font-semibold text-sm"
                style={{ background: 'var(--accent)', color: 'var(--accent-text)' }}
              >
                {t.common.sendEmail}
              </a>
              <CopyEmailButton email={RECRUITER_EMAIL} />
              <button type="button" onClick={() => setRecruiterMode(false)} className="glass px-6 py-3 rounded-xl font-semibold text-sm">
                {t.header.recruiterBack}
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
