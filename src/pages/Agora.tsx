import { useLanguage } from '@/contexts/LanguageContext';
import BlogShell, { HOME } from '@/components/blog/BlogShell';
import { AGORA_COPY, NOW_ARCHIVE } from '@/data/now-archive';
import { NOW_ALSO, NOW_PROJECTS, NOW_UPDATED } from '@/data/now';

/** /agora/ -- what the Now section shows today, and the earlier versions by date. */
const Agora = () => {
  const { lang } = useLanguage();
  const c = AGORA_COPY[lang];
  const fmt = (iso: string) => new Date(`${iso}T12:00:00`).toLocaleDateString(lang === 'en' ? 'en-US' : 'pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
  const [current, ...older] = NOW_ARCHIVE;
  const names = [...NOW_PROJECTS.map((p) => ({ name: p.title, note: p.status[lang] })), ...NOW_ALSO.map((a) => ({ name: a.name, note: a.note[lang] }))];

  return (
    <BlogShell title={`${c.title} — Ricardo A. Gonçalves`}>
      <main className="wrap blog-main ag" lang={lang === 'en' ? 'en' : 'pt-BR'}>
        <header>
          <p className="lbl">{c.kicker}</p>
          <h1>{c.h1}</h1>
          <p className="blog-lead">{c.lead}</p>
          <p className="now-upd">
            <time dateTime={NOW_UPDATED}>{c.updated(fmt(NOW_UPDATED))}</time>
          </p>
        </header>

        <section aria-labelledby="ag-current">
          <h2 id="ag-current">{c.currentTitle}</h2>
          <p>{current.summary[lang]}</p>
          <ul className="ag-list">
            {names.map((item) => (
              <li key={item.name}>
                <strong>{item.name}</strong> <span>{item.note}</span>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="ag-archive">
          <h2 id="ag-archive">{c.archiveTitle}</h2>
          <p>{c.archiveLead}</p>
          <ol className="ag-archive">
            {older.map((v) => (
              <li key={v.date}>
                <time dateTime={v.date}>{fmt(v.date)}</time>
                <p>{v.summary[lang]}</p>
                <p className="ag-items">{v.items.join(' · ')}</p>
              </li>
            ))}
          </ol>
        </section>

        <p className="blog-note">
          <a href={HOME}>{c.backHome}</a>
        </p>
      </main>
    </BlogShell>
  );
};

export default Agora;
