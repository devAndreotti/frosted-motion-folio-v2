import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

type CatKey = 'lang' | 'frontend' | 'backend' | 'data' | 'tool' | 'automation';

interface StackItem {
  name: string;
  cat: CatKey;
  mono: string;
  tint: string;
}

const ROW_A: StackItem[] = [
  { name: 'JavaScript', cat: 'lang', mono: 'JS', tint: '#eab308' },
  { name: 'TypeScript', cat: 'lang', mono: 'TS', tint: '#3b82f6' },
  { name: 'Python', cat: 'lang', mono: 'Py', tint: '#22c55e' },
  { name: 'React', cat: 'frontend', mono: 'R', tint: '#0ea5e9' },
  { name: 'Tailwind CSS', cat: 'frontend', mono: 'TW', tint: '#06b6d4' },
  { name: 'Vite', cat: 'frontend', mono: 'V', tint: '#a855f7' },
];

const ROW_B: StackItem[] = [
  { name: 'Node.js', cat: 'backend', mono: 'N', tint: '#22c55e' },
  { name: 'Supabase', cat: 'data', mono: 'Sb', tint: '#10b981' },
  { name: 'PostgreSQL', cat: 'data', mono: 'Pg', tint: '#3b82f6' },
  { name: 'Git', cat: 'tool', mono: 'Gt', tint: '#f97316' },
  { name: 'n8n', cat: 'automation', mono: 'n8', tint: '#ef4444' },
  { name: 'Power BI', cat: 'data', mono: 'BI', tint: '#eab308' },
];

const BOOST_MS = 2500;
const BASE_DURATION_S = 34;
const BOOST_DURATION_S = 7;

const Tile = ({ item }: { item: StackItem }) => {
  const { t } = useLanguage();
  return (
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
          {t.marquee.catLabels[item.cat]}
        </div>
      </div>
    </div>
  );
};

// JS/rAF-driven instead of a CSS keyframe animation: a plain CSS animation
// can't change speed without jumping (the browser reinterprets elapsed-time
// as a fraction of the new duration, snapping the track to a different
// position). Tracking a persistent offset ourselves means "boost" only ever
// changes how fast the offset grows from here — never where it currently is.
const Row = ({ items, direction, boosted }: { items: StackItem[]; direction: 'left' | 'right'; boosted: boolean }) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);
  const pausedRef = useRef(false);
  const boostedRef = useRef(boosted);
  boostedRef.current = boosted;

  useEffect(() => {
    let raf = 0;
    let last = performance.now();

    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      const track = trackRef.current;
      if (track) {
        const half = track.scrollWidth / 2;
        if (!pausedRef.current && half > 0) {
          const speed = half / (boostedRef.current ? BOOST_DURATION_S : BASE_DURATION_S);
          progressRef.current = (progressRef.current + speed * dt) % half;
        }
        const x = direction === 'left' ? -progressRef.current : -half + progressRef.current;
        track.style.transform = `translateX(${x}px)`;
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [direction]);

  return (
    <div
      className="relative w-full overflow-x-hidden py-2"
      style={{
        maskImage: 'linear-gradient(90deg, transparent 0, #000 64px, #000 calc(100% - 64px), transparent 100%)',
        WebkitMaskImage: 'linear-gradient(90deg, transparent 0, #000 64px, #000 calc(100% - 64px), transparent 100%)',
      }}
      onMouseEnter={() => { pausedRef.current = true; }}
      onMouseLeave={() => { pausedRef.current = false; }}
    >
      <div ref={trackRef} data-testid="marquee-track" className="flex items-center gap-4 w-max">
        {[...items, ...items].map((item, i) => (
          <Tile key={`${item.name}-${i}`} item={item} />
        ))}
      </div>
    </div>
  );
};

/** Two-row infinite stack ticker — click anywhere to briefly speed it up, hover a lane to pause it. */
const Marquee = () => {
  const { t } = useLanguage();
  const [boosted, setBoosted] = useState(false);

  const handleBoost = () => {
    setBoosted(true);
    setTimeout(() => setBoosted(false), BOOST_MS);
  };

  return (
    <section id="marquee" className="relative py-14 overflow-hidden" aria-label={t.marquee.ariaLabel}>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(var(--accent-rgb), 0.05) 0%, transparent 60%)' }}
      />

      <div className="relative z-10 px-6 md:px-16 flex items-end justify-between gap-4 flex-wrap mb-7">
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            <span className="w-7 h-0.5" style={{ background: 'var(--accent)' }} />
            <span className="text-xs uppercase tracking-wider" style={{ color: 'var(--fg-4)' }}>
              {t.marquee.sectionLabel}
            </span>
          </div>
          <h2 className="text-2xl md:text-[27px] font-extrabold">{t.marquee.title}</h2>
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
          {t.marquee.boostBtn}
        </button>
      </div>

      <div className="relative z-10 flex flex-col gap-2">
        <Row items={ROW_A} direction="left" boosted={boosted} />
        <Row items={ROW_B} direction="right" boosted={boosted} />
      </div>
    </section>
  );
};

export default Marquee;
