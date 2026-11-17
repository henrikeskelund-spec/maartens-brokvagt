CREATE TABLE IF NOT EXISTS subscription (
  endpoint TEXT PRIMARY KEY,
  token_hash TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  last_slot TEXT NOT NULL DEFAULT '',
  created_at INTEGER NOT NULL
);
