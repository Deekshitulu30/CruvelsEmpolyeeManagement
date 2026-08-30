-- =====================================================
-- Database Role Setup Script
-- Run this ONCE as the postgres superuser BEFORE
-- the application goes live. Sets up least-privilege
-- roles for each service that touches the database.
--
-- Usage: psql -U postgres -d employee_mangement -f scripts/db-setup-roles.sql
-- =====================================================

-- ─── SECURITY NOTICE ─────────────────────────────────────────────────────────
-- Replace ALL 'CHANGE_IN_PRODUCTION_*' passwords with strong random values.
-- Generate with: openssl rand -base64 32
-- Store in your secrets manager (HashiCorp Vault, AWS Secrets Manager, etc.)
-- NEVER commit real passwords to version control.

-- ─── 1. REVOKE DEFAULT PUBLIC PRIVILEGES ─────────────────────────────────────
-- By default, PostgreSQL grants CONNECT and CREATE to PUBLIC.
-- Revoke these so only explicitly granted roles can access the DB.
REVOKE ALL ON SCHEMA public FROM PUBLIC;
REVOKE CONNECT ON DATABASE employee_mangement FROM PUBLIC;

-- ─── 2. APPLICATION ROLE — ems_app ───────────────────────────────────────────
-- The Node.js backend connects as ems_app.
-- Permissions: CRUD on all tables. No DDL (CREATE/DROP/ALTER).
-- No SUPERUSER, CREATEROLE, CREATEDB, or REPLICATION.
DROP ROLE IF EXISTS ems_app;
CREATE ROLE ems_app WITH
    LOGIN
    NOSUPERUSER
    NOCREATEDB
    NOCREATEROLE
    NOREPLICATION
    CONNECTION LIMIT 20
    PASSWORD 'CHANGE_IN_PRODUCTION_ems_app_password_here';

GRANT CONNECT ON DATABASE employee_mangement TO ems_app;
GRANT USAGE ON SCHEMA public TO ems_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO ems_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO ems_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO ems_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO ems_app;

-- Set session defaults for security
ALTER ROLE ems_app SET statement_timeout = '30s';
ALTER ROLE ems_app SET idle_in_transaction_session_timeout = '10s';
ALTER ROLE ems_app SET lock_timeout = '5s';

-- ─── 3. READ-ONLY ROLE — ems_readonly ────────────────────────────────────────
-- Used by: analytics dashboards, reporting tools, BI exports.
-- Permissions: SELECT only on all tables. Cannot INSERT, UPDATE, DELETE.
DROP ROLE IF EXISTS ems_readonly;
CREATE ROLE ems_readonly WITH
    LOGIN
    NOSUPERUSER
    NOCREATEDB
    NOCREATEROLE
    NOREPLICATION
    CONNECTION LIMIT 5
    PASSWORD 'CHANGE_IN_PRODUCTION_readonly_password_here';

GRANT CONNECT ON DATABASE employee_mangement TO ems_readonly;
GRANT USAGE ON SCHEMA public TO ems_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO ems_readonly;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO ems_readonly;

ALTER ROLE ems_readonly SET statement_timeout = '60s';
ALTER ROLE ems_readonly SET idle_in_transaction_session_timeout = '30s';

-- ─── 4. BACKUP ROLE — ems_backup ─────────────────────────────────────────────
-- Used by: pg_dump automated backups.
-- Permissions: Read-all-data for consistent snapshots.
-- No write access, no DDL, no login during normal operation hours.
DROP ROLE IF EXISTS ems_backup;
CREATE ROLE ems_backup WITH
    LOGIN
    NOSUPERUSER
    NOCREATEDB
    NOCREATEROLE
    NOREPLICATION
    CONNECTION LIMIT 2
    PASSWORD 'CHANGE_IN_PRODUCTION_backup_password_here';

GRANT CONNECT ON DATABASE employee_mangement TO ems_backup;
GRANT USAGE ON SCHEMA public TO ems_backup;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO ems_backup;
GRANT pg_read_all_data TO ems_backup;

-- No timeout for backups (pg_dump can run for minutes)
ALTER ROLE ems_backup SET statement_timeout = '0';

-- ─── 5. COLUMN-LEVEL SECURITY (Salary & Bank Data) ───────────────────────────
-- If employees table ever gets salary/bank_account columns, restrict them:
-- (Adjust these grants when salary columns are added to the schema)
--
-- REVOKE SELECT (salary, bank_account, tax_id, national_id) ON employees FROM ems_app;
-- GRANT  SELECT (salary, bank_account) ON employees TO ems_hr_role;
--
-- This implements #8: column-level permissions so the standard app user
-- cannot read salary data — only the HR-privileged role can.

-- ─── 6. REMOVE DANGEROUS DEFAULT SUPERUSER REMOTE ACCESS ─────────────────────
-- The 'postgres' superuser should ONLY connect via local Unix socket (peer auth).
-- Revoke its ability to connect over the network.
-- NOTE: This is enforced in pg_hba.conf. Document the required configuration:
--
-- pg_hba.conf — IP Whitelisting & Auth Method:
-- ─────────────────────────────────────────────────────────────────────────────
-- # Local Unix socket — superuser admin access only (peer auth, no password needed)
-- local   all             postgres                                peer
--
-- # Application server (replace 10.0.1.50 with your actual app server IP)
-- host    employee_mangement  ems_app      10.0.1.50/32   scram-sha-256
--
-- # Read-only analytics access from BI server
-- host    employee_mangement  ems_readonly 10.0.1.60/32   scram-sha-256
--
-- # Backup job from backup server
-- host    employee_mangement  ems_backup   10.0.1.70/32   scram-sha-256
--
-- # Deny ALL other connections by default (implicit in pg_hba.conf ordering)
-- ─────────────────────────────────────────────────────────────────────────────

-- ─── 7. VERIFY ROLE SETUP ────────────────────────────────────────────────────
-- Run this SELECT after setup to confirm roles are correct:
SELECT
    rolname,
    rolsuper,
    rolcreaterole,
    rolcreatedb,
    rolreplication,
    rolconnlimit,
    rolcanlogin
FROM pg_roles
WHERE rolname IN ('ems_app', 'ems_readonly', 'ems_backup', 'postgres')
ORDER BY rolname;
