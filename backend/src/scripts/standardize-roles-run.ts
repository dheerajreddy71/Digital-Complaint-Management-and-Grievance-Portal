import { getConnection } from "../config/database";

async function standardizeRoles() {
	const connection = await getConnection();
	try {
		console.log("🔄 Standardizing all roles to User, Staff, Admin...\n");

		// Step 1: Convert ENUM to VARCHAR temporarily
		await connection.query(
			"ALTER TABLE users MODIFY COLUMN role VARCHAR(20) NOT NULL DEFAULT 'User'"
		);
		console.log("✓ Converted role column to VARCHAR");

		// Step 2: Update all role values
		await connection.query(
			"UPDATE users SET role = 'User' WHERE role IN ('citizen', 'Citizen', 'user')"
		);
		console.log("✓ Updated all citizen/Citizen/user to User");

		await connection.query(
			"UPDATE users SET role = 'Staff' WHERE role = 'staff'"
		);
		console.log("✓ Updated staff to Staff");

		await connection.query(
			"UPDATE users SET role = 'Admin' WHERE role = 'admin'"
		);
		console.log("✓ Updated admin to Admin");

		// Step 3: Set ENUM with correct values
		await connection.query(
			"ALTER TABLE users MODIFY COLUMN role ENUM('User', 'Staff', 'Admin') NOT NULL DEFAULT 'User'"
		);
		console.log("✓ Set role column to ENUM('User', 'Staff', 'Admin')");

		// Verify
		const [roles] = await connection.query(
			"SELECT role, COUNT(*) as count FROM users GROUP BY role"
		);
		console.log("\n📊 Current roles in database:");
		console.table(roles);

		console.log("\n✅ All roles standardized successfully!");
		process.exit(0);
	} catch (error) {
		console.error("❌ Error:", error);
		process.exit(1);
	}
}

standardizeRoles();
