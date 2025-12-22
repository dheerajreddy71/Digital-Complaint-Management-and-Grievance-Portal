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

async function fixAll() {
  const connection = await mysql.createConnection(config);
  
  try {
    console.log('🔄 Connected to database\n');
    
    // Step 1: Check and fix user roles
    console.log('1️⃣ Checking user roles...');
    const [users] = await connection.query("SELECT id, role FROM users");
    console.table(users);
    
    console.log('\n2️⃣ Fixing user roles to match enum...');
    await connection.query("UPDATE users SET role = 'Citizen' WHERE role NOT IN ('Admin', 'Staff', 'Citizen')");
    console.log('✅ User roles fixed\n');
    
    // Step 2: Check if assigned_to exists
    console.log('3️⃣ Checking complaints table structure...');
    const [columns]: any = await connection.query("SHOW COLUMNS FROM complaints");
    const hasAssignedTo = columns.some((col: any) => col.Field === 'assigned_to');
    console.log(`   assigned_to column exists: ${hasAssignedTo}`);
    
    if (!hasAssignedTo) {
      console.log('   ⚠️  assigned_to column is missing! Adding it...');
      await connection.query("ALTER TABLE complaints ADD COLUMN assigned_to INT");
      await connection.query("ALTER TABLE complaints ADD FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL");
      console.log('✅ assigned_to column added\n');
    }
    
    // Step 3: Add other missing columns
    console.log('4️⃣ Adding missing columns...');
    
    const hasUserIdCol = columns.some((col: any) => col.Field === 'user_id');
    if (!hasUserIdCol) {
      await connection.query("ALTER TABLE complaints ADD COLUMN user_id INT");
      await connection.query("UPDATE complaints SET user_id = citizen_id WHERE user_id IS NULL");
      console.log('   ✅ user_id added');
    }
    
    const hasResolvedAt = columns.some((col: any) => col.Field === 'resolved_at');
    if (!hasResolvedAt) {
      await connection.query("ALTER TABLE complaints ADD COLUMN resolved_at DATETIME");
      console.log('   ✅ resolved_at added');
    }
    
    const hasIsOverdue = columns.some((col: any) => col.Field === 'is_overdue');
    if (!hasIsOverdue) {
      await connection.query("ALTER TABLE complaints ADD COLUMN is_overdue BOOLEAN DEFAULT FALSE");
      console.log('   ✅ is_overdue added');
    }
    
    const hasIsRecurring = columns.some((col: any) => col.Field === 'is_recurring');
    if (!hasIsRecurring) {
      await connection.query("ALTER TABLE complaints ADD COLUMN is_recurring BOOLEAN DEFAULT FALSE");
      console.log('   ✅ is_recurring added');
    }
    
    // Step 4: Add missing user columns
    console.log('\n5️⃣ Adding missing user columns...');
    const [userColumns]: any = await connection.query("SHOW COLUMNS FROM users");
    
    const hasContactInfo = userColumns.some((col: any) => col.Field === 'contact_info');
    if (!hasContactInfo) {
      await connection.query("ALTER TABLE users ADD COLUMN contact_info VARCHAR(20)");
      await connection.query("UPDATE users SET contact_info = phone WHERE phone IS NOT NULL");
      console.log('   ✅ contact_info added');
    }
    
    const hasAvailability = userColumns.some((col: any) => col.Field === 'availability_status');
    if (!hasAvailability) {
      await connection.query("ALTER TABLE users ADD COLUMN availability_status ENUM('available', 'busy', 'offline') DEFAULT 'available'");
      console.log('   ✅ availability_status added');
    }
    
    const hasExpertise = userColumns.some((col: any) => col.Field === 'expertise');
    if (!hasExpertise) {
      await connection.query("ALTER TABLE users ADD COLUMN expertise VARCHAR(500)");
      console.log('   ✅ expertise added');
    }
    
    // Step 5: Add missing feedback columns
    console.log('\n6️⃣ Adding missing feedback columns...');
    const [feedbackColumns]: any = await connection.query("SHOW COLUMNS FROM feedback");
    
    const hasStaffId = feedbackColumns.some((col: any) => col.Field === 'staff_id');
    if (!hasStaffId) {
      await connection.query("ALTER TABLE feedback ADD COLUMN staff_id INT");
      console.log('   ✅ staff_id added');
    }
    
    const hasFeedbackUserId = feedbackColumns.some((col: any) => col.Field === 'user_id');
    if (!hasFeedbackUserId) {
      await connection.query("ALTER TABLE feedback ADD COLUMN user_id INT");
      console.log('   ✅ user_id added to feedback');
    }
    
    console.log('\n🎉 All database fixes applied successfully!');
    console.log('\n✅ You can now restart the backend server.');
    
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await connection.end();
  }
}

fixAll();
