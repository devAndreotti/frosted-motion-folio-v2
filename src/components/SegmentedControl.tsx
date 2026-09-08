import { motion } from 'framer-motion';

interface SegmentedControlOption<T extends string> {
  value: T;
  label: string;
}

interface SegmentedControlProps<T extends string> {
  options: SegmentedControlOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Must be unique among any other SegmentedControl mounted on the page at once. */
  layoutId: string;
  /**
   * For option sets whose combined width can't fit one non-wrapping pill on
   * narrow screens (e.g. 5 variable-width labels) -- scrolls horizontally
   * instead of wrapping to a second line, same as iOS's own segmented
   * controls with many options (Settings, Apple Music).
   */
  scrollable?: boolean;
}

/** Pill-shaped exclusive-choice control with a spring-animated sliding highlight (Framer Motion shared layout animation, no manual position math). */
const SegmentedControl = <T extends string>({ options, value, onChange, layoutId, scrollable }: SegmentedControlProps<T>) => (
  <div className={`glass flex gap-1 p-1.5 rounded-full ${scrollable ? 'overflow-x-auto flex-nowrap' : ''}`}>
    {options.map((option) => {
      const active = option.value === value;
      return (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          aria-pressed={active}
          className="relative px-4 py-2 text-[12.5px] font-semibold whitespace-nowrap flex-shrink-0"
          style={{ color: active ? 'var(--accent-text)' : 'var(--fg-3)' }}
        >
          {active && (
            <motion.div
              layoutId={layoutId}
              className="absolute inset-0 rounded-full -z-10"
              style={{ background: 'var(--accent)' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            />
          )}
          {option.label}
        </button>
      );
    })}
  </div>
);

export default SegmentedControl;
