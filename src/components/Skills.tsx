import { useState } from 'react';
import { Zap } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useGithubActivity } from '@/hooks/useGithubActivity';
import Marquee from './Marquee';
import SkillsBento from './SkillsBento';

/** "Stack & skills": the tool ticker on top, the usage bento below -- one section. */
const Skills = () => {
  const { t } = useLanguage();
  const { publicRepos } = useGithubActivity();
  const [boosted, setBoosted] = useState(false);

  return (
    <section id="skills" className="sec" aria-labelledby="h-stack">
      <div className="wrap">
        <div className="sh">
          <div>
            <p className="lbl">{t.marquee.sectionLabel}</p>
            <h2 id="h-stack" className="h2">
              {t.marquee.title}
            </h2>
            <p className="sub">{t.marquee.subtitle}</p>
          </div>
          <button type="button" className="np" aria-pressed={boosted} onClick={() => setBoosted((b) => !b)}>
            <Zap className="ic" />
            <span>{boosted ? t.marquee.boostOff : t.marquee.boostBtn}</span>
          </button>
        </div>
      </div>
      <Marquee boosted={boosted} />
      <div className="wrap">
        <SkillsBento repoCount={publicRepos} />
      </div>
    </section>
  );
};

export default Skills;
