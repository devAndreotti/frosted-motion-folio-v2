import { ChevronLeft, ChevronRight } from 'lucide-react';
import { personalInfo } from '@/data/personal';
import { featuredProject, curatedProjects, type CuratedProject } from '@/data/curatedProjects';
import { stackDim, stackTransform } from '@/lib/cardStack';
import { useCardStack } from '@/hooks/useCardStack';
import { useLanguage } from '@/contexts/LanguageContext';
import type { Lang } from '@/lib/i18n';

// The photo plus four real projects -- the same curation as the projects
// section, so the hero and the list below tell one story.
const STACK_PROJECT_IDS = [26, 9, 2, 30];
const ALL_CURATED = [featuredProject, ...curatedProjects];
const STACK_PROJECTS = STACK_PROJECT_IDS.map((id) => ALL_CURATED.find((p) => p.id === id)!);
const CARD_IDS = ['photo', ...STACK_PROJECT_IDS.map(String)];

const ProjectFace = ({ project, lang, sub }: { project: CuratedProject; lang: Lang; sub: string }) => (
  <>
    <span className="pj-img">
      <img src={project.image} alt="" loading="lazy" draggable={false} />
    </span>
    <span className="pj-b">
      <span className="tc">
        <i style={{ background: project.tint }} />
        <span>{sub}</span>
      </span>
      <span className="pj-t">{project.title}</span>
      <span className="pj-d">{project.tagline[lang]}</span>
    </span>
  </>
);

/**
 * Clickable deck of glass cards -- click the front one to send it flying to
 * the back, click any other to bring it forward. Shuffles itself until the
 * visitor touches it; the arrows below drive it the same way.
 */
const CardStack = () => {
  const { lang, t } = useLanguage();
  const { order, flight, pick, next, prev } = useCardStack(CARD_IDS);

  return (
    <div className="stk-w">
      <div className="stk">
        {/* Fixed DOM order (z-index does the stacking) so a reorder never
            re-inserts nodes, which would cancel their CSS transitions. */}
        {CARD_IDS.map((id, i) => {
          const depth = order.indexOf(id);
          const transform = stackTransform(depth);
          const flying = flight?.id === id ? ` fly-${flight.kind}-${flight.n % 2 ? 'a' : 'b'}` : '';
          const project = i === 0 ? null : STACK_PROJECTS[i - 1];
          const style = {
            transform,
            '--from': flight?.id === id ? flight.from : transform,
            '--to': transform,
            zIndex: 100 - depth,
            filter: stackDim(depth),
          } as React.CSSProperties;

          return (
            <button
              key={id}
              type="button"
              onClick={() => pick(id)}
              aria-label={project ? t.header.projectAlt(project.title) : t.header.photoAlt(personalInfo.name)}
              className={`card stack-card${flying}`}
              style={style}
            >
              {project ? (
                <ProjectFace project={project} lang={lang} sub={project.id === featuredProject.id ? t.projects.casePrincipalBadge : project.type[lang]} />
              ) : (
                <>
                  <img className="card-ph" src="./profile.webp" alt="" draggable={false} />
                  <span className="scrim" />
                  <span className="ct">
                    <span className="ct-t">{personalInfo.name}</span>
                    <span className="ct-s">{personalInfo.title[lang]}</span>
                  </span>
                </>
              )}
            </button>
          );
        })}
      </div>

      <div className="stk-nav">
        <button type="button" onClick={prev} aria-label={t.header.stackPrev} className="np sq">
          <ChevronLeft className="ic" />
        </button>
        <span className="dots" aria-hidden="true">
          {CARD_IDS.map((id) => (
            <i key={id} className={order[0] === id ? 'on' : undefined} />
          ))}
        </span>
        <button type="button" onClick={next} aria-label={t.header.stackNext} className="np sq">
          <ChevronRight className="ic" />
        </button>
      </div>
    </div>
  );
};

export default CardStack;
