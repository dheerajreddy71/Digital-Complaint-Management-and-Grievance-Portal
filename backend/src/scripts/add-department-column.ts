import { query } from "../config/database";

async function addDepartmentColumn() {
	try {
		console.log("Adding department column to users table...");

		// Check if column already exists
		const checkColumn = await query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'users' 
      AND COLUMN_NAME = 'department'
    `);

		if ((checkColumn as any[]).length === 0) {
			// Add department column
			await query(`
        ALTER TABLE users 
        ADD COLUMN department VARCHAR(100) AFTER role
      `);
			console.log("✓ Department column added successfully");
		} else {
			console.log("ℹ Department column already exists");
		}

		// Check if index already exists
		const checkIndex = await query(`
      SELECT INDEX_NAME 
      FROM INFORMATION_SCHEMA.STATISTICS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'users' 
      AND INDEX_NAME = 'idx_department'
    `);

		if ((checkIndex as any[]).length === 0) {
			// Add index for better query performance
			await query(`
        CREATE INDEX idx_department ON users(department)
      `);
			console.log("✓ Index created successfully");
		} else {
			console.log("ℹ Index already exists");
		}

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

		console.log("✓ Existing staff users updated with departments");

		console.log("\n✅ Migration completed successfully!");
		process.exit(0);
	} catch (error) {
		console.error("❌ Migration failed:", error);
		process.exit(1);
	}
}

addDepartmentColumn();
