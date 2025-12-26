import { query } from "../config/database";

async function checkUserDetails() {
	try {
		console.log("Checking user schema and data...\n");

		// Check schema
		const schema = await query(`
      DESCRIBE users
    `);

		console.log("User table columns:");
		(schema as any[]).forEach((col: any) => {
			console.log(
				`  ${col.Field} (${col.Type}) ${
					col.Null === "YES" ? "NULL" : "NOT NULL"
				} ${col.Default ? `DEFAULT ${col.Default}` : ""}`
			);
		});

		// Check staff users
		const staff = await query(`
      SELECT id, name, email, role, department, availability_status, expertise, is_active
      FROM users
      WHERE role = 'Staff'
    `);

		console.log(`\n\nStaff Users (${(staff as any[]).length}):`);
		(staff as any[]).forEach((u: any) => {
			console.log(
				`  #${u.id}: ${u.name} - ${u.department || "No Dept"} - ${
					u.availability_status || "No Status"
				} - Active: ${u.is_active}`
			);
		});

		process.exit(0);
	} catch (error) {
		console.error("Error:", error);
		process.exit(1);
	}
}

checkUserDetails();
