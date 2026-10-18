import { useEffect, useRef, useState } from 'react';
import type { UsesItem, UsesLang, UsesStrings } from '@/data/uses';
import { useHorizontalDragScroll } from '@/hooks/useHorizontalDragScroll';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { edgeFadeProps, useScrollEdges } from '@/hooks/useScrollEdges';
import UsesCard from './UsesCard';

export interface UsesCardData {
  key: string;
  item: UsesItem;
  /** Set only when the tab covers more than one category: the card then names its category. */
  categoryLabel: string | null;
}

/**
 * A horizontal rail of cards, dragged with the mouse or finger (the same drag and release inertia as the
 * Skills rail). The scrollbar is hidden, the edges fade where cards are hidden, and prev/next and the
 * position dots sit on their own line below. Reduced motion turns the inertia and the smooth jumps off.
 */
const UsesCarousel = ({ cards, lang, strings }: { cards: UsesCardData[]; lang: UsesLang; strings: UsesStrings }) => {
  const reduced = useMediaQuery('(prefers-reduced-motion: reduce)');
  const drag = useHorizontalDragScroll({ redirectWheel: false, dragFactor: 1, inertia: !reduced });
  const { edges } = useScrollEdges(drag.containerRef);
  const railRef = drag.containerRef;
  const trackRef = useRef<HTMLUListElement>(null);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const rail = railRef.current;
    const track = trackRef.current;
    if (!rail || !track) return undefined;
    let frame = 0;
    // The card nearest the left edge of the rail is the current one.
    const measure = () => {
      frame = 0;
      const left = rail.getBoundingClientRect().left;
      let best = 0;
      let bestDistance = Infinity;
      Array.from(track.children).forEach((child, position) => {
        const distance = Math.abs(child.getBoundingClientRect().left - left);
        if (distance < bestDistance) {
          bestDistance = distance;
          best = position;
        }
      });
      setIndex(best);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    rail.addEventListener('scroll', onScroll, { passive: true });
    measure();
    return () => {
      rail.removeEventListener('scroll', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [cards.length, railRef]);

  const step = (direction: 1 | -1) => {
    const rail = railRef.current;
    const track = trackRef.current;
    if (!rail || !track) return;
    const target = Math.min(cards.length - 1, Math.max(0, index + direction));
    const card = track.children[target] as HTMLElement | undefined;
    if (!card) return;
    // Put the card at the rail's left edge. The rail has no CSS smooth scrolling (it would fight the drag), so the jump is explicit.
    const left = card.getBoundingClientRect().left - rail.getBoundingClientRect().left + rail.scrollLeft;
    if (typeof rail.scrollTo === 'function') rail.scrollTo({ left, behavior: reduced ? 'auto' : 'smooth' });
    else rail.scrollLeft = left;
  };

  return (
    <div className="us-carousel">
      <div
        ref={drag.containerRef}
        className={`us-rail edge-fade${drag.isDragging ? ' drag' : ''}`}
        tabIndex={0}
        {...drag.handlers}
        {...edgeFadeProps(edges)}
      >
        <ul ref={trackRef} className="us-track">
          {cards.map((card) => (
            <UsesCard key={card.key} card={card} lang={lang} strings={strings} />
          ))}
        </ul>
      </div>
      <div className="us-bar">
        <span className="us-dots" aria-hidden="true">
          {cards.map((card, position) => (
            <span key={card.key} className={position === index ? 'us-dot on' : 'us-dot'} />
          ))}
        </span>
        <div className="us-arrows">
          <button type="button" aria-label={strings.prev} onClick={() => step(-1)}>
            ←
          </button>
          <button type="button" aria-label={strings.next} onClick={() => step(1)}>
            →
          </button>
        </div>
      </div>
    </div>
  );
};

export default UsesCarousel;
