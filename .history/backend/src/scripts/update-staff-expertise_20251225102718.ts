import { getConnection } from "../config/database";

async function checkExpertise() {
	const connection = await getConnection();
	try {
		// Check if expertise column exists
		const [columns]: any = await connection.query(
			"SHOW COLUMNS FROM users WHERE Field = 'expertise'"
		);

		if (columns.length === 0) {
			console.log("⚠️  Expertise column is MISSING! Adding it...\n");
			await connection.query(
				"ALTER TABLE users ADD COLUMN expertise VARCHAR(255) AFTER contact_info"
			);
			console.log("✅ Expertise column added!\n");
		} else {
			console.log("✅ Expertise column exists!\n");
			console.table(columns);
		}

		// Check staff expertise
		const [staff]: any = await connection.query(
			"SELECT id, name, email, role, expertise, availability_status FROM users WHERE role = 'Staff'"
		);

		console.log("\n🔧 STAFF MEMBERS & EXPERTISE:");
		console.table(staff);

		// Update staff with proper expertise if null
		if (staff.some((s: any) => !s.expertise)) {
			console.log("\n⚠️  Some staff have NULL expertise. Updating...");
			
			await connection.query(
				"UPDATE users SET expertise = 'Plumbing' WHERE email = 'staff@portal.com'"
			);
			await connection.query(
				"UPDATE users SET expertise = 'Electrical' WHERE email = 'electrician@portal.com'"
			);
			await connection.query(
				"UPDATE users SET expertise = 'IT' WHERE email = 'itsupport@portal.com'"
			);

			const [updated]: any = await connection.query(
				"SELECT id, name, expertise FROM users WHERE role = 'Staff'"
			);
			console.log("\n✅ UPDATED STAFF:");
			console.table(updated);
		}

		process.exit(0);
	} catch (error) {
		console.error("❌ Error:", error);
		process.exit(1);
	}
}

checkExpertise();
