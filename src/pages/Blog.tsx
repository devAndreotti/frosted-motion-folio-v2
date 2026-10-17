import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, Search } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import BlogShell from '@/components/blog/BlogShell';
import MostRead from '@/components/blog/MostRead';
import NewsletterForm from '@/components/blog/NewsletterForm';
import { localize, posts as originals } from '@/lib/blog/catalog';
import { PAGE_SIZE, collectTags, filterByTag, formatDay, groupByYear } from '@/lib/blog/list';
import { BLOG_TITLE } from '@/lib/blog/page';
import type { PostMeta } from '@/lib/blog/types';

// What the DuckDuckGo box searches: the posts as DuckDuckGo indexed them.
const SEARCH_SITE = 'devandreotti.com';

const Tags = ({ tags }: { tags: string[] }) => (
  <span className="blog-row-tags">{tags.map((tag) => `#${tag}`).join(' ')}</span>
);

const Featured = ({ post }: { post: PostMeta }) => {
  const { lang, t } = useLanguage();
  return (
    <Link to={`/blog/${post.slug}/`} className="blog-feat glass">
      <span className="blog-feat-k">
        {t.blog.latest} · {formatDay(post.date, lang)}
      </span>
      <span className="blog-feat-h">{post.title}</span>
      {post.description && <span className="blog-feat-p">{post.description}</span>}
      <span className="blog-feat-cta">
        {t.blog.readPost}
        <ArrowRight className="ic s" />
      </span>
    </Link>
  );
};

/** /blog/: DuckDuckGo search, tag filter (?tag=, so a filtered list can be linked), newest post, the archive by year. */
const Blog = () => {
  const { lang, t } = useLanguage();
  const b = t.blog;
  const [params, setParams] = useSearchParams();
  const posts = originals.map((post) => localize(post, lang));
  const tags = collectTags(posts);
  const tag = tags.includes(params.get('tag') ?? '') ? params.get('tag') : null;
  const [limit, setLimit] = useState(PAGE_SIZE);
  const all = filterByTag(posts, tag);
  const shown = all.slice(0, limit);
  const pick = (next: string | null) => setParams(next ? { tag: next } : {}, { replace: true });

  return (
    <BlogShell title={BLOG_TITLE}>
      <main className="wrap blog-main">
        <p className="eyebrow">
          <span className="chip">~/blog</span>
        </p>
        <h1 className="blog-h">{b.pageTitle}</h1>
        <p className="lead">{b.pageLead}</p>
        {b.langNote && <p className="blog-note">{b.langNote}</p>}

        <form className="blog-search glass" action="https://duckduckgo.com/" method="get" target="_blank" role="search">
          <input type="hidden" name="sites" value={SEARCH_SITE} />
          <label htmlFor="blog-q" className="blog-search-i">
            <Search className="ic" aria-hidden="true" />
            <span className="sr-only">{b.searchLabel}</span>
          </label>
          <input id="blog-q" name="q" type="search" required placeholder={b.searchPlaceholder} />
          <button type="submit" className="btn btn-pri btn-sm">
            {b.searchButton}
          </button>
        </form>
        <p className="blog-hint">{b.searchHint}</p>

        {tags.length > 0 && (
          <div className="blog-tags" role="group" aria-label={b.tagsLabel}>
            <button type="button" aria-pressed={tag === null} className={tag === null ? 'on' : ''} onClick={() => pick(null)}>
              {b.allTags}
            </button>
            {tags.map((name) => (
              <button key={name} type="button" aria-pressed={tag === name} className={tag === name ? 'on' : ''} onClick={() => pick(name)}>
                #{name}
              </button>
            ))}
          </div>
        )}

        {posts.length === 0 && <p className="blog-empty">{b.empty}</p>}
        {posts.length > 0 && all.length === 0 && <p className="blog-empty">{b.emptyTag}</p>}
        {!tag && posts[0] && <Featured post={posts[0]} />}
        {!tag && <MostRead />}

        {groupByYear(shown).map((group) => (
          <section key={group.year} className="blog-year" aria-labelledby={`y-${group.year}`}>
            <h2 id={`y-${group.year}`}>
              {group.year} · {b.postsCount(group.posts.length)}
            </h2>
            <ul>
              {group.posts.map((post) => (
                <li key={post.slug}>
                  <Link to={`/blog/${post.slug}/`} className="blog-row">
                    <time dateTime={post.date}>{formatDay(post.date, lang, false)}</time>
                    <span className="blog-row-t">{post.title}</span>
                    <Tags tags={post.tags} />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}

        {all.length > shown.length && (
          <div className="blog-more">
            <button type="button" className="btn btn-gh btn-sm" onClick={() => setLimit((n) => n + PAGE_SIZE)}>
              {b.loadMore}
            </button>
          </div>
        )}

        <NewsletterForm />
      </main>
    </BlogShell>
  );
};

export default Blog;
