import { ArrowRight, ArrowUpRight, Check } from 'lucide-react';
import { featuredProject as p } from '@/data/curatedProjects';
import { useLanguage } from '@/contexts/LanguageContext';

const BROWSER_TAGS = 6;

/** The main case, spelled out on the page: story, what was built, facts, and a browser-framed screenshot. */
const FeaturedCase = ({ onOpen }: { onOpen: () => void }) => {
  const { lang, t } = useLanguage();
  const host = p.liveUrl ? new URL(p.liveUrl).host : null;

  return (
    <article className="feat glass">
      <div>
        <div className="eyebrow">
          <span className="chip">
            <span className="dot" style={{ background: 'var(--accent)' }} />
            {t.projects.casePrincipalBadge}
          </span>
          <span>01 · {p.type[lang]}</span>
        </div>
        <h3>{p.title}</h3>
        <p className="feat-p">{p.long[lang]}</p>
        <p className="k">{t.caseModal.whatIDid}</p>
        <ul className="pts">
          {p.points[lang].map((point) => (
            <li key={point}>
              <Check className="ic s" />
              <span>{point}</span>
            </li>
          ))}
        </ul>
        <dl className="meta">
          <div>
            <dt>{t.projects.detailLabels.tipo}</dt>
            <dd>{p.type[lang]}</dd>
          </div>
          <div>
            <dt>{t.projects.detailLabels.frente}</dt>
            <dd>{t.projects.featuredMeta.frente}</dd>
          </div>
          <div>
            <dt>{t.projects.detailLabels.duracao}</dt>
            <dd>{t.projects.featuredMeta.duracao}</dd>
          </div>
          <div>
            <dt>{t.projects.detailLabels.status}</dt>
            <dd className="live">
              <span className="dot" />
              {t.projects.featuredMeta.status}
            </dd>
          </div>
        </dl>
        <div className="acts">
          <button type="button" className="btn btn-pri btn-sm" onClick={onOpen}>
            {t.projects.openCase}
            <ArrowRight className="ic s" />
          </button>
          {p.liveUrl && (
            <a className="btn btn-gh btn-sm" href={p.liveUrl} target="_blank" rel="noopener noreferrer">
              {t.projects.demo}
              <ArrowUpRight className="ic s" />
            </a>
          )}
          {p.githubUrl && (
            <a className="btn btn-gh btn-sm" href={p.githubUrl} target="_blank" rel="noopener noreferrer">
              {t.projects.code}
              <ArrowUpRight className="ic s" />
            </a>
          )}
        </div>
      </div>

      {/* Browser chrome so the screenshot reads as a live product, not a loose image. */}
      <button type="button" className="bf" onClick={onOpen}>
        <span className="bf-bar">
          <i />
          <i />
          <i />
          {host && <span className="bf-url">{host}</span>}
        </span>
        <img src={p.image} alt="" loading="lazy" />
        <span className="bf-tags">
          {p.technologies.slice(0, BROWSER_TAGS).map((tech) => (
            <span key={tech} className="bf-tag">
              {tech}
            </span>
          ))}
        </span>
      </button>
    </article>
  );
};

export default FeaturedCase;
