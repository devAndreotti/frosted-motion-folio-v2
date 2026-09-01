import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CardStack from './CardStack';

const ROLES = ['propósito real.', 'que resolvem problemas.', 'bem pensados.', 'com boa DX.'];
const ROLE_INTERVAL_MS = 2600;

const STATS = [
  { value: '30+', label: 'Projetos', desc: 'Do estudo à produção' },
  { value: '6', label: 'Áreas', desc: 'Web, IA, automação, dados' },
  { value: '7º', label: 'Semestre', desc: 'Ciência da Computação — UNIP' },
  { value: '24/7', label: 'Aprendendo', desc: 'Sempre construindo algo novo' },
];

const RECRUITER_BULLETS = [
  '30+ projetos, do estudo à produção — React, Node.js, TypeScript.',
  '7º semestre de Ciência da Computação — UNIP.',
  'Stack principal: React, TypeScript, Node.js, Supabase, Python.',
  'Disponível para novos projetos e freelas agora.',
];

const Header = () => {
  const [roleIdx, setRoleIdx] = useState(0);
  const [recruiterMode, setRecruiterMode] = useState(false);
  const [magnet, setMagnet] = useState({ x: 0, y: 0 });
  const [parallax, setParallax] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const timer = setInterval(() => setRoleIdx((prev) => (prev + 1) % ROLES.length), ROLE_INTERVAL_MS);
    return () => clearInterval(timer);
  }, []);

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

      <div
        className="absolute -top-24 -right-36 w-[640px] h-[640px] rounded-full pointer-events-none animate-orb-drift"
        style={{ background: 'radial-gradient(circle, rgba(var(--accent-rgb), 0.15) 0%, transparent 70%)' }}
      />
      <div
        className="absolute -bottom-40 -left-28 w-[480px] h-[480px] rounded-full pointer-events-none animate-orb-drift-reverse"
        style={{ background: 'radial-gradient(circle, rgba(var(--accent-rgb), 0.08) 0%, transparent 70%)' }}
      />
      <div
        className="absolute w-[360px] h-[360px] rounded-full pointer-events-none transition-transform duration-300 ease-out"
        style={{
          top: '38%',
          left: '38%',
          marginTop: -180,
          marginLeft: -180,
          background: 'radial-gradient(circle, rgba(var(--accent-rgb), 0.07) 0%, transparent 70%)',
          transform: `translate(${parallax.x}px, ${parallax.y}px)`,
        }}
      />

      {!recruiterMode ? (
        <>
          <div className="relative z-10 flex-1 flex items-center px-6 md:px-16">
            <div className="w-full grid md:grid-cols-[1.15fr_1fr] gap-12 items-center">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
                <div className="flex items-center gap-2.5 mb-5">
                  <span className="glass px-3.5 py-1.5 rounded-full text-xs uppercase tracking-wider" style={{ color: 'var(--fg-2)' }}>
                    Full Stack &amp; IA
                  </span>
                  <span className="text-[13px]" style={{ color: 'var(--fg-4)' }}>
                    Sorocaba, SP
                  </span>
                </div>

                <h1 className="text-5xl md:text-6xl font-extrabold leading-[1.03] tracking-tight">
                  Desenvolvo
                  <br />
                  produtos com
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
                        {ROLES[roleIdx]}
                      </motion.span>
                    </AnimatePresence>
                  </span>
                </h1>

                <p className="mt-6 max-w-[460px] text-lg leading-relaxed" style={{ color: 'var(--fg-3)' }}>
                  React, Node.js, IA aplicada e automação. Cada projeto une design, eficiência e um problema de verdade pra resolver.
                </p>

                <div className="flex items-center gap-2 mt-5">
                  <span className="relative w-2 h-2 rounded-full bg-green-400">
                    <span className="absolute inset-0 rounded-full bg-green-400 animate-pulse-dot" />
                  </span>
                  <span className="text-[12.5px]" style={{ color: 'var(--fg-3)' }}>
                    Disponível para novos projetos
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
                      Ver projetos reais
                    </a>
                  </div>
                  <button
                    type="button"
                    onClick={() => setRecruiterMode(true)}
                    className="glass px-6 py-3.5 rounded-2xl font-semibold text-[15px]"
                  >
                    Modo recrutador
                  </button>
                </div>
                <p className="mt-6 text-xs" style={{ color: 'var(--fg-4)' }}>
                  Clique nas cartas ao lado — a de cima vai pro fim da pilha, qualquer outra vem pra frente.
                </p>
              </motion.div>

              <CardStack />
            </div>
          </div>

          <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 mx-6 md:mx-16" style={{ borderTop: '1px solid var(--border-1)' }}>
            {STATS.map((stat, i) => (
              <div
                key={stat.label}
                className="py-6 px-4 md:px-6 flex gap-3.5 items-start"
                style={i < STATS.length - 1 ? { borderRight: '1px solid var(--border-1)' } : undefined}
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
              aria-label="Rolar para a próxima seção"
              onClick={() => document.getElementById('marquee')?.scrollIntoView({ behavior: 'smooth' })}
              className="animate-bob glass w-9 h-9 rounded-full flex items-center justify-center hover:bg-[var(--surface-2)] transition-colors"
              style={{ color: 'var(--fg-4)' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none">
                <path d="M12 5v14M5 12l7 7 7-7" />
              </svg>
            </button>
          </div>
        </>
      ) : (
        <div className="relative z-10 flex-1 flex items-center justify-center px-6 py-16">
          <div className="glass-strong w-full max-w-2xl rounded-[28px] p-10 md:p-12">
            <div className="text-[11px] uppercase tracking-wider mb-3.5" style={{ color: 'var(--fg-4)' }}>
              Resumo rápido
            </div>
            <div className="text-3xl md:text-[34px] font-extrabold mb-1.5">Ricardo A. Gonçalves</div>
            <div className="text-[15.5px] mb-7" style={{ color: 'var(--fg-2)' }}>
              Full Stack &amp; IA — Sorocaba, SP
            </div>
            <ul className="flex flex-col gap-4 mb-8">
              {RECRUITER_BULLETS.map((bullet) => (
                <li key={bullet} className="flex gap-2.5 items-start">
                  <span className="w-1.5 h-1.5 mt-2 rounded-full flex-shrink-0" style={{ background: 'var(--accent)' }} />
                  <span className="text-[14.5px] leading-relaxed" style={{ color: 'var(--fg-2)' }}>
                    {bullet}
                  </span>
                </li>
              ))}
            </ul>
            <div className="flex gap-3">
              <a
                href="mailto:OrlaEK@proton.me"
                className="px-6 py-3 rounded-xl font-semibold text-sm"
                style={{ background: 'var(--accent)', color: 'var(--accent-text)' }}
              >
                Enviar e-mail
              </a>
              <button type="button" onClick={() => setRecruiterMode(false)} className="glass px-6 py-3 rounded-xl font-semibold text-sm">
                Voltar ao normal
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
