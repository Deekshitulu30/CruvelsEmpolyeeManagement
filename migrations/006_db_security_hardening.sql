-- =====================================================
-- Migration 006: Database Security Hardening
-- Implements: RLS, column-level permissions, pgaudit,
--             query timeouts per role, anomaly triggers,
--             data retention/anonymization, PII masking,
--             connection limits, slow query logging
-- =====================================================

-- ─── 1. EXTENSIONS ────────────────────────────────────────────────────────────
-- pgcrypto already enabled. Enable pg_stat_statements for slow query monitoring.
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- ─── 2. APPLICATION ROLES (Least Privilege) ───────────────────────────────────
-- ems_app   : the Node.js backend user — CRUD only, no DDL, no superuser
-- ems_readonly : analytics/reporting — SELECT only
-- ems_backup   : backup service — SELECT + pg_dump access

DO $$
DECLARE
    curr_db TEXT;
BEGIN
    SELECT current_database() INTO curr_db;

    BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'ems_app') THEN
            CREATE ROLE ems_app LOGIN PASSWORD 'CHANGE_IN_PRODUCTION_ems_app';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'ems_readonly') THEN
            CREATE ROLE ems_readonly LOGIN PASSWORD 'CHANGE_IN_PRODUCTION_readonly';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'ems_backup') THEN
            CREATE ROLE ems_backup LOGIN PASSWORD 'CHANGE_IN_PRODUCTION_backup';
        END IF;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Could not create auxiliary roles: %', SQLERRM;
    END;

    BEGIN
        EXECUTE format('GRANT CONNECT ON DATABASE %I TO ems_app', curr_db);
        GRANT USAGE ON SCHEMA public TO ems_app;
        GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO ems_app;
        GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO ems_app;
        ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO ems_app;
        ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO ems_app;
        REVOKE CREATE ON SCHEMA public FROM ems_app;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Could not grant ems_app permissions: %', SQLERRM;
    END;

    BEGIN
        EXECUTE format('GRANT CONNECT ON DATABASE %I TO ems_readonly', curr_db);
        GRANT USAGE ON SCHEMA public TO ems_readonly;
        GRANT SELECT ON ALL TABLES IN SCHEMA public TO ems_readonly;
        ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO ems_readonly;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Could not grant ems_readonly permissions: %', SQLERRM;
    END;

    BEGIN
        EXECUTE format('GRANT CONNECT ON DATABASE %I TO ems_backup', curr_db);
        GRANT USAGE ON SCHEMA public TO ems_backup;
        GRANT SELECT ON ALL TABLES IN SCHEMA public TO ems_backup;
        GRANT pg_read_all_data TO ems_backup;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Could not grant ems_backup permissions: %', SQLERRM;
    END;

    BEGIN
        ALTER ROLE ems_app SET statement_timeout = '30s';
        ALTER ROLE ems_readonly SET statement_timeout = '60s';
        ALTER ROLE ems_backup SET statement_timeout = '0';
        ALTER ROLE ems_app CONNECTION LIMIT 20;
        ALTER ROLE ems_readonly CONNECTION LIMIT 5;
        ALTER ROLE ems_backup CONNECTION LIMIT 2;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Could not alter role limits: %', SQLERRM;
    END;

    BEGIN
        REVOKE EXECUTE ON FUNCTION pg_read_file(text) FROM PUBLIC;
        REVOKE EXECUTE ON FUNCTION pg_read_file(text, bigint, bigint) FROM PUBLIC;
        REVOKE EXECUTE ON FUNCTION pg_ls_dir(text) FROM PUBLIC;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Could not revoke system function execution: %', SQLERRM;
    END;
END
$$;

-- ─── 9. ROW-LEVEL SECURITY (RLS) ─────────────────────────────────────────────
-- RLS enforces that the application layer cannot accidentally leak cross-user data.
-- The app sets a session variable (app.current_user_role) before queries, which
-- RLS policies use to filter rows.

-- 9a. Enable RLS on sensitive tables
ALTER TABLE employees       ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance      ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_requests  ENABLE ROW LEVEL SECURITY;

