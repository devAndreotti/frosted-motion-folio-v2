import { useEffect, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useHorizontalDragScroll } from '@/hooks/useHorizontalDragScroll';

type CatKey = 'lang' | 'frontend' | 'backend' | 'data' | 'tool' | 'automation';

interface StackItem {
  name: string;
  cat: CatKey;
  mono: string;
  tint: string;
}

export const TOOLS: StackItem[] = [
  { name: 'React', cat: 'frontend', mono: 'R', tint: '#0e7490' },
  { name: 'TypeScript', cat: 'lang', mono: 'TS', tint: '#1d4ed8' },
  { name: 'JavaScript', cat: 'lang', mono: 'JS', tint: '#854d0e' },
  { name: 'Node.js', cat: 'backend', mono: 'N', tint: '#15803d' },
  { name: 'Tailwind CSS', cat: 'frontend', mono: 'TW', tint: '#0f766e' },
  { name: 'Vite', cat: 'tool', mono: 'V', tint: '#7e22ce' },
  { name: 'Supabase', cat: 'data', mono: 'Sb', tint: '#047857' },
  { name: 'PostgreSQL', cat: 'data', mono: 'Pg', tint: '#1e40af' },
  { name: 'Python', cat: 'lang', mono: 'Py', tint: '#a16207' },
  { name: 'n8n', cat: 'automation', mono: 'n8', tint: '#b91c1c' },
  { name: 'Git', cat: 'tool', mono: 'Gt', tint: '#c2410c' },
  { name: 'Power BI', cat: 'data', mono: 'BI', tint: '#854d0e' },
];

const BASE_DURATION_S = 50;
const BOOST_DURATION_S = 14;

/**
 * Infinite ticker of the tools I use. JS/rAF-driven instead of a CSS
 * keyframe animation: a CSS animation can't change speed without jumping
 * (the browser reinterprets elapsed time as a fraction of the new duration),
 * while tracking scrollLeft ourselves means "boost" only changes how fast it
 * moves from here. The row is a real scroll container (useHorizontalDragScroll)
 * so it can also be grabbed and flung; the tick skips frames while a drag or
 * its inertia is in control, so the two never fight over scrollLeft.
 */
const Marquee = ({ boosted }: { boosted: boolean }) => {
  const { t } = useLanguage();
  const { containerRef, handlers, isInteracting } = useHorizontalDragScroll({ redirectWheel: false });
  const boostedRef = useRef(boosted);
  boostedRef.current = boosted;
  const pausedRef = useRef(false);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();

    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      const container = containerRef.current;
      const half = container ? container.scrollWidth / 2 : 0;
      if (container && half > 0 && !isInteracting() && !pausedRef.current) {
        const speed = half / (boostedRef.current ? BOOST_DURATION_S : BASE_DURATION_S);
        // True modulo so a huge one-frame dt (a throttled tab resuming) still wraps.
        const next = container.scrollLeft + speed * dt;
        container.scrollLeft = ((next % half) + half) % half;
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // containerRef/isInteracting are stable refs from the hook.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={containerRef}
      {...handlers}
      data-testid="marquee-track"
      className="mq cursor-grab active:cursor-grabbing"
      style={{ touchAction: 'pan-y', overscrollBehaviorX: 'contain' }}
      aria-label={t.marquee.ariaLabel}
      role="region"
      onMouseEnter={() => (pausedRef.current = true)}
      onMouseLeave={() => (pausedRef.current = false)}
    >
      <div className="mq-g">
        {[...TOOLS, ...TOOLS].map((item, i) => (
          <div key={`${item.name}-${i}`} className="tool" aria-hidden={i >= TOOLS.length || undefined}>
            <span className="bdg" style={{ background: item.tint }}>
              {item.mono}
            </span>
            <span>
              <span className="tool-n">{item.name}</span>
              <span className="tool-k">{t.marquee.catLabels[item.cat]}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Marquee;
