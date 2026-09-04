import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
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

  useEffect(() => {
    if (!recruiterMode) return;
    const onKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setRecruiterMode(false);
    };
    window.addEventListener('keydown', onKeydown);
    return () => window.removeEventListener('keydown', onKeydown);
  }, [recruiterMode]);

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
        className="absolute -top-24 -right-36 w-[640px] h-[640px] rounded-full pointer-events-none animate-orb-drift"
        style={{ background: 'radial-gradient(circle, rgba(var(--accent-rgb), 0.09) 0%, transparent 70%)' }}
      />
      <div
        className="absolute -bottom-40 -left-28 w-[480px] h-[480px] rounded-full pointer-events-none animate-orb-drift-reverse"
        style={{ background: 'radial-gradient(circle, rgba(var(--accent-rgb), 0.05) 0%, transparent 70%)' }}
      />
      <div
        className="absolute w-[360px] h-[360px] rounded-full pointer-events-none transition-transform duration-300 ease-out"
        style={{
          top: '38%',
          left: '38%',
          marginTop: -180,
          marginLeft: -180,
          background: 'radial-gradient(circle, rgba(var(--accent-rgb), 0.05) 0%, transparent 70%)',
          transform: `translate(${parallax.x}px, ${parallax.y}px)`,
        }}
      />

      <div className="relative z-10 flex-1 flex items-center px-6 md:px-16">
        <div className="w-full grid md:grid-cols-[1.15fr_1fr] gap-12 items-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="flex items-center gap-2.5 mb-5">
              <span className="glass px-3.5 py-1.5 rounded-full text-xs uppercase tracking-wider" style={{ color: 'var(--fg-2)' }}>
                {t.header.badge}
              </span>
              <span className="text-[13px]" style={{ color: 'var(--fg-4)' }}>
                Sorocaba, SP
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl font-extrabold leading-[1.03] tracking-tight">
              {t.header.lead1}
              <br />
              {t.header.lead2}
              <br />
              <span className="relative block min-h-[100px] md:min-h-[136px] overflow-hidden" style={{ color: 'var(--accent)' }}>
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

            <p className="mt-6 max-w-[460px] text-lg leading-relaxed" style={{ color: 'var(--fg-3)' }}>
              {t.header.paragraph}
            </p>

            <div className="flex items-center gap-2 mt-5">
              <span className="relative w-2 h-2 rounded-full bg-green-400">
                <span className="absolute inset-0 rounded-full bg-green-400 animate-pulse-dot" />
              </span>
              <span className="text-[12.5px]" style={{ color: 'var(--fg-3)' }}>
                {t.header.availability}
              </span>
            </div>

            <div className="flex flex-wrap gap-3.5 mt-6">
              <div
                onMouseMove={handleMagnetMove}
                onMouseLeave={() => setMagnet({ x: 0, y: 0 })}
                style={{
                  background: 'var(--accent)',
                  color: 'var(--accent-text)',
                  transform: `translate(${magnet.x}px, ${magnet.y}px)`,
                }}
                className="glass-strong px-6 py-3.5 rounded-2xl font-semibold text-[15px] cursor-pointer transition-transform duration-150 ease-out"
              >
                <a href="#projects" onClick={(e) => { e.preventDefault(); document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' }); }}>
                  {t.header.ctaProjects}
                </a>
              </div>
              <button
                type="button"
                onClick={() => setRecruiterMode(true)}
                className="glass px-6 py-3.5 rounded-2xl font-semibold text-[15px]"
              >
                {t.header.ctaRecruiter}
              </button>
            </div>
            <p className="mt-6 text-xs" style={{ color: 'var(--fg-4)' }}>
              {t.header.cardStackHint}
            </p>
          </motion.div>

          <CardStack />
        </div>
      </div>

      <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 mx-6 md:mx-16" style={{ borderTop: '1px solid var(--border-1)' }}>
        {t.header.stats.map((stat, i) => (
          <div
            key={stat.label}
            className="py-6 px-4 md:px-6 flex gap-3.5 items-start"
            style={i < t.header.stats.length - 1 ? { borderRight: '1px solid var(--border-1)' } : undefined}
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
        ))}
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
          className="absolute inset-0 z-20 flex items-center justify-center bg-black/50 backdrop-blur-md px-6 py-16"
          onClick={() => setRecruiterMode(false)}
        >
          <div
            className="glass-strong w-full max-w-2xl rounded-[28px] p-10 md:p-12"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={t.header.recruiterDialogAria}
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
            <div className="flex gap-3 items-center">
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
