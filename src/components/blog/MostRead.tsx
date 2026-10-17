import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { localize, posts as catalog } from '@/lib/blog/catalog';
import { fetchMostRead, type MostReadAnswer } from '@/lib/blog/mostRead';

/** "Mais lidos" on /blog/: the five most read posts, shown only once the Worker says the blog has enough reads. */
const MostRead = () => {
  const { lang, t } = useLanguage();
  const b = t.blog;
  const [answer, setAnswer] = useState<MostReadAnswer | null>(null);

  useEffect(() => {
    let alive = true;
    fetchMostRead().then((next) => alive && setAnswer(next));
    return () => {
      alive = false;
    };
  }, []);

  if (!answer?.enabled) return null;
  const rows = answer.posts.flatMap((entry) => {
    const post = catalog.find((p) => p.slug === entry.slug);
    return post ? [{ entry, post }] : [];
  });
  if (rows.length === 0) return null;

  return (
    <section className="blog-most" aria-labelledby="blog-most-h">
      <h2 id="blog-most-h">{b.mostReadTitle}</h2>
      <p className="blog-most-sub">{b.mostReadSub}</p>
      <ol>
        {rows.map(({ entry, post }) => {
          const shown = localize(post, lang);
          return (
            <li key={entry.slug}>
              <Link to={`/blog/${post.slug}/`} className="blog-row">
                <span className="blog-row-t">{shown.title}</span>
                <span className="blog-most-n">{b.mostReadViews(entry.views)}</span>
              </Link>
            </li>
          );
        })}
      </ol>
    </section>
  );
};

export default MostRead;
