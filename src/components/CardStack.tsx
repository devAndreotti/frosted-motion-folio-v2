import { useState } from 'react';
import { personalInfo } from '@/data/personal';
import { featuredProject, curatedProjects } from '@/data/curatedProjects';
import { reorderStack } from '@/lib/cardStack';
import { useLanguage } from '@/contexts/LanguageContext';
import ImageWithSkeleton from './ImageWithSkeleton';

interface StackCard {
  id: string;
  isPhoto?: boolean;
  title?: string;
  desc?: string;
  tags?: string[];
  tint?: string;
  initial?: string;
}

// Five real projects picked for the stack — same curation as the featured
// set in Projects.tsx, so the hero and the projects section tell one story.
// Pulled from curatedProjects (not the raw project list) so the description
// shown here is already localized, reusing the same translated copy.
const STACK_PROJECT_IDS = [26, 9, 2, 5, 1];
const ALL_CURATED = [featuredProject, ...curatedProjects];

function buildStackCards(lang: 'pt' | 'en'): StackCard[] {
  const projectCards = STACK_PROJECT_IDS.map((id) => {
    const project = ALL_CURATED.find((p) => p.id === id)!;
    return {
      id: String(id),
      title: project.title,
      desc: project.description[lang],
      tags: project.technologies.slice(0, 3),
      tint: project.tint,
      initial: project.title.charAt(0),
    };
  });
  return [{ id: 'photo', isPhoto: true }, ...projectCards];
}

/** Clickable stack of glass cards — click the front one to send it to the back, click any other to bring it forward. */
const CardStack = () => {
  const { lang, t } = useLanguage();
  const CARDS = buildStackCards(lang);
  const [order, setOrder] = useState<string[]>(CARDS.map((c) => c.id));
  const byId = Object.fromEntries(CARDS.map((c) => [c.id, c]));

  const handleClick = (id: string) => {
    setOrder((prev) => reorderStack(prev, id));
  };

  return (
    <div
      className="relative w-[150px] h-[210px] sm:w-[220px] sm:h-[300px] md:w-full md:h-[460px] flex items-center justify-center [--fan-x:8px] [--fan-y:6px] sm:[--fan-x:10px] sm:[--fan-y:8px] md:[--fan-x:16px] md:[--fan-y:12px]"
    >
      <div
        className="absolute w-[170px] h-[170px] sm:w-[250px] sm:h-[250px] md:w-[380px] md:h-[380px] rounded-full blur-[10px]"
        style={{ background: 'radial-gradient(circle, rgb(var(--accent-rgb) / 0.08) 0%, transparent 70%)' }}
      />

      {order.map((id, depth) => {
        const card = byId[id];
        const back = order.length - 1 - depth;
        const style: React.CSSProperties = {
          transform: `translate(calc(var(--fan-x) * ${depth}), calc(var(--fan-y) * ${depth})) rotate(${depth === 0 ? 0 : (depth % 2 === 0 ? 1 : -1) * depth * 1.5}deg)`,
          zIndex: 100 - depth,
          opacity: Math.max(1 - depth * 0.06, 0.6),
          boxShadow:
            depth === 0
              ? '0 40px 80px -20px rgba(0,0,0,0.7)'
              : `0 ${10 + back}px ${20 + back * 4}px -10px rgba(0,0,0,0.5)`,
        };

        return (
          <button
            key={id}
            type="button"
            onClick={() => handleClick(id)}
            aria-label={card.isPhoto ? t.header.photoAlt(personalInfo.name) : t.header.projectAlt(card.title ?? '')}
            className="glass-strong absolute top-0 left-0 w-[145px] h-[195px] sm:w-[215px] sm:h-[290px] md:w-[320px] md:h-[420px] rounded-2xl md:rounded-3xl overflow-hidden cursor-pointer text-left hover:brightness-[1.06]"
            style={{ ...style, transition: 'transform 450ms cubic-bezier(0.22,1,0.36,1), box-shadow 450ms ease, opacity 450ms ease, filter 0.2s ease' }}
          >
            {card.isPhoto ? (
              <div className="relative w-full h-full">
                <ImageWithSkeleton src="./profile.jpg" alt="" className="w-full h-full object-cover block" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/75" />
                <div className="absolute left-2.5 bottom-2.5 right-2.5 sm:left-4 sm:bottom-4 sm:right-4 md:left-[22px] md:bottom-[22px] md:right-[22px]">
                  <div className="text-sm sm:text-base md:text-xl font-extrabold text-white">{personalInfo.name}</div>
                  <div className="text-[9px] sm:text-[11px] md:text-[13px] text-white/65 mt-0.5">{personalInfo.title[lang]}</div>
                </div>
              </div>
            ) : (
              <div
                className="w-full h-full p-2.5 sm:p-4 md:p-6 flex flex-col justify-between"
                style={{ background: `linear-gradient(160deg, ${card.tint}33 0%, transparent 55%)`, color: 'var(--fg-1)' }}
              >
                <div>
                  <div
                    className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-[8px] md:rounded-[11px] flex items-center justify-center text-[11px] sm:text-sm md:text-base font-extrabold"
                    style={{ background: card.tint, color: '#08080a' }}
                  >
                    {card.initial}
                  </div>
                  <div className="text-xs sm:text-base md:text-[22px] font-extrabold mt-1.5 sm:mt-3 md:mt-[22px] leading-tight">{card.title}</div>
                  <div className="text-[10px] sm:text-xs md:text-sm mt-1 sm:mt-2 md:mt-2.5 leading-relaxed line-clamp-3 sm:line-clamp-none" style={{ color: 'var(--fg-3)' }}>
                    {card.desc}
                  </div>
                </div>
                <div className="hidden sm:flex gap-1.5 flex-wrap">
                  {card.tags?.map((tag) => (
                    <span key={tag} className="text-[9px] md:text-[11px] px-2 py-0.5 md:px-2.5 md:py-1 rounded-full" style={{ background: 'var(--surface-2)', color: 'var(--fg-2)' }}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default CardStack;
