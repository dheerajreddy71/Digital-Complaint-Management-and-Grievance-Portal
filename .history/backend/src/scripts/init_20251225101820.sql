-- Digital Complaint Management Portal - Database Initialization Script
-- MySQL 8.0+

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS complaint_portal
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE complaint_portal;

-- =====================================================
-- Users Table
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('User', 'Staff', 'Admin') NOT NULL DEFAULT 'User',
  phone VARCHAR(20),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  last_login DATETIME,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_users_email (email),
  INDEX idx_users_role (role),
  INDEX idx_users_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Complaints Table
-- =====================================================
CREATE TABLE IF NOT EXISTS complaints (
  id INT PRIMARY KEY AUTO_INCREMENT,
  tracking_id VARCHAR(20) NOT NULL UNIQUE,
  citizen_id INT NOT NULL,
  assigned_to INT,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  category ENUM('infrastructure', 'sanitation', 'utilities', 'public_safety', 'transportation', 'environment', 'administration', 'other') NOT NULL,
  status ENUM('pending', 'in_progress', 'resolved', 'closed') NOT NULL DEFAULT 'pending',
  priority ENUM('low', 'medium', 'high', 'critical') NOT NULL DEFAULT 'medium',
  location VARCHAR(500),
  attachments JSON,
  sla_deadline DATETIME,
  resolution_notes TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (citizen_id) REFERENCES users(id) ON DELETE RESTRICT,
  FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
  
  INDEX idx_complaints_tracking (tracking_id),
  INDEX idx_complaints_citizen (citizen_id),
  INDEX idx_complaints_assigned (assigned_to),
  INDEX idx_complaints_status (status),
  INDEX idx_complaints_priority (priority),
  INDEX idx_complaints_category (category),
  INDEX idx_complaints_sla (sla_deadline),
  INDEX idx_complaints_created (created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Status History Table
-- =====================================================
CREATE TABLE IF NOT EXISTS status_history (
  id INT PRIMARY KEY AUTO_INCREMENT,
  complaint_id INT NOT NULL,
  from_status ENUM('pending', 'in_progress', 'resolved', 'closed'),
  to_status ENUM('pending', 'in_progress', 'resolved', 'closed') NOT NULL,
  changed_by INT NOT NULL,
  notes TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE,
  FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE RESTRICT,
  
  INDEX idx_status_history_complaint (complaint_id),
  INDEX idx_status_history_created (created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Comments Table
-- =====================================================
CREATE TABLE IF NOT EXISTS comments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  complaint_id INT NOT NULL,
  author_id INT NOT NULL,
  content TEXT NOT NULL,
  is_internal BOOLEAN NOT NULL DEFAULT FALSE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE,
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE RESTRICT,
  
  INDEX idx_comments_complaint (complaint_id),
  INDEX idx_comments_author (author_id),
  INDEX idx_comments_created (created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Feedback Table
-- =====================================================
CREATE TABLE IF NOT EXISTS feedback (
  id INT PRIMARY KEY AUTO_INCREMENT,
  complaint_id INT NOT NULL UNIQUE,
  citizen_id INT NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comments TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE,
  FOREIGN KEY (citizen_id) REFERENCES users(id) ON DELETE RESTRICT,
  
  INDEX idx_feedback_complaint (complaint_id),
  INDEX idx_feedback_citizen (citizen_id),
  INDEX idx_feedback_rating (rating)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Notifications Table
-- =====================================================
CREATE TABLE IF NOT EXISTS notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  type ENUM('complaint_created', 'complaint_assigned', 'status_updated', 'comment_added', 'sla_warning', 'sla_breach', 'feedback_received', 'system') NOT NULL,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  complaint_id INT,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE SET NULL,
  
  INDEX idx_notifications_user (user_id),
  INDEX idx_notifications_read (user_id, is_read),
  INDEX idx_notifications_created (created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Audit Logs Table
-- =====================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id INT,
  old_values JSON,
  new_values JSON,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  
  INDEX idx_audit_user (user_id),
  INDEX idx_audit_action (action),
  INDEX idx_audit_entity (entity_type, entity_id),
  INDEX idx_audit_created (created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Refresh Tokens Table
-- =====================================================
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  token VARCHAR(500) NOT NULL UNIQUE,
  expires_at DATETIME NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  
  INDEX idx_refresh_token (token),
  INDEX idx_refresh_user (user_id),
  INDEX idx_refresh_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Triggers
-- =====================================================

-- Generate tracking ID on complaint insert
DELIMITER //
CREATE TRIGGER IF NOT EXISTS before_complaint_insert
BEFORE INSERT ON complaints
FOR EACH ROW
BEGIN
  DECLARE next_id INT;
  DECLARE year_prefix VARCHAR(4);
  
  SET year_prefix = YEAR(CURRENT_DATE);
  
  SELECT COALESCE(MAX(CAST(SUBSTRING(tracking_id, 10) AS UNSIGNED)), 0) + 1
  INTO next_id
  FROM complaints
  WHERE tracking_id LIKE CONCAT('CMP-', year_prefix, '-%');
  
  SET NEW.tracking_id = CONCAT('CMP-', year_prefix, '-', LPAD(next_id, 5, '0'));
END//
DELIMITER ;

-- Calculate SLA deadline on complaint insert
DELIMITER //
CREATE TRIGGER IF NOT EXISTS after_complaint_insert_sla
BEFORE INSERT ON complaints
FOR EACH ROW
BEGIN
  CASE NEW.priority
    WHEN 'critical' THEN SET NEW.sla_deadline = DATE_ADD(NOW(), INTERVAL 24 HOUR);
    WHEN 'high' THEN SET NEW.sla_deadline = DATE_ADD(NOW(), INTERVAL 48 HOUR);
    WHEN 'medium' THEN SET NEW.sla_deadline = DATE_ADD(NOW(), INTERVAL 72 HOUR);
    WHEN 'low' THEN SET NEW.sla_deadline = DATE_ADD(NOW(), INTERVAL 168 HOUR);
    ELSE SET NEW.sla_deadline = DATE_ADD(NOW(), INTERVAL 72 HOUR);
  END CASE;
END//
DELIMITER ;

-- =====================================================
-- Default Admin User (password: Admin@123)
-- =====================================================
INSERT INTO users (name, email, password_hash, role, is_active) 
VALUES (
  'System Administrator',
  'admin@complaints.gov',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.VTtYWJLr2I/Xwi',
  'admin',
  TRUE
) ON DUPLICATE KEY UPDATE name = VALUES(name);

-- =====================================================
-- Sample Staff Users (password: Staff@123)
-- =====================================================
INSERT INTO users (name, email, password_hash, role, is_active) 
VALUES 
  ('Jane Smith', 'jane.smith@complaints.gov', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.VTtYWJLr2I/Xwi', 'staff', TRUE),
  ('John Doe', 'john.doe@complaints.gov', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.VTtYWJLr2I/Xwi', 'staff', TRUE),
  ('Emily Wilson', 'emily.wilson@complaints.gov', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.VTtYWJLr2I/Xwi', 'staff', TRUE)
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- =====================================================
-- Views
-- =====================================================

-- Complaint overview view
CREATE OR REPLACE VIEW complaint_overview AS
SELECT 
  c.id,
  c.tracking_id,
  c.title,
  c.category,
  c.status,
  c.priority,
  c.sla_deadline,
  c.created_at,
  c.updated_at,
  citizen.name AS citizen_name,
  citizen.email AS citizen_email,
  staff.name AS assigned_to_name,
  CASE WHEN c.sla_deadline < NOW() AND c.status NOT IN ('resolved', 'closed') THEN TRUE ELSE FALSE END AS is_overdue
FROM complaints c
LEFT JOIN users citizen ON c.citizen_id = citizen.id
LEFT JOIN users staff ON c.assigned_to = staff.id;

-- Staff performance view
CREATE OR REPLACE VIEW staff_performance AS
SELECT 
  u.id AS staff_id,
  u.name AS staff_name,
  COUNT(c.id) AS total_assigned,
  SUM(CASE WHEN c.status = 'resolved' THEN 1 ELSE 0 END) AS resolved_count,
  SUM(CASE WHEN c.status = 'in_progress' THEN 1 ELSE 0 END) AS in_progress_count,
  SUM(CASE WHEN c.sla_deadline < NOW() AND c.status NOT IN ('resolved', 'closed') THEN 1 ELSE 0 END) AS overdue_count,
  ROUND(AVG(f.rating), 2) AS avg_rating,
  ROUND(
    SUM(CASE WHEN c.status IN ('resolved', 'closed') AND c.updated_at <= c.sla_deadline THEN 1 ELSE 0 END) * 100.0 / 
    NULLIF(SUM(CASE WHEN c.status IN ('resolved', 'closed') THEN 1 ELSE 0 END), 0),
    2
  ) AS sla_compliance_rate
FROM users u
LEFT JOIN complaints c ON c.assigned_to = u.id
LEFT JOIN feedback f ON f.complaint_id = c.id
WHERE u.role = 'staff' AND u.is_active = TRUE
GROUP BY u.id, u.name;

-- Daily complaint stats view
CREATE OR REPLACE VIEW daily_complaint_stats AS
SELECT 
  DATE(created_at) AS date,
  COUNT(*) AS total_complaints,
  SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending,
  SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) AS in_progress,
  SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) AS resolved,
  SUM(CASE WHEN status = 'closed' THEN 1 ELSE 0 END) AS closed
FROM complaints
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- Print success message
SELECT 'Database initialization completed successfully!' AS message;
