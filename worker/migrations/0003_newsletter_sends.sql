-- Newsletter issues sent from the Tower panel (worker/admin.js, actions preview/send). One row per
-- (issue, reader): `sending` is written before the mail leaves, `sent` after it did, `failed` when it did not
-- (retried up to 3 attempts). The reader is identified only by SHA-256 of the lower-case address, never the
-- address. Rows go with the subscriber: unsubscribing, an admin delete and the purge of unconfirmed sign-ups
-- delete the rows of that hash, so nothing is kept about who left.
CREATE TABLE IF NOT EXISTS newsletter_sends (
  issue_id   TEXT    NOT NULL,
  email_hash TEXT    NOT NULL,                    -- SHA-256 hex of the lower-case e-mail
  status     TEXT    NOT NULL,                    -- sending | sent | failed
  attempts   INTEGER NOT NULL DEFAULT 0,
  updated_at INTEGER NOT NULL,
  PRIMARY KEY (issue_id, email_hash)
) WITHOUT ROWID;

CREATE INDEX IF NOT EXISTS newsletter_sends_email_hash ON newsletter_sends (email_hash);
