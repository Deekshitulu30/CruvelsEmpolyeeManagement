-- =====================================================
-- Migration 005: Enterprise Security Suite
-- Append-Only Audit Logs, Idempotency & Webhooks
-- =====================================================

-- 1. Enforce Append-Only Audit Logs (Prevent UPDATE and DELETE even for admins)
CREATE OR REPLACE FUNCTION prevent_audit_log_modification()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Security Policy Violation: audit_logs table is append-only. UPDATE and DELETE operations are forbidden.';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_audit_logs_append_only ON audit_logs;
CREATE TRIGGER trg_audit_logs_append_only
BEFORE UPDATE OR DELETE ON audit_logs
FOR EACH ROW
EXECUTE FUNCTION prevent_audit_log_modification();

-- 2. Idempotency Keys table for reimbursement claims & state changes
CREATE TABLE IF NOT EXISTS idempotency_keys (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key             VARCHAR(255) NOT NULL UNIQUE,
    user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
    request_path    VARCHAR(255) NOT NULL,
    request_params  JSONB,
    response_code   INT NOT NULL,
    response_body   JSONB NOT NULL,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_idempotency_keys_key ON idempotency_keys(key);
CREATE INDEX IF NOT EXISTS idx_idempotency_created_at ON idempotency_keys(created_at);

-- 3. Webhook Events table for signature verification & reconciliation
CREATE TABLE IF NOT EXISTS webhook_events (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id        VARCHAR(255) NOT NULL UNIQUE,
    provider        VARCHAR(50) NOT NULL,
    event_type      VARCHAR(100) NOT NULL,
    payload         JSONB NOT NULL,
    signature       VARCHAR(255) NOT NULL,
    processed       BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_webhook_events_event_id ON webhook_events(event_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_created_at ON webhook_events(created_at);

-- 4. Add requires_2fa to users (Admin accounts require mandatory 2FA)
ALTER TABLE users
ADD COLUMN IF NOT EXISTS requires_2fa BOOLEAN NOT NULL DEFAULT FALSE;

-- Ensure all ADMIN users have requires_2fa set to TRUE
UPDATE users SET requires_2fa = TRUE WHERE role = 'ADMIN';
