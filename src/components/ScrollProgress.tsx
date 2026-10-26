import { motion, useScroll } from 'framer-motion';

/** Thin accent-colored bar across the very top of the page, filling with scroll progress. */
const ScrollProgress = () => {
  const { scrollYProgress } = useScroll();

  return (
    <div className="fixed top-0 left-0 right-0 z-[51] h-[2.5px] pointer-events-none" aria-hidden="true">
      <motion.div
        className="h-full w-full origin-left"
        style={{ scaleX: scrollYProgress, background: 'var(--accent)' }}
      />
    </div>
  );
};

export default ScrollProgress;
