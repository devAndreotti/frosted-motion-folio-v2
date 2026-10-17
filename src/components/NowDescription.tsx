import { useId, useLayoutEffect, useRef, useState, type MouseEvent } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

/** Before the text can be measured (no layout, e.g. jsdom), a text this long is taken to run past four lines. */
const FALLBACK_CHARS = 220;

/**
 * A project card's description, cut to four lines by CSS. The "ler mais" button shows only when the cut
 * really hides text (measured); it sits inside the card, which may be a link or a button, so its click
 * never reaches the card.
 */
const NowDescription = ({ text }: { text: string }) => {
  const { t } = useLanguage();
  const id = useId();
  const ref = useRef<HTMLSpanElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [overflows, setOverflows] = useState(text.length > FALLBACK_CHARS);

  // Only measured while collapsed: the clamp is off when expanded, so the last answer is kept then.
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || expanded) return;
    const measure = () => {
      if (el.scrollHeight || el.clientHeight) setOverflows(el.scrollHeight > el.clientHeight + 1);
    };
    measure();
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure);
    observer?.observe(el);
    return () => observer?.disconnect();
  }, [expanded, text]);

  const toggle = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setExpanded((v) => !v);
  };

  return (
    <>
      <span id={id} ref={ref} className={`nc-d${expanded ? ' open' : ''}`}>
        {text}
      </span>
      {(overflows || expanded) && (
        <button type="button" className="nc-more" aria-expanded={expanded} aria-controls={id} onClick={toggle}>
          {expanded ? t.now.readLess : t.now.readMore}
        </button>
      )}
    </>
  );
};

export default NowDescription;