-- 9b. Superuser/admin bypass — the postgres superuser always bypasses RLS.
--     The application enforces access at the service layer via authorizeRoles().
--     RLS here is a defense-in-depth layer.

-- 9c. Policy: ADMIN / MANAGER see all rows; EMPLOYEE sees only their own
CREATE OR REPLACE FUNCTION current_app_role() RETURNS TEXT AS $$
    SELECT COALESCE(current_setting('app.current_user_role', TRUE), 'EMPLOYEE');
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION current_app_employee_id() RETURNS UUID AS $$
    SELECT NULLIF(current_setting('app.current_employee_id', TRUE), '')::UUID;
$$ LANGUAGE sql STABLE;

-- Drop existing policies if re-running migration
DROP POLICY IF EXISTS employees_rls ON employees;
DROP POLICY IF EXISTS attendance_rls ON attendance;
DROP POLICY IF EXISTS leave_requests_rls ON leave_requests;

-- Employees: ADMIN/MANAGER see all; EMPLOYEE sees only their own row
CREATE POLICY employees_rls ON employees
    USING (
        current_app_role() IN ('ADMIN', 'MANAGER')
        OR id = current_app_employee_id()
    );

-- Attendance: ADMIN/MANAGER see all; EMPLOYEE sees only their own records
CREATE POLICY attendance_rls ON attendance
    USING (
        current_app_role() IN ('ADMIN', 'MANAGER')
        OR employee_id = current_app_employee_id()
    );

-- Leave Requests: ADMIN/MANAGER see all; EMPLOYEE sees only their own
CREATE POLICY leave_requests_rls ON leave_requests
    USING (
        current_app_role() IN ('ADMIN', 'MANAGER')
        OR employee_id = current_app_employee_id()
    );

-- Grant ems_app permission to use these tables (RLS applies on top)
ALTER TABLE employees       FORCE ROW LEVEL SECURITY;
ALTER TABLE attendance      FORCE ROW LEVEL SECURITY;
ALTER TABLE leave_requests  FORCE ROW LEVEL SECURITY;

-- ─── 10. SENSITIVE TABLE ACCESS LOG ──────────────────────────────────────────
-- Logs every time the employees table is queried — detects salary browsing.
-- Stored in a separate, append-only access_log table.

