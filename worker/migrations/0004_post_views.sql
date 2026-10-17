-- Reads of blog posts (worker/views.js): one counter per published post, bumped by the page's view beacon.
-- Only a number per post is kept: no IP, no cookie, no visitor id. The list "Mais lidos" on /blog/ shows
-- once the total reaches MOST_READ_MIN_VIEWS (worker/views.js).
CREATE TABLE IF NOT EXISTS post_views (
  slug  TEXT    NOT NULL PRIMARY KEY,
  views INTEGER NOT NULL DEFAULT 0
);
