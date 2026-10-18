import { useEffect, useRef, useState } from 'react';
import type { UsesItem, UsesLang, UsesStrings } from '@/data/uses';
import UsesCard from './UsesCard';

export interface UsesCardData {
  key: string;
  item: UsesItem;
  /** Set only when the tab covers more than one category: the card then names its category. */
  categoryLabel: string | null;
}

/** A horizontal rail of cards with snap, prev/next buttons and position dots. The dots follow the scroll position. */
const UsesCarousel = ({ cards, lang, strings }: { cards: UsesCardData[]; lang: UsesLang; strings: UsesStrings }) => {
  const trackRef = useRef<HTMLUListElement>(null);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return undefined;
    let frame = 0;
    // The card nearest the left edge of the rail is the current one.
    const measure = () => {
      frame = 0;
      const left = track.getBoundingClientRect().left;
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
    track.addEventListener('scroll', onScroll, { passive: true });
    measure();
    return () => {
      track.removeEventListener('scroll', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [cards.length]);

  const step = (direction: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    const target = Math.min(cards.length - 1, Math.max(0, index + direction));
    const card = track.children[target] as HTMLElement | undefined;
    // scrollIntoView follows the CSS scroll-behavior, so reduced motion gets an instant jump.
    card?.scrollIntoView?.({ block: 'nearest', inline: 'start' });
  };

  return (
    <div className="us-carousel">
      <ul ref={trackRef} className="us-track" tabIndex={0}>
        {cards.map((card) => (
          <UsesCard key={card.key} card={card} lang={lang} strings={strings} />
        ))}
      </ul>
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
