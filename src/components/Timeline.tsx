import { useLanguage } from '@/contexts/LanguageContext';

/** Career milestones on one line, the current one lit in the accent. */
const Timeline = () => {
  const { t } = useLanguage();
  const stops = t.timeline.stops;

  return (
    <section className="wrap sec" aria-labelledby="h-tl">
      <p className="lbl">{t.timeline.sectionLabel}</p>
      <h2 id="h-tl" className="h2">
        {t.timeline.title}
      </h2>
      <ol className="tl">
        {stops.map((stop, i) => (
          <li key={stop.year} className="ts">
            <span className={`tn${i === stops.length - 1 ? ' now' : ''}`} aria-hidden="true" />
            <div className="tcard glass">
              <span className="tcard-y">{stop.year}</span>
              <span className="tcard-t">{stop.title}</span>
              <p className="tcard-d">{stop.desc}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
};

export default Timeline;
