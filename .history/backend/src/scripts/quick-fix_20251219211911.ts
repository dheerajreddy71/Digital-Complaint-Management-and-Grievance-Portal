import mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';

dotenv.config();

const config = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'complaint_portal',
};

async function quickFix() {
  const connection = await mysql.createConnection(config);
  
  try {
    console.log('🔄 Connected to database\n');
    
    // Step 1: Fix users.role
    console.log('1️⃣ Fixing users.role column...');
    await connection.query("ALTER TABLE users MODIFY COLUMN role VARCHAR(20) NOT NULL DEFAULT 'citizen'");
    await connection.query("UPDATE users SET role = 'Citizen' WHERE LOWER(role) = 'citizen'");
    await connection.query("UPDATE users SET role = 'Staff' WHERE LOWER(role) = 'staff'");
    await connection.query("UPDATE users SET role = 'Admin' WHERE LOWER(role) = 'admin'");
    await connection.query("ALTER TABLE users MODIFY COLUMN role ENUM('Citizen', 'Staff', 'Admin') NOT NULL DEFAULT 'Citizen'");
    console.log('✅ Users.role fixed\n');
    
    // Step 2: Add user columns
    console.log('2️⃣ Adding missing user columns...');
    await connection.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS contact_info VARCHAR(20)");
    await connection.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS availability_status ENUM('available', 'busy', 'offline') DEFAULT 'available'");
    await connection.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS expertise VARCHAR(500)");
    await connection.query("UPDATE users SET contact_info = phone WHERE phone IS NOT NULL AND contact_info IS NULL");
    console.log('✅ User columns added\n');
    
    // Step 3: Add complaint columns
    console.log('3️⃣ Adding missing complaint columns...');
    await connection.query("ALTER TABLE complaints ADD COLUMN IF NOT EXISTS user_id INT");
    await connection.query("ALTER TABLE complaints ADD COLUMN IF NOT EXISTS resolved_at DATETIME");
    await connection.query("ALTER TABLE complaints ADD COLUMN IF NOT EXISTS is_overdue BOOLEAN DEFAULT FALSE");
    await connection.query("ALTER TABLE complaints ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT FALSE");
    await connection.query("UPDATE complaints SET user_id = citizen_id WHERE user_id IS NULL");
    console.log('✅ Complaint columns added\n');
    
    // Step 4: Fix category
    console.log('4️⃣ Fixing complaints.category...');
    await connection.query("ALTER TABLE complaints MODIFY COLUMN category VARCHAR(50) NOT NULL");
    await connection.query("UPDATE complaints SET category = 'Facility' WHERE category IN ('infrastructure', 'sanitation', 'environment', 'administration')");
    await connection.query("UPDATE complaints SET category = 'IT' WHERE category IN ('utilities', 'public_safety', 'transportation')");
    await connection.query("UPDATE complaints SET category = 'Other' WHERE category = 'other'");
    await connection.query("UPDATE complaints SET category = 'Plumbing' WHERE category NOT IN ('Facility', 'IT', 'Other', 'Plumbing', 'Electrical')");
    await connection.query("ALTER TABLE complaints MODIFY COLUMN category ENUM('Plumbing', 'Electrical', 'Facility', 'IT', 'Other') NOT NULL");
    console.log('✅ Category fixed\n');
    
    // Step 5: Fix status
    console.log('5️⃣ Fixing complaints.status...');
    await connection.query("ALTER TABLE complaints MODIFY COLUMN status VARCHAR(50) NOT NULL DEFAULT 'pending'");
    await connection.query("UPDATE complaints SET status = 'Open' WHERE LOWER(status) = 'pending'");
    await connection.query("UPDATE complaints SET status = 'In-progress' WHERE LOWER(status) = 'in_progress'");
    await connection.query("UPDATE complaints SET status = 'Resolved' WHERE LOWER(status) IN ('resolved', 'closed')");
    await connection.query("UPDATE complaints SET status = 'Assigned' WHERE status NOT IN ('Open', 'In-progress', 'Resolved')");
    await connection.query("ALTER TABLE complaints MODIFY COLUMN status ENUM('Open', 'Assigned', 'In-progress', 'Resolved') NOT NULL DEFAULT 'Open'");
    console.log('✅ Status fixed\n');
    
    // Step 6: Fix priority
    console.log('6️⃣ Fixing complaints.priority...');
    await connection.query("ALTER TABLE complaints MODIFY COLUMN priority VARCHAR(50) NOT NULL DEFAULT 'medium'");
    await connection.query("UPDATE complaints SET priority = 'Low' WHERE LOWER(priority) = 'low'");
    await connection.query("UPDATE complaints SET priority = 'Medium' WHERE LOWER(priority) = 'medium'");
    await connection.query("UPDATE complaints SET priority = 'High' WHERE LOWER(priority) = 'high'");
    await connection.query("UPDATE complaints SET priority = 'Critical' WHERE LOWER(priority) = 'critical'");
    await connection.query("ALTER TABLE complaints MODIFY COLUMN priority ENUM('Low', 'Medium', 'High', 'Critical') NOT NULL DEFAULT 'Medium'");
    console.log('✅ Priority fixed\n');
    
    // Step 7: Add feedback columns
    console.log('7️⃣ Fixing feedback table...');
    await connection.query("ALTER TABLE feedback ADD COLUMN IF NOT EXISTS staff_id INT");
    await connection.query("ALTER TABLE feedback ADD COLUMN IF NOT EXISTS user_id INT");
    await connection.query("UPDATE feedback SET user_id = citizen_id WHERE user_id IS NULL");
    console.log('✅ Feedback fixed\n');
    
    console.log('\n🎉 All fixes applied successfully!');
    
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await connection.end();
  }
}

quick Fix();
