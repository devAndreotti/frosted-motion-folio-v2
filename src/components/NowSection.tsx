import { ArrowUpRight, Check, Lock } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { GATE_CHECKS, NOW_ALSO, NOW_PROJECTS, type NowProject } from '@/data/now';
import { track } from '@/lib/track';
import type { Lang } from '@/lib/i18n';

/** Quality Gate has no screenshot worth showing -- its card shows the checks it runs, which are this repo's own. */
const GateVisual = () => (
  <span className="nc-img nc-gate" aria-hidden="true">
    <span className="gate-h">quality-gate · 6/6</span>
    {GATE_CHECKS.map((check) => (
      <span key={check} className="gate-row">
        <Check className="ic s" />
        {check}
      </span>
    ))}
  </span>
);

const ProjectCard = ({ p, lang }: { p: NowProject; lang: Lang }) => {
  const { t } = useLanguage();
  return (
    <a
      className="nc glass"
      href={p.href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${t.now.openLink(p.title)} (${p.linkLabel})`}
      onClick={() => track(`now-open-${p.id}`)}
    >
      {p.image ? (
        <span className={`nc-img${p.contain ? ' contain' : ''}`}>
          <img src={p.image} alt="" loading="lazy" />
        </span>
      ) : (
        <GateVisual />
      )}
      <span className="nc-b">
        <span className="nc-top">
          <span className="nc-st">{p.status[lang]}</span>
          <span className="nc-meta">{p.meta[lang]}</span>
        </span>
        <span className="nc-t">{p.title}</span>
        <span className="nc-d">{p.pitch[lang]}</span>
        <span className="nc-tags">
          {p.tags.map((tag) => (
            <span key={tag} className="tag">
              {tag}
            </span>
          ))}
        </span>
        <span className="nc-link">
          {p.linkLabel}
          <ArrowUpRight className="ic s" />
          {p.privateCode && (
            <span className="nc-priv">
              <Lock className="ic s" />
              {t.now.privateCode}
            </span>
          )}
        </span>
      </span>
    </a>
  );
};

/** "Agora": a short note about me next to what I'm actually building lately. */
const NowSection = () => {
  const { lang, t } = useLanguage();

  return (
    <section id="now" className="wrap sec" aria-labelledby="h-now">
      <div className="sh">
        <div>
          <p className="lbl">{t.now.sectionLabel}</p>
          <h2 id="h-now" className="h2">
            {t.now.title}
          </h2>
          <p className="sub">{t.now.subtitle}</p>
        </div>
      </div>

      <div className="now">
        <article className="about glass">
          <img className="about-ph" src="./profile.webp" alt="" loading="lazy" />
          <p className="k">{t.now.aboutLabel}</p>
          <p className="about-p">{t.now.aboutBody}</p>
          <dl className="about-f">
            {t.now.facts.map((fact) => (
              <div key={fact.label}>
                <dt>{fact.label}</dt>
                <dd>{fact.value}</dd>
              </div>
            ))}
          </dl>
        </article>

        <div className="now-grid">
          {NOW_PROJECTS.map((p) => (
            <ProjectCard key={p.id} p={p} lang={lang} />
          ))}
        </div>
      </div>

      <div className="also">
        <p className="k">{t.now.alsoLabel}</p>
        <ul className="also-l">
          {NOW_ALSO.map((item) => (
            <li key={item.name}>
              {item.href ? (
                <a className="also-i" href={item.href} target="_blank" rel="noopener noreferrer">
                  <span className="also-n">{item.name}</span>
                  <span className="also-d">{item.note[lang]}</span>
                  <ArrowUpRight className="ic s" />
                </a>
              ) : (
                <span className="also-i">
                  <span className="also-n">{item.name}</span>
                  <span className="also-d">{item.note[lang]}</span>
                  <span className="nc-priv">
                    <Lock className="ic s" />
                    {t.now.privateTag}
                  </span>
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default NowSection;
