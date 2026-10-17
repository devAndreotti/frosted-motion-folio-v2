import { useLanguage } from '@/contexts/LanguageContext';
import BlogShell from '@/components/blog/BlogShell';
import UsesCategory from '@/components/uses/UsesCategory';
import { USES_CATEGORIES, USES_COPY } from '@/data/uses';
import '@/styles/uses.css';

/** /uses/ -- the tools and hardware I use day to day, with the reason for each pick, in the visitor's language. */
const Uses = () => {
  const { lang } = useLanguage();
  const copy = USES_COPY[lang];
  return (
    <BlogShell title={`${copy.title} — Ricardo A. Gonçalves`}>
      <main className="wrap blog-main us" lang={lang === 'en' ? 'en' : 'pt-BR'}>
        <header className="us-hero">
          <span className="lbl">{copy.kicker}</span>
          <h1 className="us-h1">{copy.h1}</h1>
          <p className="us-lead">{copy.lead}</p>
        </header>
        {USES_CATEGORIES.map((category) => (
          <UsesCategory key={category.id} category={category} lang={lang} />
        ))}
        <p className="blog-note">{copy.updated}</p>
      </main>
    </BlogShell>
  );
};

export default Uses;
