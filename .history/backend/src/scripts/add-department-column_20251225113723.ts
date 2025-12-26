import { query } from '../config/database';

async function addDepartmentColumn() {
  try {
    console.log('Adding department column to users table...');
    
    // Add department column if it doesn't exist
    await query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS department VARCHAR(100) AFTER role
    `);
    
    console.log('✓ Department column added successfully');
    
    // Add index for better query performance
    await query(`
      CREATE INDEX IF NOT EXISTS idx_department ON users(department)
    `);
    
    console.log('✓ Index created successfully');
    
    // Update existing staff users with default departments based on expertise
    await query(`
      UPDATE users 
      SET department = CASE
        WHEN expertise LIKE '%plumb%' THEN 'Plumbing'
        WHEN expertise LIKE '%electric%' THEN 'Electrical'
        WHEN expertise LIKE '%facility%' OR expertise LIKE '%maintenance%' THEN 'Facility Management'
        WHEN expertise LIKE '%IT%' OR expertise LIKE '%network%' OR expertise LIKE '%computer%' THEN 'IT Support'
        ELSE 'General Administration'
      END
      WHERE role = 'Staff' AND department IS NULL
    `);
    
    console.log('✓ Existing staff users updated with departments');
    
    console.log('\n✅ Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

addDepartmentColumn();
