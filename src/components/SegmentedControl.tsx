import { motion } from 'framer-motion';

interface SegmentedControlOption<T extends string> {
  value: T;
  label: string;
  /** Optional count shown after the label in mono, e.g. how many items the filter keeps. */
  count?: number;
}

interface SegmentedControlProps<T extends string> {
  options: SegmentedControlOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Must be unique among any other SegmentedControl mounted on the page at once. */
  layoutId: string;
  ariaLabel?: string;
}

/** Glass pill of exclusive choices; the accent highlight slides between them (shared layout animation). Scrolls sideways when it doesn't fit. */
const SegmentedControl = <T extends string>({ options, value, onChange, layoutId, ariaLabel }: SegmentedControlProps<T>) => (
  <div className="seg glass" role="group" aria-label={ariaLabel} style={{ isolation: 'isolate' }}>
    {options.map((option) => {
      const active = option.value === value;
      return (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          aria-pressed={active}
          className={active ? 'on' : undefined}
        >
          {active && <motion.span layoutId={layoutId} className="seg-hl" transition={{ type: 'spring', stiffness: 300, damping: 30 }} />}
          <span>{option.label}</span>
          {option.count != null && <span className="seg-n">{option.count}</span>}
        </button>
      );
    })}
  </div>
);

export default SegmentedControl;
