-- Idempotent delivery records prevent a scraper retry from sending the same
-- result alert twice. No recipient emails are stored in this operational log.

CREATE TABLE IF NOT EXISTS notification_delivery_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_key TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL CHECK (category IN ('results')),
  status TEXT NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'sent', 'partial', 'failed')),
  item_count INTEGER NOT NULL CHECK (item_count > 0),
  recipient_count INTEGER NOT NULL DEFAULT 0,
  sent_count INTEGER NOT NULL DEFAULT 0,
  error_count INTEGER NOT NULL DEFAULT 0,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_notification_delivery_runs_status
  ON notification_delivery_runs (status, started_at DESC);

ALTER TABLE notification_delivery_runs ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE notification_delivery_runs FROM anon, authenticated;

COMMENT ON TABLE notification_delivery_runs IS 'Private aggregate alert-delivery records. It deliberately does not store recipient email addresses.';
