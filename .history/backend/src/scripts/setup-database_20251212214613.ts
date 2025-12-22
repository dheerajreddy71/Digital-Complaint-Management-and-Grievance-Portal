import mysql from "mysql2/promise";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const DB_NAME = process.env.DB_NAME || "complaint_portal";

// SQL statements for creating tables as per the document specification
const createTablesSQL = `
-- Users table with all specified fields
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('User', 'Staff', 'Admin') NOT NULL DEFAULT 'User',
  contact_info VARCHAR(50),
  expertise VARCHAR(255),
  availability_status ENUM('Available', 'OnLeave', 'Busy') DEFAULT 'Available',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role (role),
  INDEX idx_active (is_active)
);

-- Complaints table with full lifecycle support
CREATE TABLE IF NOT EXISTS complaints (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  staff_id INT,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category ENUM('Plumbing', 'Electrical', 'Facility', 'IT', 'Other') NOT NULL,
  priority ENUM('Low', 'Medium', 'High', 'Critical') NOT NULL,
  location VARCHAR(255) NOT NULL,
  status ENUM('Open', 'Assigned', 'In-progress', 'Resolved') NOT NULL DEFAULT 'Open',
  sla_deadline DATETIME NOT NULL,
  is_overdue BOOLEAN DEFAULT FALSE,
  is_escalated BOOLEAN DEFAULT FALSE,
  is_recurring BOOLEAN DEFAULT FALSE,
  attachments TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (staff_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_user (user_id),
  INDEX idx_staff (staff_id),
  INDEX idx_status (status),
  INDEX idx_category (category),
  INDEX idx_priority (priority),
  INDEX idx_overdue (is_overdue),
  INDEX idx_created (created_at)
);

-- Status history for tracking complaint timeline
CREATE TABLE IF NOT EXISTS status_history (
  id INT PRIMARY KEY AUTO_INCREMENT,
  complaint_id INT NOT NULL,
  previous_status ENUM('Open', 'Assigned', 'In-progress', 'Resolved'),
  new_status ENUM('Open', 'Assigned', 'In-progress', 'Resolved') NOT NULL,
  updated_by INT NOT NULL,
  notes TEXT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE,
  FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_complaint (complaint_id),
  INDEX idx_timestamp (timestamp)
);

-- Feedback for rating system (1-5 stars)
CREATE TABLE IF NOT EXISTS feedback (
  id INT PRIMARY KEY AUTO_INCREMENT,
  complaint_id INT NOT NULL UNIQUE,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  is_resolved BOOLEAN DEFAULT TRUE,
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE,
  INDEX idx_complaint (complaint_id),
  INDEX idx_rating (rating)
);

-- Notifications for in-app notification system
CREATE TABLE IF NOT EXISTS notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  complaint_id INT,
  type ENUM('Assigned', 'StatusUpdate', 'Resolved', 'Reminder', 'SLABreach', 'FeedbackRequest') NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE SET NULL,
  INDEX idx_user (user_id),
  INDEX idx_read (is_read),
  INDEX idx_created (created_at)
);

-- Audit logs for tracking critical actions
CREATE TABLE IF NOT EXISTS audit_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  action VARCHAR(255) NOT NULL,
  entity_type ENUM('Complaint', 'User', 'Staff', 'Feedback', 'Notification') NOT NULL,
  entity_id INT NOT NULL,
  details JSON,
  ip_address VARCHAR(45),
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_user (user_id),
  INDEX idx_entity (entity_type, entity_id),
  INDEX idx_timestamp (timestamp)
);

-- Comments for two-way communication
CREATE TABLE IF NOT EXISTS comments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  complaint_id INT NOT NULL,
  user_id INT NOT NULL,
  content TEXT NOT NULL,
  attachments TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_complaint (complaint_id),
  INDEX idx_created (created_at)
);

-- Refresh tokens for JWT refresh token implementation
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  token VARCHAR(512) NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user (user_id),
  INDEX idx_token (token),
  INDEX idx_expires (expires_at)
);
`;

async function setupDatabase() {
	let connection: mysql.Connection | null = null;

	try {
		// First connect without database to create it if needed
		connection = await mysql.createConnection({
			host: process.env.DB_HOST || "localhost",
			port: parseInt(process.env.DB_PORT || "3306", 10),
			user: process.env.DB_USER || "root",
			password: process.env.DB_PASSWORD || "",
		});

		console.log("Connected to MySQL server");

		// Create database if it doesn't exist
		await connection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\``);
		console.log(`Database '${DB_NAME}' created or already exists`);

		// Switch to the database
		await connection.query(`USE \`${DB_NAME}\``);

		// Create tables - split by statement for MySQL
		const statements = createTablesSQL
			.split(";")
			.map((s) => s.trim())
			.filter((s) => s.length > 0);

		for (const statement of statements) {
			await connection.query(statement);
		}

		console.log("All tables created successfully");
		console.log("\nDatabase setup complete!");
		console.log("You can now run: npm run db:seed");
	} catch (error) {
		console.error("Database setup failed:", error);
		process.exit(1);
	} finally {
		if (connection) {
			await connection.end();
		}
	}
}

setupDatabase();
