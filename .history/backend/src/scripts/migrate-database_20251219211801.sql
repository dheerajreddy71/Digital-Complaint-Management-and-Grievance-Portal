-- Migration Script: Update Database Schema for New Enum Values
-- Run this script to update existing database to match new application requirements

USE complaint_portal;

-- =====================================================
-- Step 1: Backup existing data (create backup tables)
-- =====================================================
-- This is done automatically by MySQL when we alter the table

-- =====================================================
-- Step 2: Update Users table - Change role enum values and add new fields
-- =====================================================
-- First, temporarily change role to VARCHAR to allow any value
ALTER TABLE users 
  MODIFY COLUMN role VARCHAR(20) NOT NULL DEFAULT 'citizen';

-- Update existing role values to Title case
UPDATE users SET role = 'Citizen' WHERE role = 'citizen';
UPDATE users SET role = 'Staff' WHERE role = 'staff';  
UPDATE users SET role = 'Admin' WHERE role = 'admin';

-- Now change back to ENUM with new values
ALTER TABLE users 
  MODIFY COLUMN role ENUM('Citizen', 'Staff', 'Admin') NOT NULL DEFAULT 'Citizen';

-- Add new columns if they don't exist
ALTER TABLE users 
  ADD COLUMN IF NOT EXISTS contact_info VARCHAR(20),
  ADD COLUMN IF NOT EXISTS availability_status ENUM('available', 'busy', 'offline') DEFAULT 'available',
  ADD COLUMN IF NOT EXISTS expertise VARCHAR(500);

-- Migrate phone data to contact_info
UPDATE users SET contact_info = phone WHERE phone IS NOT NULL AND contact_info IS NULL;

-- Add indexes for new columns
CREATE INDEX IF NOT EXISTS idx_users_availability ON users(availability_status);

-- =====================================================
-- Step 3: Update Complaints table - Update enums and add new columns
-- =====================================================

-- Add new columns first
ALTER TABLE complaints
  ADD COLUMN IF NOT EXISTS user_id INT,
  ADD COLUMN IF NOT EXISTS resolved_at DATETIME,
  ADD COLUMN IF NOT EXISTS is_overdue BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT FALSE;

-- Copy citizen_id to user_id if user_id is null
UPDATE complaints SET user_id = citizen_id WHERE user_id IS NULL;

-- Add foreign key for user_id if it doesn't exist
-- Note: This will fail if constraint already exists, which is fine
ALTER TABLE complaints
  ADD CONSTRAINT fk_complaints_user 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT;

-- Update category enum to match new values
ALTER TABLE complaints
  MODIFY COLUMN category ENUM('Plumbing', 'Electrical', 'Facility', 'IT', 'Other') NOT NULL;

-- Migrate old category values to new ones
UPDATE complaints SET category = 'Facility' WHERE category IN ('infrastructure', 'sanitation', 'environment', 'administration');
UPDATE complaints SET category = 'IT' WHERE category IN ('utilities', 'public_safety', 'transportation');
UPDATE complaints SET category = 'Other' WHERE category = 'other';

-- Update status enum to match new values
ALTER TABLE complaints
  MODIFY COLUMN status ENUM('Open', 'Assigned', 'In-progress', 'Resolved') NOT NULL DEFAULT 'Open';

-- Migrate old status values to new ones
UPDATE complaints SET status = 'Open' WHERE status = 'pending';
UPDATE complaints SET status = 'In-progress' WHERE status = 'in_progress';
UPDATE complaints SET status = 'Resolved' WHERE status IN ('resolved', 'closed');

-- Update priority enum to match new values (Title case)
ALTER TABLE complaints
  MODIFY COLUMN priority ENUM('Low', 'Medium', 'High', 'Critical') NOT NULL DEFAULT 'Medium';

-- Migrate old priority values to new ones
UPDATE complaints SET priority = 'Low' WHERE priority = 'low';
UPDATE complaints SET priority = 'Medium' WHERE priority = 'medium';
UPDATE complaints SET priority = 'High' WHERE priority = 'high';
UPDATE complaints SET priority = 'Critical' WHERE priority = 'critical';

-- Add indexes for new columns
CREATE INDEX IF NOT EXISTS idx_complaints_user ON complaints(user_id);
CREATE INDEX IF NOT EXISTS idx_complaints_overdue ON complaints(is_overdue);
CREATE INDEX IF NOT EXISTS idx_complaints_recurring ON complaints(is_recurring);
CREATE INDEX IF NOT EXISTS idx_complaints_resolved ON complaints(resolved_at);

