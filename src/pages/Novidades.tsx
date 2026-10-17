import { useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import BlogShell from '@/components/blog/BlogShell';
import { CHANGELOG, type ChangelogEntry } from '@/data/changelog';
import { formatDay } from '@/lib/blog/list';
import { markSeen } from '@/lib/novidades';

/** Entries grouped by day, in the order they come (newest first). */
const byDate = (entries: ChangelogEntry[]) => {
  const groups = new Map<string, ChangelogEntry[]>();
  for (const entry of entries) groups.set(entry.date, [...(groups.get(entry.date) ?? []), entry]);
  return [...groups].map(([date, items]) => ({ date, items }));
};

/** /novidades/: the visible changes of the site, by date. Opening it clears the "Novo" badge. */
const Novidades = () => {
  const { lang, t } = useLanguage();
  const n = t.novidades;

  useEffect(() => {
    markSeen();
  }, []);

  return (
    <BlogShell title={`${n.pageTitle} — Ricardo A. Gonçalves`}>
      <main className="wrap blog-main nv" lang={lang === 'en' ? 'en' : 'pt-BR'}>
        <p className="eyebrow">
          <span className="chip">~/novidades</span>
        </p>
        <h1 className="blog-h">{n.pageTitle}</h1>
        <p className="lead">{n.lead}</p>

        {byDate(CHANGELOG).map((group) => (
          <section key={group.date} className="blog-year" aria-labelledby={`nv-${group.date}`}>
            <h2 id={`nv-${group.date}`}>
              <time dateTime={group.date}>{formatDay(group.date, lang)}</time>
            </h2>
            <ul>
              {group.items.map((item) => (
                <li key={item.id} className="nv-item">
                  <h3 className="nv-t">{item.title[lang]}</h3>
                  <p className="nv-p">{item.text[lang]}</p>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </main>
    </BlogShell>
  );
};

export default Novidades;
