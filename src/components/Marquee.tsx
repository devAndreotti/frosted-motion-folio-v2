import { useState } from 'react';

interface StackItem {
  name: string;
  cat: string;
  mono: string;
  tint: string;
}

const ROW_A: StackItem[] = [
  { name: 'JavaScript', cat: 'Linguagem', mono: 'JS', tint: '#eab308' },
  { name: 'TypeScript', cat: 'Linguagem', mono: 'TS', tint: '#3b82f6' },
  { name: 'Python', cat: 'Linguagem', mono: 'Py', tint: '#22c55e' },
  { name: 'React', cat: 'Frontend', mono: 'R', tint: '#0ea5e9' },
  { name: 'Tailwind CSS', cat: 'Frontend', mono: 'TW', tint: '#06b6d4' },
  { name: 'Vite', cat: 'Frontend', mono: 'V', tint: '#a855f7' },
];

const ROW_B: StackItem[] = [
  { name: 'Node.js', cat: 'Backend', mono: 'N', tint: '#22c55e' },
  { name: 'Supabase', cat: 'Dados', mono: 'Sb', tint: '#10b981' },
  { name: 'PostgreSQL', cat: 'Dados', mono: 'Pg', tint: '#3b82f6' },
  { name: 'Git', cat: 'Ferramenta', mono: 'Gt', tint: '#f97316' },
  { name: 'n8n', cat: 'Automação', mono: 'n8', tint: '#ef4444' },
  { name: 'Power BI', cat: 'Dados', mono: 'BI', tint: '#eab308' },
];

const BOOST_MS = 2500;

const Tile = ({ item }: { item: StackItem }) => (
  <div
    className="glass flex-shrink-0 flex items-center gap-3 pl-3 pr-5 py-3 rounded-2xl transition-all duration-200 hover:-translate-y-1 hover:scale-[1.03] hover:shadow-[0_12px_32px_-8px_var(--glow)]"
    style={{ ['--glow' as string]: `${item.tint}44`, borderColor: undefined }}
    onMouseEnter={(e) => (e.currentTarget.style.borderColor = item.tint)}
    onMouseLeave={(e) => (e.currentTarget.style.borderColor = '')}
  >
    <div
      className="w-[38px] h-[38px] rounded-xl flex items-center justify-center text-[13px] font-extrabold flex-shrink-0"
      style={{ background: `linear-gradient(155deg, ${item.tint}, ${item.tint}99)`, boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.3)' }}
    >
      {item.mono}
    </div>
    <div>
      <div className="text-[14.5px] font-bold whitespace-nowrap">{item.name}</div>
      <div className="text-[10.5px] uppercase tracking-wide" style={{ color: 'var(--fg-4)' }}>
        {item.cat}
      </div>
    </div>
  </div>
);

const Row = ({ items, direction, boosted }: { items: StackItem[]; direction: 'left' | 'right'; boosted: boolean }) => (
  <div
    className="relative w-full overflow-hidden"
    style={{
      maskImage: 'linear-gradient(90deg, transparent 0, #000 64px, #000 calc(100% - 64px), transparent 100%)',
      WebkitMaskImage: 'linear-gradient(90deg, transparent 0, #000 64px, #000 calc(100% - 64px), transparent 100%)',
    }}
  >
    <div className={`flex items-center gap-4 w-max ${direction === 'left' ? 'animate-marquee-left' : 'animate-marquee-right'} ${boosted ? 'marquee-boosted' : ''}`}>
      {[...items, ...items].map((item, i) => (
        <Tile key={`${item.name}-${i}`} item={item} />
      ))}
    </div>
  </div>
);

/** Two-row infinite stack ticker — click anywhere to briefly speed it up, hover a lane to pause it. */
const Marquee = () => {
  const [boosted, setBoosted] = useState(false);

  const handleBoost = () => {
    setBoosted(true);
    setTimeout(() => setBoosted(false), BOOST_MS);
  };

  return (
    <section id="marquee" className="relative py-14 overflow-hidden" aria-label="Stack e ferramentas">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(var(--accent-rgb), 0.05) 0%, transparent 60%)' }}
      />

      <div className="relative z-10 px-6 md:px-16 flex items-end justify-between gap-4 flex-wrap mb-7">
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            <span className="w-7 h-0.5" style={{ background: 'var(--accent)' }} />
            <span className="text-xs uppercase tracking-wider" style={{ color: 'var(--fg-4)' }}>
              Stack &amp; ferramentas
            </span>
          </div>
          <h2 className="text-2xl md:text-[27px] font-extrabold">O que eu uso pra construir</h2>
        </div>
        <button
          type="button"
          onClick={handleBoost}
          className="glass flex items-center gap-2 px-3.5 py-2.5 rounded-full text-xs"
          style={{ color: 'var(--fg-3)' }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5">
            <path d="M13 2 3 14h7l-1 8 10-12h-7l1-8Z" />
          </svg>
          clique pra acelerar
        </button>
      </div>

      <div className="relative z-10 flex flex-col gap-4 group/lane">
        <div className="[&:hover_.animate-marquee-left]:[animation-play-state:paused]">
          <Row items={ROW_A} direction="left" boosted={boosted} />
        </div>
        <div className="[&:hover_.animate-marquee-right]:[animation-play-state:paused]">
          <Row items={ROW_B} direction="right" boosted={boosted} />
        </div>
      </div>
    </section>
  );
};

export default Marquee;
