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
            <span className="teaser-m">
              <time dateTime={post.date}>{formatDay(post.date, lang)}</time>
              <span>{post.minutes} min</span>
            </span>
            <span className="teaser-h">{post.title}</span>
            {post.description && <span className="teaser-p">{post.description}</span>}
            <span className="tags">
              {post.tags.map((tag) => (
                <span key={tag} className="tag">
                  #{tag}
                </span>
              ))}
            </span>
          </a>
        ))}
      </div>
    </section>
  );
};

export default BlogTeaser;
