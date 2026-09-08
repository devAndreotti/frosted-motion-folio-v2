import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, useMotionValue, useVelocity, useTransform, useSpring, animate, type MotionValue } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';

const STEP = 328;
const NAV_SPRING = { type: 'spring', stiffness: 260, damping: 22, bounce: 0.35 } as const;

const DOT_SIZE = 14; // px — must match the dot's w-3.5 h-3.5 below
const ROW_TOP_PADDING = 12; // px — must match the row wrapper's pt-3
// The rail has to run through the dot's vertical center, not a guessed
// offset — that's what left it floating above the dots before.
const RAIL_TOP = ROW_TOP_PADDING + DOT_SIZE / 2;

interface Stop {
  year: string;
  title: string;
  desc: string;
}

// Each card gets a slightly different sway strength so the row reads like
// separate items hanging on a line, not one rigid plank rotating together.
const SWAY_PHASES = [0.85, 1.15, 0.95, 1.1, 0.9, 1.05];
// ...and a resting tilt of its own, all sagging the same way (pinned at one
// corner, drooping under its own weight) so the row reads as unevenly hung
// before you ever touch it, not just during a drag.
const BASE_TILT_DEG = [4, 7, 5, 8, 4.5, 6.5];
// The pin sits inset from the card's edge -- flush with the corner it looks
// like it's floating off the rounded curve instead of resting on the card.
const PIN_INSET_X = 20; // px, matches the card's own p-5 so it lines up with the year label
const PIN_ORIGIN = `${PIN_INSET_X + DOT_SIZE / 2}px ${DOT_SIZE / 2}px`;

const TimelineCard = ({ stop, velocity, phase, baseTilt }: { stop: Stop; velocity: MotionValue<number>; phase: number; baseTilt: number }) => {
  const rawRotate = useTransform(velocity, [-1800, 0, 1800], [baseTilt - 9 * phase, baseTilt, baseTilt + 9 * phase]);
  const rotate = useSpring(rawRotate, { stiffness: 260, damping: 18 });

  return (
    <div className="relative w-[300px] flex-shrink-0">
      {/* The pin: fixed on the rail, sitting over the card's surface near
          the top-left. It never rotates or moves -- only the card hanging
          off it sways, same as a real pin holding a swinging photo. */}
      <div
        className="absolute top-0 z-10 rounded-full"
        style={{
          left: PIN_INSET_X,
          width: DOT_SIZE,
          height: DOT_SIZE,
          background: 'var(--accent)',
          border: '3px solid var(--surface-2)',
          boxShadow: '0 0 0 1px var(--border-1)',
        }}
      />
      <motion.div className="glass rounded-2xl p-5" style={{ rotateZ: rotate, transformPerspective: 700, transformOrigin: PIN_ORIGIN }} whileTap={{ scale: 0.96 }}>
        <div className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: 'var(--accent)' }}>
          {stop.year}
        </div>
        <div className="text-[17px] font-extrabold mb-2">{stop.title}</div>
        <div className="text-[13.5px] leading-relaxed" style={{ color: 'var(--fg-3)' }}>
          {stop.desc}
        </div>
      </motion.div>
    </div>
  );
};

/** Horizontal timeline of career milestones — drag it like a clothesline (cards sway with your fling), or use the arrows for a springy bounce between stops. */
const Timeline = () => {
  const { t } = useLanguage();
  const x = useMotionValue(0);
  const velocity = useVelocity(x);
  const maxOffset = -(STEP * (t.timeline.stops.length - 1));

  const go = (delta: number) => {
    const next = Math.max(maxOffset, Math.min(0, x.get() + delta));
    animate(x, next, NAV_SPRING);
  };

  return (
    <section id="timeline" className="relative py-16 md:py-24 overflow-hidden">
      <div
        className="absolute -top-36 left-[30%] w-[240px] h-[240px] sm:w-[360px] sm:h-[360px] md:w-[520px] md:h-[520px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgb(var(--accent-rgb) / 0.06) 0%, transparent 70%)' }}
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

      <div className="relative z-10 container mx-auto px-4 overflow-hidden pb-8" style={{ perspective: 1000, paddingTop: ROW_TOP_PADDING }}>
        <div className="absolute left-4 right-4" style={{ top: RAIL_TOP, height: 1, background: 'var(--border-1)' }} />
        <motion.div
          className="flex gap-7 cursor-grab active:cursor-grabbing"
          style={{ x }}
          drag="x"
          dragConstraints={{ left: maxOffset, right: 0 }}
          dragElastic={0.15}
          dragTransition={{ bounceStiffness: 300, bounceDamping: 22 }}
        >
          {t.timeline.stops.map((stop, i) => (
            <TimelineCard
              key={stop.year}
              stop={stop}
              velocity={velocity}
              phase={SWAY_PHASES[i % SWAY_PHASES.length]}
              baseTilt={BASE_TILT_DEG[i % BASE_TILT_DEG.length]}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Timeline;
