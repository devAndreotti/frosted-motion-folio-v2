import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const STEP = 328;

/** Horizontal, arrow-navigable timeline of the author's career milestones. */
const Timeline = () => {
  const { t } = useLanguage();
  const [offset, setOffset] = useState(0);
  const maxOffset = -(STEP * (t.timeline.stops.length - 1));

  const go = (delta: number) => setOffset((prev) => Math.max(maxOffset, Math.min(0, prev + delta)));

  return (
    <section id="timeline" className="relative py-16 md:py-20 overflow-hidden">
      <div
        className="absolute -top-36 left-[30%] w-[520px] h-[520px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(var(--accent-rgb), 0.06) 0%, transparent 70%)' }}
      />

      <div className="relative z-10 container mx-auto px-4 flex items-end justify-between mb-9 flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            <span className="w-7 h-0.5" style={{ background: 'var(--accent)' }} />
            <span className="text-xs uppercase tracking-wider" style={{ color: 'var(--fg-4)' }}>
              {t.timeline.sectionLabel}
            </span>
          </div>
          <h2 className="text-2xl md:text-[30px] font-extrabold">{t.timeline.title}</h2>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            aria-label={t.timeline.prevAria}
            onClick={() => go(STEP)}
            className="glass w-9 h-9 rounded-full flex items-center justify-center hover:bg-[var(--surface-2)] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            aria-label={t.timeline.nextAria}
            onClick={() => go(-STEP)}
            className="glass w-9 h-9 rounded-full flex items-center justify-center hover:bg-[var(--surface-2)] transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="relative z-10 container mx-auto px-4 overflow-hidden pb-2">
        <div className="absolute top-[7px] left-4 right-4" style={{ height: 1, background: 'var(--border-1)' }} />
        <div className="flex gap-7" style={{ transform: `translateX(${offset}px)`, transition: 'transform 500ms cubic-bezier(0.22,1,0.36,1)' }}>
          {t.timeline.stops.map((stop) => (
            <div key={stop.year} className="w-[300px] flex-shrink-0">
              <div
                className="w-3.5 h-3.5 rounded-full mb-5"
                style={{ background: 'var(--accent)', border: '3px solid var(--surface-2)', boxShadow: '0 0 0 1px var(--border-1)' }}
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
