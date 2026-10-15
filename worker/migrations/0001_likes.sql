-- Likes on blog posts (worker/likes.js). One row per visitor per post: the primary key
-- is what makes a second like from the same visitor impossible, even under concurrent clicks.
-- voter = SHA-256(IP + User-Agent + LIKES_SALT); the IP itself is never stored.
CREATE TABLE IF NOT EXISTS likes (
  slug  TEXT    NOT NULL,
  voter TEXT    NOT NULL,
  at    INTEGER NOT NULL,
  PRIMARY KEY (slug, voter)
) WITHOUT ROWID;

-- the per-visitor rate limit looks up a visitor's recent likes
CREATE INDEX IF NOT EXISTS likes_voter_at ON likes (voter, at);
