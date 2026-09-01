import { useState } from 'react';
import { CORE_SKILLS, SKILL_CATEGORIES } from '@/data/skills';
import SkillsRadar from './SkillsRadar';

type View = 'bento' | 'radar';

const Skills = () => {
  const [view, setView] = useState<View>('bento');

  return (
    <section id="skills" className="relative py-20 md:py-32 overflow-hidden">
      <div
        className="absolute top-1/4 -left-40 w-[480px] h-[480px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(var(--accent-rgb), 0.1) 0%, transparent 70%)' }}
      />

      <div className="relative z-10 container mx-auto px-4">
        <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span className="w-7 h-0.5" style={{ background: 'var(--accent)' }} />
              <span className="text-xs uppercase tracking-wider" style={{ color: 'var(--fg-4)' }}>
                Skills &amp; tecnologias
              </span>
            </div>
            <h2 className="text-[28px] md:text-[32px] font-extrabold">Onde eu foco</h2>
          </div>

          <div className="glass relative flex gap-1 p-1.5 rounded-full">
            <div
              className="absolute top-1.5 left-1.5 h-[calc(100%-12px)] w-[90px] rounded-full transition-transform duration-500"
              style={{ background: 'var(--accent)', transform: `translateX(${view === 'bento' ? 0 : 94}px)`, transitionTimingFunction: 'cubic-bezier(0.34,1.56,0.64,1)' }}
            />
            <button
              type="button"
              onClick={() => setView('bento')}
              className="relative z-10 w-[90px] text-center py-2 text-[12.5px] font-semibold"
              style={{ color: view === 'bento' ? 'var(--accent-text)' : 'var(--fg-3)' }}
            >
              Bento
            </button>
            <button
              type="button"
              onClick={() => setView('radar')}
              className="relative z-10 w-[90px] text-center py-2 text-[12.5px] font-semibold"
              style={{ color: view === 'radar' ? 'var(--accent-text)' : 'var(--fg-3)' }}
            >
              Radar
            </button>
          </div>
        </div>

        {view === 'bento' ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div
              className="glass col-span-2 row-span-3 rounded-[22px] p-7 flex flex-col justify-between transition-all duration-300 hover:bg-[var(--surface-2)]"
              style={{ ['--glow' as string]: 'rgba(var(--accent-rgb), 0.2)' }}
            >
              <div>
                <div
                  className="w-10 h-10 rounded-[11px] flex items-center justify-center mb-4.5"
                  style={{ background: `linear-gradient(155deg, var(--accent), rgba(var(--accent-rgb), 0.6))`, boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.3)' }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="var(--accent-text)">
                    <path d="M12 2l2.9 6.4L22 9.3l-5 4.9 1.2 7-6.2-3.4L5.8 21.2 7 14.2 2 9.3l7.1-1z" />
                  </svg>
                </div>
                <div className="text-[17px] font-extrabold mb-1">Core stack</div>
                <div className="text-[12.5px] mb-5" style={{ color: 'var(--fg-4)' }}>
                  O que eu uso todo dia, do front ao dado.
                </div>
              </div>
              <div className="flex flex-col gap-2.5">
                {CORE_SKILLS.map((skill) => (
                  <div key={skill.name} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[13.5px] font-semibold">{skill.name}</span>
                      {skill.learning && (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ background: 'var(--surface-2)' }}>
                          <span className="relative w-1.5 h-1.5 rounded-full bg-green-400">
                            <span className="absolute inset-0 rounded-full bg-green-400 animate-pulse-dot" />
                          </span>
                          <span className="text-[9.5px] font-bold uppercase tracking-wide text-green-400">aprendendo</span>
                        </span>
                      )}
                    </div>
                    <div className="flex gap-1">
                      {Array.from({ length: 5 }, (_, i) => (
                        <span
                          key={i}
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ background: i < skill.level ? 'var(--accent)' : 'var(--border-1)' }}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {SKILL_CATEGORIES.map((cat) => (
              <div
                key={cat.title}
                className="glass rounded-[22px] p-5.5 flex flex-col gap-3 transition-all duration-300 hover:bg-[var(--surface-2)] hover:-translate-y-1"
                style={{ ['--glow' as string]: `${cat.tint}33` }}
              >
                <div
                  className="w-[34px] h-[34px] rounded-[9px] flex items-center justify-center text-[12.5px] font-extrabold"
                  style={{ background: `linear-gradient(155deg, ${cat.tint}, ${cat.tint}99)`, boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.3)' }}
                >
                  {cat.mono}
                </div>
                <div className="text-sm font-bold">{cat.title}</div>
                <div className="flex flex-wrap gap-1.5">
                  {cat.skills.map((skill) => (
                    <span key={skill} className="text-[11px] px-2.5 py-1 rounded-full transition-colors hover:bg-[var(--surface-2)]" style={{ background: 'var(--surface-1)', color: 'var(--fg-3)' }}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass rounded-3xl p-8 md:p-11 grid md:grid-cols-[auto_1fr] gap-12 items-center">
            <div className="flex justify-center">
              <SkillsRadar />
            </div>
            <div>
              <div className="text-[17px] font-extrabold mb-1.5">Radar da stack</div>
              <div className="text-[13px] max-w-[360px] mb-6 leading-relaxed" style={{ color: 'var(--fg-4)' }}>
                Mesma leitura do bento, em outro formato — nível relativo (1 a 5) nas seis frentes que mais uso.
              </div>
              <div className="flex flex-col gap-2.5">
                {CORE_SKILLS.map((skill) => (
                  <div key={skill.name} className="flex items-center justify-between gap-3 max-w-[320px]">
                    <span className="text-[13.5px] font-semibold">{skill.name}</span>
                    <div className="flex gap-1">
                      {Array.from({ length: 5 }, (_, i) => (
                        <span key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: i < skill.level ? 'var(--accent)' : 'var(--border-1)' }} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Skills;
