import { getConnection } from "../config/database";

async function fixRoles() {
	const connection = await getConnection();
	try {
		// Check current roles
		const [roles] = await connection.query("SELECT DISTINCT role FROM users");
		console.log("Current roles in database:", roles);

		// Update Citizen to User
		await connection.query(
			"UPDATE users SET role = 'User' WHERE role = 'Citizen' OR role = 'citizen'"
		);
		console.log("✓ Updated Citizen/citizen to User");

		// Verify
		const [newRoles] = await connection.query(
			"SELECT DISTINCT role FROM users"
		);
		console.log("Roles after update:", newRoles);

		console.log("\n✓ Database roles fixed successfully!");
		process.exit(0);
	} catch (error) {
		console.error("Error:", error);
		process.exit(1);
	}
}

fixRoles();
