import type { ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

/** One card of the hero fan/deck: the photo, or a project. */
export interface HeroCard {
  id: string;
  /** The photo card: full-bleed portrait, no type chip. */
  me: boolean;
  img: string;
  title: string;
  line: string;
  type: string;
  tint: string;
}

export const CardText = ({ card }: { card: HeroCard }) => (
  <>
    {!card.me && (
      <span className="tc">
        <i style={{ background: card.tint }} />
        <span>{card.type}</span>
      </span>
    )}
    <span className="hc-t">{card.title}</span>
    <span className="hc-s">{card.line}</span>
  </>
);

/** Prev/next arrows around the position indicator (dots for the fan, progress bars for the deck). */
export const CardNav = ({ onPrev, onNext, children }: { onPrev: () => void; onNext: () => void; children: ReactNode }) => {
  const { t } = useLanguage();
  return (
    <div className="hc-nav">
      <button type="button" onClick={onPrev} aria-label={t.header.stackPrev} className="np sq">
        <ChevronLeft className="ic" />
      </button>
      {children}
      <button type="button" onClick={onNext} aria-label={t.header.stackNext} className="np sq">
        <ChevronRight className="ic" />
      </button>
    </div>
  );
};
