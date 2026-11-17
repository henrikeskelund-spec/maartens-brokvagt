CREATE TABLE IF NOT EXISTS club_report (
  id TEXT PRIMARY KEY,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS club_report_created_at ON club_report(created_at);
CREATE TABLE IF NOT EXISTS club_subscription (
  endpoint TEXT PRIMARY KEY,
  token_hash TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL
);