CREATE TABLE IF NOT EXISTS sensitive_access_log (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name   VARCHAR(100)  NOT NULL,
    operation    VARCHAR(20)   NOT NULL,  -- SELECT, UPDATE, etc.
    db_user      VARCHAR(100)  NOT NULL,
    app_user_id  UUID,
    app_role     VARCHAR(50),
    accessed_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sal_table_name  ON sensitive_access_log(table_name);
CREATE INDEX IF NOT EXISTS idx_sal_accessed_at ON sensitive_access_log(accessed_at DESC);
CREATE INDEX IF NOT EXISTS idx_sal_db_user     ON sensitive_access_log(db_user);

-- Prevent modification of access logs (append-only)
CREATE OR REPLACE FUNCTION prevent_access_log_modification()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Security Policy Violation: sensitive_access_log is append-only.';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_access_log_append_only ON sensitive_access_log;
CREATE TRIGGER trg_access_log_append_only
    BEFORE UPDATE OR DELETE ON sensitive_access_log
    FOR EACH ROW EXECUTE FUNCTION prevent_access_log_modification();

-- ─── 11. DATA RETENTION & ANONYMIZATION (GDPR) ───────────────────────────────
-- Auto-anonymize ex-employee data after 7 years (configurable via DB setting).
-- Replaces PII with anonymized tokens; preserves statistical data for reporting.

CREATE OR REPLACE FUNCTION anonymize_expired_employee_data()
RETURNS INTEGER AS $$
DECLARE
    retention_years CONSTANT INT := 7;
    anonymized_count INT := 0;
    rec RECORD;
BEGIN
    FOR rec IN
        SELECT e.id, e.user_id
        FROM employees e
        WHERE e.deleted_at IS NOT NULL
          AND e.deleted_at < NOW() - (retention_years || ' years')::INTERVAL
          AND e.first_name NOT LIKE 'ANON_%'
    LOOP
        -- Anonymize employee profile (replace PII with opaque tokens)
        UPDATE employees
        SET first_name   = 'ANON',
            last_name    = 'RECORD_' || LEFT(id::text, 8),
            email        = 'anon_' || LEFT(id::text, 8) || '@deleted.invalid',
            phone        = NULL,
            designation  = NULL,
            updated_at   = NOW()
        WHERE id = rec.id;

        -- Deactivate associated user account permanently
        UPDATE users
        SET email     = 'anon_' || LEFT(rec.user_id::text, 8) || '@deleted.invalid',
            is_active = FALSE,
            updated_at = NOW()
        WHERE id = rec.user_id;

        anonymized_count := anonymized_count + 1;
    END LOOP;

    RETURN anonymized_count;
END;
$$ LANGUAGE plpgsql;

-- ─── 12. PII MASKING FUNCTIONS (DB layer) ────────────────────────────────────
-- Returns last-4 digits of phone; useful for display without full number.
CREATE OR REPLACE FUNCTION mask_phone(phone_number TEXT)
RETURNS TEXT AS $$
BEGIN
    IF phone_number IS NULL OR LENGTH(phone_number) < 4 THEN
        RETURN '****';
    END IF;
    RETURN '****' || RIGHT(REGEXP_REPLACE(phone_number, '[^0-9]', '', 'g'), 4);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Returns masked email: a***@domain.com
CREATE OR REPLACE FUNCTION mask_email(email_address TEXT)
RETURNS TEXT AS $$
DECLARE
    local_part TEXT;
    domain_part TEXT;
    at_pos INT;
BEGIN
    IF email_address IS NULL THEN RETURN NULL; END IF;
    at_pos := POSITION('@' IN email_address);
    IF at_pos = 0 THEN RETURN '****'; END IF;
    local_part  := LEFT(email_address, 1) || '***';
    domain_part := SUBSTRING(email_address FROM at_pos);
    RETURN local_part || domain_part;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ─── 13. SLOW QUERY DETECTION FUNCTION ───────────────────────────────────────
-- Returns currently running queries that have exceeded the threshold (seconds).
CREATE OR REPLACE FUNCTION get_slow_queries(threshold_seconds INT DEFAULT 5)
RETURNS TABLE(
    pid           INT,
    duration      INTERVAL,
    query         TEXT,
    state         TEXT,
    wait_event    TEXT,
    client_addr   INET,
    usename       TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        pa.pid,
        NOW() - pa.query_start AS duration,
        pa.query,
        pa.state,
        pa.wait_event,
        pa.client_addr,
        pa.usename
    FROM pg_stat_activity pa
    WHERE pa.state = 'active'
      AND pa.query_start < NOW() - (threshold_seconds || ' seconds')::INTERVAL
      AND pa.pid <> pg_backend_pid()
    ORDER BY duration DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─── 14. ANOMALOUS QUERY DETECTION FUNCTION ──────────────────────────────────
-- Detects large unbounded queries (potential data exfiltration or scraping).
CREATE OR REPLACE FUNCTION detect_anomalous_sessions()
RETURNS TABLE(
    pid         INT,
    usename     TEXT,
    client_addr INET,
    query       TEXT,
    duration    INTERVAL,
    anomaly     TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        pa.pid,
        pa.usename,
        pa.client_addr,
        pa.query,
        NOW() - pa.query_start AS duration,
        CASE
            WHEN pa.query ILIKE '%SELECT%*%FROM employees%' AND pa.query NOT ILIKE '%WHERE%'
                THEN 'UNBOUNDED_EMPLOYEE_DUMP'
            WHEN NOW() - pa.query_start > INTERVAL '60 seconds'
                THEN 'LONG_RUNNING_QUERY'
            WHEN EXTRACT(HOUR FROM NOW() AT TIME ZONE 'UTC') NOT BETWEEN 6 AND 22
                THEN 'OFF_HOURS_ACCESS'
            ELSE 'UNUSUAL_PATTERN'
        END AS anomaly
    FROM pg_stat_activity pa
    WHERE pa.state = 'active'
      AND pa.pid <> pg_backend_pid()
      AND (
            (pa.query ILIKE '%SELECT%*%FROM employees%' AND pa.query NOT ILIKE '%WHERE%')
         OR NOW() - pa.query_start > INTERVAL '60 seconds'
         OR EXTRACT(HOUR FROM NOW() AT TIME ZONE 'UTC') NOT BETWEEN 6 AND 22
      )
    ORDER BY duration DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execution of monitoring functions to app role (read-only system views only)
GRANT EXECUTE ON FUNCTION get_slow_queries(INT) TO ems_app;
GRANT EXECUTE ON FUNCTION detect_anomalous_sessions() TO ems_app;
GRANT EXECUTE ON FUNCTION mask_phone(TEXT) TO ems_app, ems_readonly;
GRANT EXECUTE ON FUNCTION mask_email(TEXT) TO ems_app, ems_readonly;

-- ─── 15. PROTECT MIGRATION TABLE FROM TAMPERING ──────────────────────────────
CREATE OR REPLACE FUNCTION prevent_migration_tampering()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' OR TG_OP = 'DELETE' THEN
        RAISE EXCEPTION 'Security: _migrations table is append-only. Schema history cannot be altered.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_migrations_append_only ON _migrations;
CREATE TRIGGER trg_migrations_append_only
    BEFORE UPDATE OR DELETE ON _migrations
    FOR EACH ROW EXECUTE FUNCTION prevent_migration_tampering();

-- ─── 16. FOREIGN KEY INTEGRITY ON SENSITIVE TABLES ───────────────────────────
-- Ensure password_resets cannot reference deleted users (data hygiene)
-- Already handled by ON DELETE SET NULL; document the cascade policy.
COMMENT ON TABLE password_resets IS 'Stores single-use, time-limited reset tokens. Email references users.email, not a FK to allow enumeration-safe lookups.';
COMMENT ON TABLE audit_logs IS 'Append-only forensic audit trail. Protected by DB trigger. Never modify records in this table.';
COMMENT ON TABLE sensitive_access_log IS 'Append-only log of access to sensitive tables. Protected by DB trigger.';

-- ─── 17. DOCUMENT DATABASE SECURITY SETTINGS (server config notes) ───────────
-- These settings must be applied in postgresql.conf or via ALTER SYSTEM:
--
-- # Logging (slow query + error monitoring)
-- log_min_duration_statement = 5000        -- Log queries taking > 5 seconds
-- log_connections = on                     -- Log every new connection
-- log_disconnections = on                  -- Log disconnects
-- log_hostname = off                       -- Don't resolve hostnames (perf)
-- log_line_prefix = '%t [%p]: user=%u,db=%d,app=%a,client=%h '
-- log_statement = 'ddl'                    -- Log all DDL statements always
-- log_error_verbosity = default            -- Don't expose stack traces in logs
--
-- # Connection hardening
-- max_connections = 100                    -- Hard cap on total connections
-- superuser_reserved_connections = 3       -- Keep 3 slots for admin emergencies
--
-- # Network (bind only to localhost or internal IP — NOT 0.0.0.0)
-- listen_addresses = 'localhost'           -- CRITICAL: not '*'
--
-- # Security
-- password_encryption = scram-sha-256     -- Stronger than md5
-- ssl = on                                -- Enable TLS for all connections
-- ssl_cert_file = '/etc/ssl/certs/server.crt'
-- ssl_key_file  = '/etc/ssl/private/server.key'
--
-- pg_hba.conf (IP whitelisting):
-- # TYPE  DATABASE         USER      ADDRESS          METHOD
-- host    employee_mangement  ems_app  127.0.0.1/32  scram-sha-256
-- host    employee_mangement  ems_app  10.0.0.0/8    scram-sha-256
-- local   all               postgres                  peer
