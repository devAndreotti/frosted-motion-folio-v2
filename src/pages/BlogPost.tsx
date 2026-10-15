import { lazy, Suspense, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import BlogShell from '@/components/blog/BlogShell';
import LikeBar from '@/components/blog/LikeBar';
import NewsletterForm from '@/components/blog/NewsletterForm';
import { findPost, hasTranslation, loadPostBody, localize, posts } from '@/lib/blog/catalog';
import { formatDay, neighbours } from '@/lib/blog/list';
import type { TocEntry } from '@/lib/blog/markdown';

const NotFound = lazy(() => import('./NotFound'));

type Body = { status: 'loading' } | { status: 'error' } | { status: 'ready'; html: string; toc: TocEntry[]; lang: 'pt' | 'en' };

/** /blog/:slug/ -- the post's text (its own chunk), table of contents, likes and the posts around it. */
const BlogPost = () => {
  const { slug } = useParams();
  const { lang, t } = useLanguage();
  const b = t.blog;
  const post = findPost(slug);
  const [body, setBody] = useState<Body>({ status: 'loading' });

  useEffect(() => {
    if (!post) return;
    let alive = true;
    setBody({ status: 'loading' });
    window.scrollTo(0, 0);
    loadPostBody(post.slug, lang)
      .then(({ html, toc, lang: served }) => alive && setBody({ status: 'ready', html, toc, lang: served }))
      .catch(() => alive && setBody({ status: 'error' }));
    return () => {
      alive = false;
    };
  }, [post, lang]);

  if (!post) {
    return (
      <Suspense fallback={null}>
        <NotFound />
      </Suspense>
    );
  }

  const { newer, older } = neighbours(posts, post.slug);
  const toc = body.status === 'ready' ? body.toc : [];
  const shown = localize(post, lang);
  const served = body.status === 'ready' ? body.lang : lang;
  // an English visitor reading a post that has no English version, or one that was translated by AI
  const note = lang === 'en' ? (hasTranslation(post.slug) ? b.translatedNote : b.ptOnly) : '';

  return (
    <BlogShell title={`${shown.title} — Ricardo A. Gonçalves`}>
      <div className="wrap post-layout">
        <article className="post" lang={served === 'en' ? 'en' : 'pt-BR'}>
          <Link to="/blog/" className="post-back">
            <ArrowLeft className="ic s" aria-hidden="true" />
            {b.back}
          </Link>
          <h1 className="post-h">{shown.title}</h1>
          <p className="post-meta">
            <time dateTime={post.date}>{formatDay(post.date, lang)}</time>
            <span aria-hidden="true">·</span>
            <span>{b.minutes(shown.minutes)}</span>
            {post.tags.map((tag) => (
              <Link key={tag} to={`/blog/?tag=${encodeURIComponent(tag)}`} className="post-tag">
                #{tag}
              </Link>
            ))}
          </p>
          {note && <p className="blog-note">{note}</p>}

          {body.status === 'ready' && <div className="prose" dangerouslySetInnerHTML={{ __html: body.html }} />}
          {body.status === 'loading' && <div className="prose-ph" aria-busy="true" />}
          {body.status === 'error' && <p className="blog-empty">{b.loadError}</p>}

          <LikeBar slug={post.slug} title={shown.title} />
          <NewsletterForm />

          {(newer || older) && (
            <nav className="post-nav" aria-label={b.pageTitle}>
              {older ? (
                <Link to={`/blog/${older.slug}/`} className="glass">
                  <span className="k">← {b.older}</span>
                  <span>{localize(older, lang).title}</span>
                </Link>
              ) : (
                <span />
              )}
              {newer && (
                <Link to={`/blog/${newer.slug}/`} className="glass post-nav-r">
                  <span className="k">{b.newer} →</span>
                  <span>{localize(newer, lang).title}</span>
                </Link>
              )}
            </nav>
          )}
        </article>

        {toc.length > 1 && (
          <aside className="toc" aria-label={b.onThisPage}>
            <p className="k">{b.onThisPage}</p>
            {toc.map((entry) => (
              <a key={entry.id} href={`#${entry.id}`}>
                {entry.text}
              </a>
            ))}
          </aside>
        )}
      </div>
    </BlogShell>
  );
};

export default BlogPost;
