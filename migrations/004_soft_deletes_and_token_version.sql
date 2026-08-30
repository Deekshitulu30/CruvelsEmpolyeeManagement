-- =====================================================
-- Migration 004: Soft Deletes & Token Versioning (Concurrent Session Invalidation)
-- =====================================================

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS token_version INT DEFAULT 1,
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

ALTER TABLE employees
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_users_deleted_at ON users(deleted_at);
CREATE INDEX IF NOT EXISTS idx_employees_deleted_at ON employees(deleted_at);
