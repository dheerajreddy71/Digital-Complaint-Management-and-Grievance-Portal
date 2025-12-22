-- Quick Fix Migration - Simpler Approach
-- This script fixes the database schema issues without complex migrations

USE complaint_portal;

-- Step 1: Fix Users table role column
ALTER TABLE users MODIFY COLUMN role VARCHAR(20) NOT NULL DEFAULT 'citizen';
UPDATE users SET role = 'Citizen' WHERE LOWER(role) = 'citizen';
UPDATE users SET role = 'Staff' WHERE LOWER(role) = 'staff';
UPDATE users SET role = 'Admin' WHERE LOWER(role) = 'admin';
ALTER TABLE users MODIFY COLUMN role ENUM('Citizen', 'Staff', 'Admin') NOT NULL DEFAULT 'Citizen';

-- Step 2: Add missing columns to users
ALTER TABLE users ADD COLUMN IF NOT EXISTS contact_info VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS availability_status ENUM('available', 'busy', 'offline') DEFAULT 'available';
ALTER TABLE users ADD COLUMN IF NOT EXISTS expertise VARCHAR(500);
UPDATE users SET contact_info = phone WHERE phone IS NOT NULL AND contact_info IS NULL;

-- Step 3: Add missing columns to complaints
ALTER TABLE complaints ADD COLUMN IF NOT EXISTS user_id INT;
ALTER TABLE complaints ADD COLUMN IF NOT EXISTS resolved_at DATETIME;
ALTER TABLE complaints ADD COLUMN IF NOT EXISTS is_overdue BOOLEAN DEFAULT FALSE;
ALTER TABLE complaints ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT FALSE;
UPDATE complaints SET user_id = citizen_id WHERE user_id IS NULL;

-- Step 4: Fix complaints category
ALTER TABLE complaints MODIFY COLUMN category VARCHAR(50) NOT NULL;
UPDATE complaints SET category = 'Facility' WHERE category IN ('infrastructure', 'sanitation', 'environment', 'administration');
UPDATE complaints SET category = 'IT' WHERE category IN ('utilities', 'public_safety', 'transportation');
UPDATE complaints SET category = 'Other' WHERE category = 'other';
UPDATE complaints SET category = 'Plumbing' WHERE category NOT IN ('Facility', 'IT', 'Other', 'Plumbing', 'Electrical');
ALTER TABLE complaints MODIFY COLUMN category ENUM('Plumbing', 'Electrical', 'Facility', 'IT', 'Other') NOT NULL;

-- Step 5: Fix complaints status
ALTER TABLE complaints MODIFY COLUMN status VARCHAR(50) NOT NULL DEFAULT 'pending';
UPDATE complaints SET status = 'Open' WHERE LOWER(status) = 'pending';
UPDATE complaints SET status = 'In-progress' WHERE LOWER(status) = 'in_progress';
UPDATE complaints SET status = 'Resolved' WHERE LOWER(status) IN ('resolved', 'closed');
UPDATE complaints SET status = 'Assigned' WHERE status NOT IN ('Open', 'In-progress', 'Resolved');
ALTER TABLE complaints MODIFY COLUMN status ENUM('Open', 'Assigned', 'In-progress', 'Resolved') NOT NULL DEFAULT 'Open';

-- Step 6: Fix complaints priority
ALTER TABLE complaints MODIFY COLUMN priority VARCHAR(50) NOT NULL DEFAULT 'medium';
UPDATE complaints SET priority = 'Low' WHERE LOWER(priority) = 'low';
UPDATE complaints SET priority = 'Medium' WHERE LOWER(priority) = 'medium';
UPDATE complaints SET priority = 'High' WHERE LOWER(priority) = 'high';
UPDATE complaints SET priority = 'Critical' WHERE LOWER(priority) = 'critical';
ALTER TABLE complaints MODIFY COLUMN priority ENUM('Low', 'Medium', 'High', 'Critical') NOT NULL DEFAULT 'Medium';

-- Step 7: Fix status_history
ALTER TABLE status_history ADD COLUMN IF NOT EXISTS old_status VARCHAR(50);
ALTER TABLE status_history ADD COLUMN IF NOT EXISTS new_status VARCHAR(50);
ALTER TABLE status_history ADD COLUMN IF NOT EXISTS previous_status VARCHAR(50);
ALTER TABLE status_history ADD COLUMN IF NOT EXISTS updated_by INT;

UPDATE status_history SET old_status = from_status WHERE old_status IS NULL;
UPDATE status_history SET new_status = to_status WHERE new_status IS NULL;
UPDATE status_history SET previous_status = from_status WHERE previous_status IS NULL;
UPDATE status_history SET updated_by = changed_by WHERE updated_by IS NULL;

-- Step 8: Fix feedback
ALTER TABLE feedback ADD COLUMN IF NOT EXISTS staff_id INT;
ALTER TABLE feedback ADD COLUMN IF NOT EXISTS user_id INT;
UPDATE feedback SET user_id = citizen_id WHERE user_id IS NULL;

SELECT 'Migration completed!' AS Status;
