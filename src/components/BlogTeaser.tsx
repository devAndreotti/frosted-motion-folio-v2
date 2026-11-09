import { ArrowRight, Rss } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { posts } from '@/lib/blog/catalog';
import { formatDay } from '@/lib/blog/list';

const BLOG = `${import.meta.env.BASE_URL}blog/`;
const SHOWN = 3;

/** The home page's "Writing" section: the newest posts and the way into /blog/. Nothing until a post is out. */
const BlogTeaser = () => {
  const { lang, t } = useLanguage();
  const b = t.blog;
  if (posts.length === 0) return null;

  return (
    <section className="wrap sec" aria-labelledby="h-blog">
      <div className="sh">
        <div>
          <p className="lbl">{b.sectionLabel}</p>
          <h2 id="h-blog" className="h2">
            {b.teaserTitle}
          </h2>
          <p className="sub">{b.teaserSub}</p>
        </div>
        <div className="sh-r">
          <a className="btn btn-pri btn-sm" href={BLOG}>
            {b.seeAll}
            <ArrowRight className="ic s" />
          </a>
          <a className="btn btn-gh btn-sm" href={`${BLOG}rss.xml`}>
            <Rss className="ic s" aria-hidden="true" />
            RSS
          </a>
        </div>
      </div>

      <div className="teaser">
        {posts.slice(0, SHOWN).map((post) => (
          <a key={post.slug} href={`${BLOG}${post.slug}/`} className="teaser-c glass">
            {post.image && (
              <div className="teaser-media">
                <img src={post.image} alt="" className="teaser-thumb" loading="lazy" />
              </div>
            )}
            <div className="teaser-m">
              <time dateTime={post.date}>{formatDay(post.date, lang)}</time>
              <span className="teaser-dot" aria-hidden="true">•</span>
              <span className="teaser-read">{b.minutes(post.minutes)}</span>
            </div>
            <h3 className="teaser-h">{post.title}</h3>
            {post.description && <p className="teaser-p">{post.description}</p>}
            {post.tags.length > 0 && (
              <div className="blog-card-tags teaser-tags">
                {post.tags.map((tag) => (
                  <span key={tag} className="blog-card-tag">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </a>
        ))}
      </div>
    </section>
  );
};

export default BlogTeaser;
