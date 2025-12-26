-- Standardize all roles to User, Staff, Admin throughout the database
USE complaint_portal;

-- Step 1: Convert ENUM to VARCHAR temporarily to allow updates
ALTER TABLE users MODIFY COLUMN role VARCHAR(20) NOT NULL DEFAULT 'User';

-- Step 2: Update all role values to standardized names
UPDATE users SET role = 'User' WHERE role IN ('citizen', 'Citizen', 'user');
UPDATE users SET role = 'Staff' WHERE role IN ('staff');
UPDATE users SET role = 'Admin' WHERE role IN ('admin');

-- Step 3: Set ENUM with correct values
ALTER TABLE users MODIFY COLUMN role ENUM('User', 'Staff', 'Admin') NOT NULL DEFAULT 'User';

-- Verify the changes
SELECT role, COUNT(*) as count FROM users GROUP BY role;
