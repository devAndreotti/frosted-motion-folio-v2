import { useState } from 'react';
import { personalInfo } from '@/data/personal';
import { projects } from '@/data/projects';
import { reorderStack } from '@/lib/cardStack';

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
const STACK_PROJECT_IDS = [26, 9, 2, 5, 1];
const TINTS: Record<number, string> = { 26: '#3b82f6', 9: '#eab308', 2: '#22c55e', 5: '#a855f7', 1: '#f97316' };

const STACK_PROJECTS: StackCard[] = STACK_PROJECT_IDS.map((id) => {
  const project = projects.find((p) => p.id === id)!;
  return {
    id: String(id),
    title: project.title,
    desc: project.description,
    tags: project.technologies.slice(0, 3),
    tint: TINTS[id],
    initial: project.title.charAt(0),
  };
});

const CARDS: StackCard[] = [{ id: 'photo', isPhoto: true }, ...STACK_PROJECTS];

/** Clickable stack of glass cards — click the front one to send it to the back, click any other to bring it forward. */
const CardStack = () => {
  const [order, setOrder] = useState<string[]>(CARDS.map((c) => c.id));
  const byId = Object.fromEntries(CARDS.map((c) => [c.id, c]));

  const handleClick = (id: string) => {
    setOrder((prev) => reorderStack(prev, id));
  };

  return (
    <div className="relative h-[460px] flex items-center justify-center">
      <div
        className="absolute w-[380px] h-[380px] rounded-full blur-[10px]"
        style={{ background: 'radial-gradient(circle, rgba(var(--accent-rgb), 0.08) 0%, transparent 70%)' }}
      />
      <div className="absolute w-[400px] h-[400px] rounded-full border border-dashed" style={{ borderColor: 'var(--border-1)' }} />

      {order.map((id, depth) => {
        const card = byId[id];
        const back = order.length - 1 - depth;
        const style: React.CSSProperties = {
          transform: `translate(${depth * 16}px, ${depth * 12}px) rotate(${depth === 0 ? 0 : (depth % 2 === 0 ? 1 : -1) * depth * 1.5}deg)`,
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
            aria-label={card.isPhoto ? `Foto de ${personalInfo.name}` : `Projeto: ${card.title}`}
            className="glass-strong absolute top-0 left-0 w-[320px] h-[420px] rounded-3xl overflow-hidden cursor-pointer text-left hover:brightness-[1.06]"
            style={{ ...style, transition: 'transform 450ms cubic-bezier(0.22,1,0.36,1), box-shadow 450ms ease, opacity 450ms ease, filter 0.2s ease' }}
          >
            {card.isPhoto ? (
              <div className="relative w-full h-full">
                <img src="./profile.jpg" alt="" className="w-full h-full object-cover block" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/75" />
                <div className="absolute left-[22px] bottom-[22px] right-[22px]">
                  <div className="text-xl font-extrabold text-white">{personalInfo.name}</div>
                  <div className="text-[13px] text-white/65 mt-0.5">{personalInfo.title}</div>
                </div>
              </div>
            ) : (
              <div
                className="w-full h-full p-6 flex flex-col justify-between"
                style={{ background: `linear-gradient(160deg, ${card.tint}33 0%, transparent 55%)`, color: 'var(--fg-1)' }}
              >
                <div>
                  <div
                    className="w-10 h-10 rounded-[11px] flex items-center justify-center text-base font-extrabold"
                    style={{ background: card.tint, color: '#08080a' }}
                  >
                    {card.initial}
                  </div>
                  <div className="text-[22px] font-extrabold mt-[22px] leading-tight">{card.title}</div>
                  <div className="text-sm mt-2.5 leading-relaxed" style={{ color: 'var(--fg-3)' }}>
                    {card.desc}
                  </div>
                </div>
                <div className="flex gap-1.5 flex-wrap">
                  {card.tags?.map((tag) => (
                    <span key={tag} className="text-[11px] px-2.5 py-1 rounded-full" style={{ background: 'var(--surface-2)', color: 'var(--fg-2)' }}>
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