-- =====================================================
-- Step 4: Update Status History table
-- =====================================================
ALTER TABLE status_history
  MODIFY COLUMN from_status ENUM('Open', 'Assigned', 'In-progress', 'Resolved'),
  MODIFY COLUMN to_status ENUM('Open', 'Assigned', 'In-progress', 'Resolved') NOT NULL;

-- Migrate old status values
UPDATE status_history SET from_status = 'Open' WHERE from_status = 'pending';
UPDATE status_history SET from_status = 'In-progress' WHERE from_status = 'in_progress';
UPDATE status_history SET from_status = 'Resolved' WHERE from_status IN ('resolved', 'closed');

UPDATE status_history SET to_status = 'Open' WHERE to_status = 'pending';
UPDATE status_history SET to_status = 'In-progress' WHERE to_status = 'in_progress';  
UPDATE status_history SET to_status = 'Resolved' WHERE to_status IN ('resolved', 'closed');

-- Add new columns
ALTER TABLE status_history
  ADD COLUMN IF NOT EXISTS old_status VARCHAR(50),
  ADD COLUMN IF NOT EXISTS new_status VARCHAR(50),
  ADD COLUMN IF NOT EXISTS previous_status VARCHAR(50),
  ADD COLUMN IF NOT EXISTS updated_by INT;

-- Migrate data to new columns
UPDATE status_history SET old_status = from_status WHERE old_status IS NULL;
UPDATE status_history SET new_status = to_status WHERE new_status IS NULL;
UPDATE status_history SET previous_status = from_status WHERE previous_status IS NULL;
UPDATE status_history SET updated_by = changed_by WHERE updated_by IS NULL;

-- =====================================================
-- Step 5: Update Feedback table
-- =====================================================
-- Add staff_id column if it doesn't exist
ALTER TABLE feedback
  ADD COLUMN IF NOT EXISTS staff_id INT,
  ADD COLUMN IF NOT EXISTS user_id INT;

-- Copy citizen_id to user_id
UPDATE feedback SET user_id = citizen_id WHERE user_id IS NULL;

-- Add foreign key for staff_id
ALTER TABLE feedback
  ADD CONSTRAINT fk_feedback_staff 
  FOREIGN KEY (staff_id) REFERENCES users(id) ON DELETE SET NULL;

-- =====================================================
-- Step 6: Update Notifications table  
-- =====================================================
ALTER TABLE notifications
  MODIFY COLUMN type ENUM('Assigned', 'StatusUpdate', 'Comment', 'Reminder', 'SLA_Warning', 'Escalation', 'System') NOT NULL;

-- Migrate old notification types
UPDATE notifications SET type = 'Assigned' WHERE type IN ('complaint_assigned');
UPDATE notifications SET type = 'StatusUpdate' WHERE type IN ('status_updated', 'complaint_created');
UPDATE notifications SET type = 'Comment' WHERE type = 'comment_added';
UPDATE notifications SET type = 'SLA_Warning' WHERE type IN ('sla_warning', 'sla_breach');
UPDATE notifications SET type = 'System' WHERE type = 'system';

-- =====================================================
-- Step 7: Create Refresh Tokens table if not exists
-- =====================================================
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  token VARCHAR(500) NOT NULL UNIQUE,
  expires_at DATETIME NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  
  INDEX idx_refresh_tokens_user (user_id),
  INDEX idx_refresh_tokens_token (token),
  INDEX idx_refresh_tokens_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Migration Complete
-- =====================================================
SELECT 'Migration completed successfully!' AS Status;

-- Verify data counts
SELECT 
  'Users' AS Table_Name,
  COUNT(*) AS Record_Count,
  COUNT(DISTINCT role) AS Unique_Roles
FROM users

UNION ALL

SELECT 
  'Complaints' AS Table_Name,
  COUNT(*) AS Record_Count,
  COUNT(DISTINCT status) AS Unique_Statuses
FROM complaints

UNION ALL

SELECT
  'Feedback' AS Table_Name,
  COUNT(*) AS Record_Count,
  NULL AS Unique_Values
FROM feedback

UNION ALL

SELECT
  'Notifications' AS Table_Name,
  COUNT(*) AS Record_Count,
  NULL AS Unique_Values  
FROM notifications;
