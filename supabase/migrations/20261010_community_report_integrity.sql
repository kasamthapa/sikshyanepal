-- Keep the moderation queue free of duplicate open reports and support
-- account-based rate checks without exposing reporter identities publicly.

DELETE FROM community_reports newer
USING community_reports older
WHERE newer.reporter_id IS NOT NULL
  AND newer.reporter_id = older.reporter_id
  AND newer.target_type = older.target_type
  AND newer.target_id = older.target_id
  AND newer.status = 'open'
  AND older.status = 'open'
  AND (
    newer.created_at > older.created_at
    OR (newer.created_at = older.created_at AND newer.id::text > older.id::text)
  );

CREATE UNIQUE INDEX IF NOT EXISTS idx_community_reports_one_open_per_user
  ON community_reports(reporter_id, target_type, target_id)
  WHERE status = 'open' AND reporter_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_community_reports_reporter_rate
  ON community_reports(reporter_id, created_at DESC)
  WHERE reporter_id IS NOT NULL;

COMMENT ON INDEX idx_community_reports_one_open_per_user IS
  'Prevents one account from creating concurrent duplicate open reports for the same content.';
