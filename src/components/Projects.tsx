import { lazy, Suspense, useState, type MouseEvent } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { projects } from '@/data/projects';
import { contact } from '@/data/personal';
import { moreProjects } from '@/data/moreProjects';
import { featuredProject, curatedProjects, CATEGORY_FILTERS, type CuratedProject, type ProjectCategory } from '@/data/curatedProjects';
import { caseBySlug } from '@/data/cases';
import { CASE_STATE, casePath, isPlainClick } from '@/lib/projects/caseLink';
import { useLanguage } from '@/contexts/LanguageContext';
import { track } from '@/lib/track';
import FeaturedCase from './FeaturedCase';
import MoreProjects from './MoreProjects';
import SegmentedControl from './SegmentedControl';
import { projectAsset } from '@/lib/projects/asset';

// Only opened on click, so its code stays out of the first screen's bundle.
const CaseModal = lazy(() => import('./CaseModal'));

const ALL_CURATED = [featuredProject, ...curatedProjects];
// The ones neither ranked above nor in the gallery: only the GitHub link is left for them.
export const OTHERS_COUNT = projects.length - ALL_CURATED.length - moreProjects.length;

type Filter = ProjectCategory | 'all';

const Projects = () => {
  const { lang, t } = useLanguage();
  const [filter, setFilter] = useState<Filter>('all');
  // The popup lives in the address: /projetos/<slug>/ opens it, and the browser's back button closes it.
  const { slug } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const openProject = caseBySlug(slug) ?? null;
  const openCase = (project: CuratedProject) => {
    track(`project-open-${project.id}`);
    navigate(casePath(project.slug), { state: CASE_STATE });
  };
  // A plain click opens the popup here; a modified one keeps the link's own behavior (new tab).
  const cardClick = (project: CuratedProject) => (e: MouseEvent<HTMLAnchorElement>) => {
    if (!isPlainClick(e)) return;
    e.preventDefault();
    openCase(project);
  };
  // Opened from a card in this visit: going back closes it. Opened from a shared link: replace with the home page.
  const closeCase = () => {
    if ((location.state as { caseOpen?: boolean } | null)?.caseOpen) navigate(-1);
    else navigate('/', { replace: true });
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
          <Link key={p.id} to={casePath(p.slug)} state={CASE_STATE} className="row group" onClick={cardClick(p)}>
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
              <span className="print-url">{p.liveUrl ?? p.githubUrl}</span>
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
                <img src={projectAsset(p.image)} alt="" loading="lazy" />
              </span>
            </span>
          </Link>
        ))}
        {rows.length === 0 && !showFeatured && <div className="empty">{t.projects.emptyCategory}</div>}
      </div>

      <MoreProjects projects={moreProjects} onOpen={openCase} />

      <div className="more">
        <a className="btn btn-gh" href={contact.repos} target="_blank" rel="noopener noreferrer">
          {t.projects.moreProjects(OTHERS_COUNT)}
          <ArrowUpRight className="ic s" />
        </a>
      </div>

      {openProject && (
        <Suspense fallback={null}>
          <CaseModal project={openProject} onClose={closeCase} />
        </Suspense>
      )}
    </section>
  );
};

export default Projects;
