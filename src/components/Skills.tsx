import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { CORE_SKILLS, SKILL_CATEGORIES } from '@/data/skills';
import SkillsRadar from './SkillsRadar';
import SegmentedControl from './SegmentedControl';

type View = 'bento' | 'radar';

const Skills = () => {
  const { lang, t } = useLanguage();
  const [view, setView] = useState<View>('bento');

  return (
    <section id="skills" className="relative py-16 md:py-24 overflow-hidden">
      <div
        className="absolute top-1/4 -left-40 w-[220px] h-[220px] sm:w-[340px] sm:h-[340px] md:w-[480px] md:h-[480px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgb(var(--accent-rgb) / 0.06) 0%, transparent 70%)' }}
      />

      <div className="relative z-10 container mx-auto px-4">
        <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span className="w-7 h-0.5" style={{ background: 'var(--accent)' }} />
              <span className="text-xs uppercase tracking-wider" style={{ color: 'var(--fg-4)' }}>
                {t.skills.sectionLabel}
              </span>
            </div>
            <h2 className="text-[28px] md:text-[32px] font-extrabold">{t.skills.title}</h2>
          </div>

          <SegmentedControl
            layoutId="skills-view-toggle"
            value={view}
            onChange={setView}
            options={[
              { value: 'bento', label: t.skills.bentoTab },
              { value: 'radar', label: t.skills.radarTab },
            ]}
          />
        </div>

        {view === 'bento' ? (
          <div>
            {/* Core stack — one glance, no boxes: name, level and status all read in a single pill. */}
            <div className="flex flex-wrap gap-3 mb-8">
              {CORE_SKILLS.map((skill) => (
                <div key={skill.name} className="glass flex items-center gap-3 pl-5 pr-4 py-3 rounded-2xl transition-all duration-300 hover:bg-[var(--surface-2)] hover:-translate-y-0.5">
                  <span className="text-[15px] font-extrabold">{skill.name}</span>
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }, (_, i) => (
                      <span key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: i < skill.level ? 'var(--accent)' : 'var(--border-1)' }} />
                    ))}
                  </div>
                  {skill.learning && (
                    <span className="flex items-center gap-1 pl-1.5 pr-2 py-0.5 rounded-full" style={{ background: 'var(--surface-2)' }}>
                      <span className="relative w-1.5 h-1.5 rounded-full bg-green-400">
                        <span className="absolute inset-0 rounded-full bg-green-400 animate-pulse-dot" />
                      </span>
                      <span className="text-[9px] font-bold uppercase tracking-wide text-green-400">{t.skills.learningBadge}</span>
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Categories — numbered rows, same ranking idiom as Projects, instead of a wall of competing cards. */}
            <div style={{ borderTop: '1px solid var(--border-1)' }}>
              {SKILL_CATEGORIES.map((cat, i) => (
                <div
                  key={cat.title.pt}
                  className="flex flex-wrap items-center gap-4 md:gap-6 py-5 px-2 rounded-2xl transition-all hover:translate-x-1 hover:bg-[var(--surface-2)]"
                  style={{ borderBottom: '1px solid var(--border-1)' }}
                >
                  <span className="text-2xl md:text-3xl font-extrabold w-10 flex-shrink-0" style={{ color: 'var(--fg-4)' }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="w-1.5 h-9 rounded-sm flex-shrink-0" style={{ background: cat.tint }} />
                  <span className="text-[15px] md:text-[16px] font-extrabold w-full sm:w-[190px] flex-shrink-0">{cat.title[lang]}</span>
                  <span className="flex flex-wrap gap-2 flex-1 justify-start sm:justify-end">
                    {cat.skills.map((skill) => (
                      <span key={skill} className="text-[11px] px-3 py-1.5 rounded-full whitespace-nowrap" style={{ background: 'var(--surface-1)', color: 'var(--fg-3)' }}>
                        {skill}
                      </span>
                    ))}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="glass rounded-3xl p-8 md:p-11 grid md:grid-cols-[auto_1fr] gap-12 items-center">
            <div className="flex justify-center">
              <SkillsRadar />
            </div>
            <div>
              <div className="text-[17px] font-extrabold mb-1.5">{t.skills.radarTitle}</div>
              <div className="text-[13px] max-w-[360px] mb-6 leading-relaxed" style={{ color: 'var(--fg-4)' }}>
                {t.skills.radarDesc}
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
