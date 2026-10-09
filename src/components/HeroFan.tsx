import { useRef } from 'react';
import { arcOffset, fanDim, fanOpacity, fanRole, fanZ } from '@/lib/cardFan';
import { useCardFan } from '@/hooks/useCardFan';
import { useInView } from '@/hooks/useInView';
import { CardNav, CardText, type HeroCard } from './HeroCardParts';

/**
 * Wide screens: the cards open in a fan with the active one standing in the
 * middle. Each turn is choreographed (see FanRole): the arriving card lifts
 * and catches the light, the one leaving swings aside, and the card that
 * changes ends goes round the back instead of crossing the fan.
 */
const HeroFan = ({ cards }: { cards: HeroCard[] }) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const inView = useInView(rootRef);
  const n = cards.length;
  const fan = useCardFan(n, undefined, !inView);
  const ab = fan.n % 2 ? 'a' : 'b';

  return (
    <div className="hc-w" ref={rootRef}>
      <div className="fan">
        {cards.map((card, i) => {
          const off = arcOffset(i, fan.active, n);
          const was = arcOffset(i, fan.from, n);
          const role = fan.n > 0 ? ` ${fanRole(off, was)}-${ab}` : '';
          // The transforms are built in hero-cards.css from these offsets, so each breakpoint can size the arc.
          const style = {
            '--o': off,
            '--a': Math.abs(off),
            '--o0': was,
            '--a0': Math.abs(was),
            '--sw': `${off > 0 ? 4 : -4}deg`,
            '--pan': `${fan.dir > 0 ? 9 : -9}%`,
            '--op0': fanOpacity(was),
            '--op1': fanOpacity(off),
            opacity: fanOpacity(off),
            zIndex: fanZ(off),
            filter: fanDim(off),
          } as React.CSSProperties;

          return (
            <button
              key={card.id}
              type="button"
              onClick={() => fan.pick(i)}
              className={`fan-card${card.me ? ' me' : ''}${off === 0 ? ' on' : ''}${role}`}
              style={style}
            >
              <span className="fan-img">
                <img src={card.img} alt="" draggable={false} />
              </span>
              <span className="fan-b">
                <CardText card={card} />
              </span>
              <span className="sheen" />
            </button>
          );
        })}
      </div>

      <CardNav onPrev={fan.prev} onNext={fan.next}>
        <span className="dots" aria-hidden="true">
          {cards.map((card, i) => (
            <i key={card.id} className={i === fan.active ? 'on' : undefined} />
          ))}
        </span>
      </CardNav>
    </div>
  );
};

export default HeroFan;
