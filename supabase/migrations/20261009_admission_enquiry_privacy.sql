-- Minimise retention of student contact details submitted through college enquiries.
ALTER TABLE leads ADD COLUMN IF NOT EXISTS consent_at TIMESTAMPTZ;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS retention_expires_at TIMESTAMPTZ;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS consent_purpose TEXT;

-- Historical rows receive an expiry but are not retroactively marked as consented.
UPDATE leads
SET retention_expires_at = COALESCE(created_at, NOW()) + INTERVAL '180 days'
WHERE retention_expires_at IS NULL;

ALTER TABLE leads ALTER COLUMN consent_at SET DEFAULT NOW();
ALTER TABLE leads ALTER COLUMN retention_expires_at SET DEFAULT (NOW() + INTERVAL '180 days');
ALTER TABLE leads ALTER COLUMN consent_purpose SET DEFAULT 'admission_enquiry_v1';

CREATE INDEX IF NOT EXISTS idx_leads_retention_expiry ON leads(retention_expires_at);

CREATE OR REPLACE FUNCTION purge_expired_admission_enquiries()
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE removed BIGINT;
BEGIN
  DELETE FROM leads WHERE retention_expires_at IS NOT NULL AND retention_expires_at < NOW();
  GET DIAGNOSTICS removed = ROW_COUNT;
  RETURN removed;
END;
$$;

REVOKE ALL ON FUNCTION purge_expired_admission_enquiries() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION purge_expired_admission_enquiries() TO service_role;

COMMENT ON COLUMN leads.consent_at IS 'Time the student explicitly consented to this admission enquiry.';
COMMENT ON COLUMN leads.retention_expires_at IS 'Normal deletion deadline for admission-enquiry contact information.';
COMMENT ON FUNCTION purge_expired_admission_enquiries() IS 'Deletes admission enquiries after their normal 180-day retention period; invoke with a protected scheduled service-role job.';
