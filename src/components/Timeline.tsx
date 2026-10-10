import { useLanguage } from '@/contexts/LanguageContext';
import { CASE_COUNT } from '@/data/curatedProjects';
import { projects } from '@/data/projects';
import { useHorizontalDragScroll } from '@/hooks/useHorizontalDragScroll';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { edgeFadeProps, useScrollEdges } from '@/hooks/useScrollEdges';

/** Each chapter's share of the ruler: the years until the next one (at least 1); the last runs to this year. */
export function rulerSpans(years: string[], thisYear: number): number[] {
  const nums = years.map((year) => Number.parseInt(year, 10));
  return nums.slice(0, -1).map((year, i) => {
    const next = Number.isNaN(nums[i + 1]) ? thisYear : nums[i + 1];
    return Math.max(1, next - year);
  });
}

/**
 * Career chapters: the earlier ones in a column that scrolls once it holds more than about three
 * (a row to swipe or drag on phones), "now" as the big card beside them, and a ruler underneath
 * whose segments are as long as each chapter lasted.
 */
const Timeline = () => {
  const { t } = useLanguage();
  const { stops } = t.timeline;
  const past = stops.slice(0, -1);
  const now = stops[stops.length - 1];
  const spans = rulerSpans(stops.map((stop) => stop.year), new Date().getFullYear());
  // Below 960px the column turns into a sideways row: dragging with a mouse works there too.
  const sideways = useMediaQuery('(max-width: 960px)');
  // 1:1 so the card follows the pointer; no inertia, the scroll snap settles it on a card.
  const drag = useHorizontalDragScroll({ redirectWheel: false, dragFactor: 1, inertia: false });
  const { edges } = useScrollEdges(drag.containerRef);

  return (
    <section className="wrap sec" aria-labelledby="h-tl">
      <p className="lbl">{t.timeline.sectionLabel}</p>
      <h2 id="h-tl" className="h2">
        {t.timeline.title}
      </h2>
      <div className="tl">
        <div
          ref={drag.containerRef}
          className={`tl-past edge-fade${drag.isDragging ? ' drag' : ''}`}
          role="region"
          aria-label={t.timeline.pastLabel}
          tabIndex={0}
          {...edgeFadeProps(edges)}
          {...(sideways ? drag.handlers : {})}
        >
          <ol className="tl-list">
            {past.map((stop, i) => (
              <li key={stop.title} className="tl-ch">
                <span className="tl-top">
                  <span>
                    {t.timeline.chapter(i + 1)} · {stop.year}
                  </span>
                  <span className="tl-kind">{stop.kind}</span>
                </span>
                <h3 className="tl-t">{stop.title}</h3>
                <p className="tl-d">{stop.desc}</p>
              </li>
            ))}
          </ol>
        </div>
        <article className="tl-now" aria-labelledby="h-tl-now">
          <div className="tl-top">
            <span className="tl-here">
              {t.timeline.chapter(stops.length)} · {t.timeline.youAreHere}
            </span>
            <span className="tl-av">
              <span className="pulse" />
              {t.header.availability}
            </span>
          </div>
          <span className="tl-y">{now.year}</span>
          <h3 id="h-tl-now" className="tl-nt">
            {now.title}
          </h3>
          <p className="tl-nd">{now.desc}</p>
          <div className="tl-f">
            <span className="tags">
              {t.timeline.nowTags.map((tag) => (
                <span key={tag} className="tag">
                  {tag}
                </span>
              ))}
            </span>
            <span className="tl-facts">{t.footer.projectsHandle(CASE_COUNT, projects.length - CASE_COUNT)}</span>
          </div>
        </article>
      </div>
      <div className="tl-rule" aria-hidden="true" data-testid="timeline-ruler">
        {spans.map((span, i) => (
          <div
            key={stops[i].title}
            className="tl-seg"
            // older chapters fainter, the latest one in the full accent
            style={{ flexGrow: span, '--p': `${Math.round(30 + (70 * i) / Math.max(1, spans.length - 1))}%` } as React.CSSProperties}
          >
            <i />
            <span>
              {stops[i].year}
              {i === spans.length - 1 && <b>{now.year}</b>}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Timeline;
