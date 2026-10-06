import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { CORE_SKILLS } from '@/data/skills';
import SkillsRadar from './SkillsRadar';
import SkillsBento from './SkillsBento';
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
          <SkillsBento />
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
