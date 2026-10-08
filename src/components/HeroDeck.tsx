import { useRef } from 'react';
import { stackDim, stackTransform } from '@/lib/cardStack';
import { DECK_STEP_MS, useCardStack } from '@/hooks/useCardStack';
import { useInView } from '@/hooks/useInView';
import { CardNav, CardText, type HeroCard } from './HeroCardParts';

/**
 * Narrow screens: a deck of full-bleed cards with a glass caption. Click the
 * front card to send it flying to the back, any other to bring it forward;
 * the card that lands in front catches a sweep of light, and the bar under
 * the deck fills up until the next turn.
 */
const HeroDeck = ({ cards }: { cards: HeroCard[] }) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const inView = useInView(rootRef);
  const { order, flight, moves, playing, pick, next, prev } = useCardStack(
    cards.map((card) => card.id),
    DECK_STEP_MS,
    !inView
  );
  const ab = moves % 2 ? 'a' : 'b';

  return (
    <div className="hc-w" ref={rootRef} style={{ '--dur': `${DECK_STEP_MS}ms` } as React.CSSProperties}>
      <div className="dk">
        {/* Fixed DOM order (z-index does the stacking) so a reorder never
            re-inserts nodes, which would cancel their CSS transitions. */}
        {cards.map((card) => {
          const depth = order.indexOf(card.id);
          const transform = stackTransform(depth);
          const flying = flight?.id === card.id ? ` fly-${flight.kind}-${flight.n % 2 ? 'a' : 'b'}` : '';
          const arrive = moves > 0 && depth === 0 ? ` arrive-${ab}` : '';
          const style = {
            transform,
            '--from': flight?.id === card.id ? flight.from : transform,
            '--to': transform,
            zIndex: 100 - depth,
            filter: stackDim(depth),
          } as React.CSSProperties;

          return (
            <button
              key={card.id}
              type="button"
              onClick={() => pick(card.id)}
              aria-label={card.label}
              className={`dk-card${card.me ? ' me' : ''}${flying}${arrive}`}
              style={style}
            >
              <img className="dk-img" src={card.img} alt="" draggable={false} loading={card.me ? undefined : 'lazy'} />
              <span className="dk-scrim" />
              <span className="dk-cap">
                <CardText card={card} />
              </span>
              <span className="sheen" />
            </button>
          );
        })}
      </div>

      <CardNav onPrev={prev} onNext={next}>
        <span className="prog" aria-hidden="true">
          {cards.map((card) => (
            <span key={card.id} className={`prog-s${order[0] === card.id ? (playing ? ` run-${ab}` : ' done') : ''}`}>
              <i />
            </span>
          ))}
        </span>
      </CardNav>
    </div>
  );
};

export default HeroDeck;
