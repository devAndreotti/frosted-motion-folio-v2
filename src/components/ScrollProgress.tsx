import { useEffect, useState } from 'react';

/** Thin accent-colored bar across the very top of the page, filling with scroll progress. */
const ScrollProgress = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      setProgress(max > 0 ? Math.min(1, doc.scrollTop / max) : 0);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-[51] h-[2.5px] pointer-events-none" aria-hidden="true">
      <div className="h-full" style={{ width: `${progress * 100}%`, background: 'var(--accent)', transition: 'width 100ms linear' }} />
    </div>
  );
};

export default ScrollProgress;
