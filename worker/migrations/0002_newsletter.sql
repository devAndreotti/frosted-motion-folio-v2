-- Newsletter subscribers (worker/newsletter.js). Double opt-in: a row is `pending` until the
-- reader opens the link in the confirmation e-mail, then `active`. Leaving deletes the row (nothing
-- is kept about who left), and a `pending` row nobody confirmed is deleted after 7 days.
CREATE TABLE IF NOT EXISTS subscribers (
  email           TEXT    NOT NULL PRIMARY KEY,   -- lower-case
  lang            TEXT    NOT NULL DEFAULT 'pt',  -- pt | en: the language of what they receive
  status          TEXT    NOT NULL,               -- pending | active
  confirm_token   TEXT    NOT NULL,
  unsub_token     TEXT    NOT NULL,
  created_at      INTEGER NOT NULL,
  confirm_sent_at INTEGER NOT NULL,               -- 0 = the last send failed, try again at once
  confirmed_at    INTEGER
) WITHOUT ROWID;

CREATE UNIQUE INDEX IF NOT EXISTS subscribers_confirm_token ON subscribers (confirm_token);
CREATE UNIQUE INDEX IF NOT EXISTS subscribers_unsub_token ON subscribers (unsub_token);
CREATE INDEX IF NOT EXISTS subscribers_status ON subscribers (status);

-- sign-up attempts per visitor (SHA-256 of the network + salt, never the IP) for the rate limit
CREATE TABLE IF NOT EXISTS subscribe_hits (
  voter TEXT    NOT NULL,
  at    INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS subscribe_hits_voter_at ON subscribe_hits (voter, at);
CREATE INDEX IF NOT EXISTS subscribe_hits_at ON subscribe_hits (at);
