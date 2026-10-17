import { useLanguage } from '@/contexts/LanguageContext';
import BlogShell from '@/components/blog/BlogShell';
import UsesCategory from '@/components/uses/UsesCategory';
import { USES_CATEGORIES, USES_COPY, USES_INDEX, USES_STRINGS } from '@/data/uses';
import '@/styles/uses.css';

/** /uses/ -- the tools and hardware I use day to day, with the reason for each pick, in the visitor's language. */
const Uses = () => {
  const { lang } = useLanguage();
  const copy = USES_COPY[lang];
  const strings = USES_STRINGS[lang];
  const groups = USES_INDEX.map((group) => {
    const categories = USES_CATEGORIES.filter((category) => group.categoryIds.includes(category.id));
    return {
      anchor: group.anchor,
      categories,
      label: categories.length > 1 ? strings.editorTerminal : (categories[0]?.label[lang] ?? ''),
      count: categories.reduce((total, category) => total + category.items.length, 0),
    };
  });
  return (
    <BlogShell title={`${copy.title} — Ricardo A. Gonçalves`}>
      <main className="wrap blog-main us" lang={lang === 'en' ? 'en' : 'pt-BR'}>
        <header className="us-hero">
          <span className="lbl">{copy.kicker}</span>
          <h1 className="us-h1">{copy.h1}</h1>
          <p className="us-lead">{copy.lead}</p>
          <nav className="us-idx" aria-label={strings.indexLabel}>
            {groups.map((group) => (
              <a key={group.anchor} href={`#${group.anchor}`}>
                {group.label}
                <span>{group.count}</span>
              </a>
            ))}
          </nav>
        </header>
        {groups.map((group) => (
          <div key={group.anchor} id={group.anchor} className="us-group">
            {group.categories.map((category) => (
              <UsesCategory key={category.id} category={category} lang={lang} />
            ))}
          </div>
        ))}
        <p className="blog-note">{copy.updated}</p>
      </main>
    </BlogShell>
  );
};

export default Uses;
