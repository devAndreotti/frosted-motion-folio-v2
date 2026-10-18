import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { ArrowUpRight, Check, Ellipsis, Lock, Tv, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { GATE_CHECKS, NOW_ALSO, NOW_PROJECTS, NOW_UPDATED, type AlsoDetails, type AlsoItem, type NowProject } from '@/data/now';
import { contact } from '@/data/personal';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { useScrollLock } from '@/hooks/useScrollLock';
import { track } from '@/lib/track';
import { EGG_EVENTS } from '@/lib/eggs';
import MemoryTvDialog from './MemoryTvDialog';
import NowDescription from './NowDescription';
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

const ProjectCard = ({ p, lang, onOpenTv }: { p: NowProject; lang: Lang; onOpenTv: () => void }) => {
  const { t } = useLanguage();
  const body = (
    <>
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
        <NowDescription text={p.pitch[lang]} />
        <span className="nc-tags">
          {p.tags.map((tag) => (
            <span key={tag} className="tag">
              {tag}
            </span>
          ))}
        </span>
        <span className="nc-link">
          {p.tv ? t.now.tv.open : p.linkLabel}
          {p.tv ? <Tv className="ic s" /> : <ArrowUpRight className="ic s" />}
          {p.privateCode && (
            <span className="nc-priv">
              <Lock className="ic s" />
              {t.now.privateCode}
            </span>
          )}
        </span>
      </span>
    </>
  );
  // The whole card is one control: a cover link or button under the text (aria-label = the title). The text
  // stays outside it, so the "ler mais" button can sit inside the card without nesting interactive elements.
  const cover = p.tv ? (
    <button type="button" className="nc-cover" aria-label={p.title} onClick={() => { track(`now-open-${p.id}`); onOpenTv(); }} />
  ) : (
    <a className="nc-cover" href={p.href} aria-label={p.title} target="_blank" rel="noopener noreferrer" onClick={() => track(`now-open-${p.id}`)} />
  );
  return (
    <div className="nc glass nc-card">
      {cover}
      {body}
    </div>
  );
};

/** The item's app icon, grey until hover. */
const AlsoIcon = ({ item }: { item: AlsoItem }) => (item.icon ? <img className="also-ic" src={item.icon} alt="" loading="lazy" /> : null);

/** One "also in the oven" item: a button to its card when it has details, else a link when public, plain text otherwise. */
const AlsoEntry = ({ item, onOpen }: { item: AlsoItem; onOpen: () => void }) => {
  const { lang, t } = useLanguage();
  const body = (
    <>
      <AlsoIcon item={item} />
      <span className="also-n">{item.name}</span>
      <span className="also-d">{item.note[lang]}</span>
    </>
  );

  if (item.details) {
    return (
      <button
        type="button"
        className="also-i"
        aria-haspopup="dialog"
        onClick={() => {
          onOpen();
          track(`now-also-${item.name.toLowerCase().replace(/ /g, '-')}`);
        }}
      >
        {body}
        <span className="nc-priv">
          {item.href ? 'GitHub' : <><Lock className="ic s" />{t.now.privateTag}</>} · <span className="also-open">{t.now.alsoOpen}</span>
        </span>
      </button>
    );
  }
  if (item.href) {
    return (
      <a className="also-i" href={item.href} target="_blank" rel="noopener noreferrer">
        {body}
        <ArrowUpRight className="ic s" />
      </a>
    );
  }
  return (
    <span className="also-i">
      {body}
      <span className="nc-priv">
        <Lock className="ic s" />
        {t.now.privateTag}
      </span>
    </span>
  );
};

/** A side project's card, set in the project's own palette instead of the site's. */
const AlsoCard = ({ item, details: d, onClose }: { item: AlsoItem; details: AlsoDetails; onClose: () => void }) => {
  const { lang, t } = useLanguage();
  const dialogRef = useRef<HTMLDivElement>(null);
  useScrollLock(true);
  useFocusTrap(true, dialogRef, onClose);
  const { bg, fg, fg2, muted, ink = item.color } = d.palette;
  const palette = { '--p-bg': bg, '--p-fg': fg, '--p-fg2': fg2, '--p-mu': muted, '--p-ac': item.color, '--p-ink': ink } as CSSProperties;

  return (
    <div className="ov" onClick={onClose}>
      <div ref={dialogRef} className={`dlg sm oc${d.face ? ` ${d.face}` : ''}${d.tint ? ' tint' : ''}`} style={palette} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="oc-t">
        <button type="button" className="np sq oc-x" aria-label={t.caseModal.closeAria} onClick={onClose}>
          <X className="ic" />
        </button>
        <div className="oc-top">
          <AlsoIcon item={item} />
          <div>
            <h3 id="oc-t">{item.name}</h3>
            <p className="oc-sig">{d.sig[lang]}</p>
          </div>
        </div>
        <div className="oc-chips">
          <span className="nc-st">{d.status[lang]}</span>
          <span className="oc-meta">{d.meta[lang]}</span>
        </div>
        <p className="dlg-p">{d.pitch[lang]}</p>
        <p className="k">{t.now.alsoWhat}</p>
        <ul className="oc-f">
          {d.features[lang].map((feature) => (
            <li key={feature}>
              <span aria-hidden="true">{d.mark}</span>
              {feature}
            </li>
          ))}
        </ul>
        <p className="k">Stack</p>
        <div className="tags">
          {d.stack.map((tool) => (
            <span key={tool} className="tag">
              {tool}
            </span>
          ))}
        </div>
        {item.href ? (
          <a className="oc-foot oc-gh" href={item.href} target="_blank" rel="noopener noreferrer">
            {t.now.alsoGithub}
            <ArrowUpRight className="ic s" />
          </a>
        ) : (
          <p className="oc-foot">
            <Lock className="ic s" />
            {t.now.alsoPrivateFoot}
          </p>
        )}
      </div>
    </div>
  );
};

/** "Agora": a short note about me next to what I'm actually building lately. */
const NowSection = () => {
  const { lang, t } = useLanguage();
  const updatedLabel = new Date(`${NOW_UPDATED}T12:00:00`).toLocaleDateString(lang === 'en' ? 'en-US' : 'pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
  const { hue } = useTheme();
  const [openItem, setOpenItem] = useState<AlsoItem | null>(null);
  const [tvProject, setTvProject] = useState<NowProject | null>(null);

  // The TV-typing easter egg (useSecretKeys) opens the same dialog as the Memory Apartment card.
  useEffect(() => {
    const openTv = () => {
      const memory = NOW_PROJECTS.find((p) => p.tv);
      if (memory) setTvProject(memory);
    };
    window.addEventListener(EGG_EVENTS.openTv, openTv);
    return () => window.removeEventListener(EGG_EVENTS.openTv, openTv);
  }, []);

  return (
    <section className="wrap sec" aria-labelledby="h-now">
      <div className="sh">
        <div>
          <p className="lbl">{t.now.sectionLabel}</p>
          <h2 id="h-now" className="h2">
            {t.now.title}
          </h2>
          <p className="sub">{t.now.subtitle}</p>
          <p className="now-upd">
            <time dateTime={NOW_UPDATED}>{t.now.updated(updatedLabel)}</time>
            {' · '}
            <Link to="/agora/">{t.now.archiveLink}</Link>
          </p>
        </div>
      </div>

      <div className="now-layout">
        <article className="about glass">
          <img className="about-ph" src={`./profile/${hue}.webp`} alt="" loading="lazy" />
          <p className="k">{t.now.aboutLabel}</p>
          <p className="about-p">{t.now.aboutBody}</p>
          <p className="about-int">{t.now.interests}</p>
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
            <ProjectCard key={p.id} p={p} lang={lang} onOpenTv={() => setTvProject(p)} />
          ))}
        </div>
      </div>

      <div className="also">
        <p className="k">{t.now.alsoLabel}</p>
        <ul className="also-l">
          {NOW_ALSO.map((item) => (
            <li key={item.name} style={item.color ? ({ '--brand': item.color } as CSSProperties) : undefined}>
              <AlsoEntry item={item} onOpen={() => setOpenItem(item)} />
            </li>
          ))}
          {/* fills the last row's gap; the CSS hides it where it would open a row of its own */}
          <li className="also-more">
            <a className="also-i" href={contact.repos} target="_blank" rel="noopener noreferrer" onClick={() => track('now-more-github')}>
              <span className="also-dots" aria-hidden="true">
                <Ellipsis className="ic" />
              </span>
              <span className="also-n">{t.now.alsoMore}</span>
              <span className="also-d">{t.now.alsoMoreNote}</span>
              <ArrowUpRight className="ic s" />
            </a>
          </li>
        </ul>
      </div>

      {tvProject && <MemoryTvDialog project={tvProject} onClose={() => setTvProject(null)} />}
      {openItem?.details && <AlsoCard item={openItem} details={openItem.details} onClose={() => setOpenItem(null)} />}
    </section>
  );
};

export default NowSection;
