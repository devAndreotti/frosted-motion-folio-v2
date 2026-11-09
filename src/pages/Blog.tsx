import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Search, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import BlogShell from '@/components/blog/BlogShell';
import MostRead from '@/components/blog/MostRead';
import NewsletterForm from '@/components/blog/NewsletterForm';
import { localize, posts as originals } from '@/lib/blog/catalog';
import { PAGE_SIZE, collectTags, filterPosts, formatDay, groupByYear } from '@/lib/blog/list';
import { BLOG_TITLE } from '@/lib/blog/page';
import type { PostMeta } from '@/lib/blog/types';

// Fallback search target for external DuckDuckGo queries
const SEARCH_SITE = 'devandreotti.com';
const TOP_TAGS_COUNT = 6;

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

/** /blog/: instant search, smart tag filter, card grid, newest post, the archive by year. */
const Blog = () => {
  const { lang, t } = useLanguage();
  const b = t.blog;
  const [params, setParams] = useSearchParams();

  const posts = originals.map((post) => localize(post, lang));
  const tags = collectTags(posts);
  const tagParam = params.get('tag');
  const tag = tags.includes(tagParam ?? '') ? tagParam : null;

  const urlQuery = params.get('q') ?? '';
  const [query, setQuery] = useState(urlQuery);
  const [expandedTags, setExpandedTags] = useState(false);
  const [limit, setLimit] = useState(PAGE_SIZE);

  useEffect(() => {
    setQuery(urlQuery);
  }, [urlQuery]);

  const all = filterPosts(posts, tag, query);
  const shown = all.slice(0, limit);

  const pick = (nextTag: string | null) => {
    const nextParams = new URLSearchParams();
    if (nextTag) nextParams.set('tag', nextTag);
    if (query.trim()) nextParams.set('q', query.trim());
    setParams(nextParams, { replace: true });
    setLimit(PAGE_SIZE);
  };

  const handleSearch = (nextQuery: string) => {
    setQuery(nextQuery);
    const nextParams = new URLSearchParams();
    if (tag) nextParams.set('tag', tag);
    if (nextQuery.trim()) nextParams.set('q', nextQuery.trim());
    setParams(nextParams, { replace: true });
    setLimit(PAGE_SIZE);
  };

  const clearAll = () => {
    setQuery('');
    setParams({}, { replace: true });
    setLimit(PAGE_SIZE);
  };

  const hasMoreTags = tags.length > TOP_TAGS_COUNT;
  const topTags = tags.slice(0, TOP_TAGS_COUNT);
  const visibleTags = expandedTags
    ? tags
    : tag && !topTags.includes(tag)
      ? [...topTags, tag]
      : topTags;

  const externalSearchHref = `https://duckduckgo.com/?q=${encodeURIComponent(
    query.trim() ? `site:${SEARCH_SITE} ${query.trim()}` : `site:${SEARCH_SITE}`
  )}`;

  return (
    <BlogShell title={BLOG_TITLE}>
      <main className="wrap blog-main bl">
        <p className="eyebrow">
          <span className="chip">~/blog</span>
        </p>
        <h1 className="blog-h">{b.pageTitle}</h1>
        <p className="lead">{b.pageLead}</p>
        {b.langNote && <p className="blog-note">{b.langNote}</p>}

        <form
          className="blog-search glass"
          action="https://duckduckgo.com/"
          method="get"
          target="_blank"
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
          }}
        >
          <input type="hidden" name="sites" value={SEARCH_SITE} />
          <label htmlFor="blog-q" className="blog-search-i">
            <Search className="ic" aria-hidden="true" />
            <span className="sr-only">{b.searchLabel}</span>
          </label>
          <input
            id="blog-q"
            name="q"
            type="search"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder={b.searchPlaceholder}
            autoComplete="off"
          />
          {query && (
            <button
              type="button"
              className="blog-search-clear"
              onClick={() => handleSearch('')}
              aria-label={lang === 'pt' ? 'Limpar busca' : 'Clear search'}
            >
              <X className="ic s" aria-hidden="true" />
            </button>
          )}
          <a
            href={externalSearchHref}
            target="_blank"
            rel="noopener noreferrer"
            className="blog-search-ext"
            title={b.searchHint}
          >
            <span>{b.searchExternal}</span>
            <ArrowUpRight className="ic s" aria-hidden="true" />
          </a>
        </form>
        <p className="blog-hint">{b.searchHint}</p>

        {tags.length > 0 && (
          <div className="blog-tags" role="group" aria-label={b.tagsLabel}>
            <button
              type="button"
              aria-pressed={tag === null}
              className={tag === null ? 'on' : ''}
              onClick={() => pick(null)}
            >
              {b.allTags}
            </button>
            {visibleTags.map((name) => (
              <button
                key={name}
                type="button"
                aria-pressed={tag === name}
                className={tag === name ? 'on' : ''}
                onClick={() => pick(tag === name ? null : name)}
              >
                #{name}
              </button>
            ))}
            {hasMoreTags && (
              <button
                type="button"
                className="blog-tags-more"
                onClick={() => setExpandedTags((v) => !v)}
              >
                {expandedTags ? b.collapseTags : b.expandTags(tags.length - TOP_TAGS_COUNT)}
              </button>
            )}
          </div>
        )}

        {(tag || query.trim()) && (
          <div className="blog-filter-status" role="status">
            <span>
              {tag && query.trim()
                ? b.showingBoth(all.length, tag, query.trim())
                : tag
                  ? b.showingTag(all.length, tag)
                  : b.showingSearch(all.length, query.trim())}
            </span>
            <button type="button" className="btn btn-gh btn-sm" onClick={clearAll}>
              {b.clearFilters}
            </button>
          </div>
        )}

        {posts.length === 0 && <p className="blog-empty">{b.empty}</p>}
        {posts.length > 0 && all.length === 0 && <p className="blog-empty">{b.emptyTag}</p>}
        {!tag && !query.trim() && posts[0] && <Featured post={posts[0]} />}
        {!tag && !query.trim() && <MostRead />}

        {groupByYear(shown).map((group) => (
          <section key={group.year} className="blog-year" aria-labelledby={`y-${group.year}`}>
            <h2 id={`y-${group.year}`}>
              {group.year} · {b.postsCount(group.posts.length)}
            </h2>
            <div className="blog-grid">
              {group.posts.map((post) => (
                <article key={post.slug} className="blog-card blog-row glass">
                  <Link to={`/blog/${post.slug}/`} className="blog-card-link">
                    {post.image && (
                      <div className="blog-card-media">
                        <img src={post.image} alt="" className="blog-card-thumb" loading="lazy" />
                      </div>
                    )}
                    <div className="blog-card-content">
                      <div className="blog-card-meta">
                        <time dateTime={post.date}>{formatDay(post.date, lang)}</time>
                        <span className="blog-card-dot" aria-hidden="true">•</span>
                        <span className="blog-card-read">{b.minutes(post.minutes)}</span>
                      </div>
                      <h3 className="blog-card-h blog-row-t">{post.title}</h3>
                      {post.description && <p className="blog-card-p">{post.description}</p>}
                    </div>
                  </Link>
                  {post.tags.length > 0 && (
                    <div className="blog-card-tags" role="group" aria-label={b.tagsLabel}>
                      {post.tags.map((tName) => (
                        <button
                          key={tName}
                          type="button"
                          aria-label={`Tag #${tName}`}
                          className={`blog-card-tag ${tag === tName ? 'on' : ''}`}
                          onClick={() => pick(tag === tName ? null : tName)}
                        >
                          #{tName}
                        </button>
                      ))}
                    </div>
                  )}
                </article>
              ))}
            </div>
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