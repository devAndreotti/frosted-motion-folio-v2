import { lazy, Suspense, useState } from 'react';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { projects } from '@/data/projects';
import { contact } from '@/data/personal';
import { featuredProject, curatedProjects, CATEGORY_FILTERS, type CuratedProject, type ProjectCategory } from '@/data/curatedProjects';
import { useLanguage } from '@/contexts/LanguageContext';
import { track } from '@/lib/track';
import FeaturedCase from './FeaturedCase';
import SegmentedControl from './SegmentedControl';

// Only opened on click, so its code stays out of the first screen's bundle.
const CaseModal = lazy(() => import('./CaseModal'));

const ALL_CURATED = [featuredProject, ...curatedProjects];
export const OTHERS_COUNT = projects.length - ALL_CURATED.length;

type Filter = ProjectCategory | 'all';

const Projects = () => {
  const { lang, t } = useLanguage();
  const [filter, setFilter] = useState<Filter>('all');
  const [openProject, setOpenProject] = useState<CuratedProject | null>(null);
  const openCase = (project: CuratedProject) => {
    track(`project-open-${project.id}`);
    setOpenProject(project);
  };

  const inFilter = (p: CuratedProject) => filter === 'all' || p.cat === filter;
  // Rows keep their rank number when a filter hides the ones around them.
  const rows = curatedProjects.map((p, i) => ({ p, n: String(i + 2).padStart(2, '0') })).filter(({ p }) => inFilter(p));
  const showFeatured = inFilter(featuredProject);

  return (
    <section id="projects" className="wrap sec" aria-labelledby="h-proj">
      <div className="sh">
        <div>
          <p className="lbl">{t.projects.sectionLabel}</p>
          <h2 id="h-proj" className="h2">
            {t.projects.title}
          </h2>
          <p className="sub">{t.projects.subtitle}</p>
        </div>
        <SegmentedControl
          layoutId="projects-category-filter"
          ariaLabel={t.projects.filterAria}
          value={filter}
          onChange={(value) => setFilter(value)}
          options={CATEGORY_FILTERS.map((f) => ({
            value: f.key,
            label: t.projects.categoryFilters[f.key],
            count: f.key === 'all' ? ALL_CURATED.length : ALL_CURATED.filter((p) => p.cat === f.key).length,
          }))}
        />
      </div>

      {showFeatured && <FeaturedCase onOpen={() => openCase(featuredProject)} />}

      <div className="rows">
        {rows.map(({ p, n }) => (
          <button key={p.id} type="button" className="row group" onClick={() => openCase(p)}>
            <span className="rn">{n}</span>
            <span className="min-w-0">
              <span className="rt">
                <span className="rt-t">{p.title}</span>
                <span className="tc">
                  <i style={{ background: p.tint }} />
                  <span>{p.type[lang]}</span>
                </span>
              </span>
              <span className="rd">{p.description[lang]}</span>
            </span>
            <span className="rtags">
              {p.technologies.slice(0, 3).map((tech) => (
                <span key={tech} className="tag">
                  {tech}
                </span>
              ))}
            </span>
            <span className="ra">
              <ArrowRight className="ic s" />
            </span>
            {/* Hover preview of the screenshot, where the tags were -- mouse only, never on touch. */}
            <span className="thumb" aria-hidden="true">
              <span className="thumb-bar">
                <i />
                <i />
                <i />
                <span>{p.liveUrl ? new URL(p.liveUrl).host : 'github.com/devAndreotti'}</span>
              </span>
              <span className="thumb-shot">
                <img src={p.image} alt="" loading="lazy" />
              </span>
            </span>
          </button>
        ))}
        {rows.length === 0 && !showFeatured && <div className="empty">{t.projects.emptyCategory}</div>}
      </div>

      <div className="more">
        <a className="btn btn-gh" href={contact.repos} target="_blank" rel="noopener noreferrer">
          {t.projects.moreProjects(OTHERS_COUNT)}
          <ArrowUpRight className="ic s" />
        </a>
      </div>

      {openProject && (
        <Suspense fallback={null}>
          <CaseModal project={openProject} onClose={() => setOpenProject(null)} />
        </Suspense>
      )}
    </section>
  );
};

export default Projects;
