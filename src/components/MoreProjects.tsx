import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import type { CuratedProject } from '@/data/curatedProjects';

/** Cards shown before "see all". */
export const INITIAL_CARDS = 8;

interface MoreProjectsProps {
  projects: CuratedProject[];
  onOpen: (project: CuratedProject) => void;
}

/** The gallery of smaller projects under the ranked list: a photo, a name and a line each; a click opens the same dialog as the cases. */
const MoreProjects = ({ projects, onOpen }: MoreProjectsProps) => {
  const { lang, t } = useLanguage();
  const m = t.projects.more;
  const [all, setAll] = useState(false);
  if (projects.length === 0) return null;
  const shown = all ? projects : projects.slice(0, INITIAL_CARDS);

  return (
    <div className="mp" aria-labelledby="h-more">
      <h3 id="h-more" className="mp-t">
        {m.title}
      </h3>
      <p className="mp-s">{m.subtitle}</p>
      <ul className="mp-grid">
        {shown.map((p) => (
          <li key={p.id}>
            <button type="button" className="mp-card glass" onClick={() => onOpen(p)} aria-label={m.cardAria(p.title)}>
              <span className="mp-img">
                <img src={p.image} alt="" loading="lazy" decoding="async" />
              </span>
              <span className="mp-b">
                <span className="mp-n">{p.title}</span>
                <span className="mp-d">{p.tagline[lang]}</span>
                <span className="tags">
                  {p.technologies.slice(0, 2).map((tech) => (
                    <span key={tech} className="tag">
                      {tech}
                    </span>
                  ))}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>
      {projects.length > INITIAL_CARDS && (
        <div className="mp-more">
          <button type="button" className="btn btn-gh btn-sm" aria-expanded={all} onClick={() => setAll((open) => !open)}>
            {all ? m.showLess : m.showAll(projects.length)}
          </button>
        </div>
      )}
    </div>
  );
};

export default MoreProjects;
