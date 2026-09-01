import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const STOPS = [
  { year: '2021', title: 'Curso técnico', desc: 'Primeiro contato com programação, HTML e CSS.' },
  { year: '2023', title: 'Faculdade', desc: 'Início em Ciência da Computação — UNIP.' },
  { year: '2024', title: 'Primeiros projetos reais', desc: 'Freelas, vibe coding e os primeiros repositórios publicados.' },
  { year: 'Hoje', title: 'Full Stack & IA aplicada', desc: 'React, Node.js, automação e produtos com propósito real.' },
];

const STEP = 328;
const MAX_OFFSET = -(STEP * (STOPS.length - 1));

/** Horizontal, arrow-navigable timeline of the author's career milestones. */
const Timeline = () => {
  const [offset, setOffset] = useState(0);

  const go = (delta: number) => setOffset((prev) => Math.max(MAX_OFFSET, Math.min(0, prev + delta)));

  return (
    <section id="timeline" className="relative py-16 md:py-20 overflow-hidden">
      <div
        className="absolute -top-36 left-[30%] w-[520px] h-[520px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(var(--accent-rgb), 0.1) 0%, transparent 70%)' }}
      />

      <div className="relative z-10 container mx-auto px-4 flex items-end justify-between mb-9 flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            <span className="w-7 h-0.5" style={{ background: 'var(--accent)' }} />
            <span className="text-xs uppercase tracking-wider" style={{ color: 'var(--fg-4)' }}>
              Trajetória
            </span>
          </div>
          <h2 className="text-2xl md:text-[30px] font-extrabold">Como cheguei até aqui</h2>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            aria-label="Marco anterior"
            onClick={() => go(STEP)}
            className="glass w-9 h-9 rounded-full flex items-center justify-center hover:bg-[var(--surface-2)] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            aria-label="Próximo marco"
            onClick={() => go(-STEP)}
            className="glass w-9 h-9 rounded-full flex items-center justify-center hover:bg-[var(--surface-2)] transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="relative z-10 container mx-auto px-4 overflow-hidden pb-2">
        <div className="absolute top-[34px] left-4 right-4" style={{ height: 1, background: 'var(--border-1)' }} />
        <div className="flex gap-7" style={{ transform: `translateX(${offset}px)`, transition: 'transform 500ms cubic-bezier(0.22,1,0.36,1)' }}>
          {STOPS.map((stop) => (
            <div key={stop.year} className="w-[300px] flex-shrink-0">
              <div
                className="w-3.5 h-3.5 rounded-full mb-5"
                style={{ background: 'var(--accent)', border: '3px solid var(--bg)', boxShadow: '0 0 0 1px var(--border-1)' }}
              />
              <div className="glass rounded-2xl p-5">
                <div className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: 'var(--accent)' }}>
                  {stop.year}
                </div>
                <div className="text-[17px] font-extrabold mb-2">{stop.title}</div>
                <div className="text-[13.5px] leading-relaxed" style={{ color: 'var(--fg-3)' }}>
                  {stop.desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Timeline;
