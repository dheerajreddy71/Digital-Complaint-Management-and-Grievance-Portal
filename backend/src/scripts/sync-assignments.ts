import mysql from "mysql2/promise";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

async function syncStaffAssignments() {
	const connection = await mysql.createConnection({
		host: process.env.DB_HOST || "localhost",
		user: process.env.DB_USER || "root",
		password: process.env.DB_PASSWORD || "",
		database: process.env.DB_NAME || "complaint_portal",
	});

	try {
		console.log("\n🔧 Syncing staff_id to assigned_to column...\n");

		// Copy all staff_id values to assigned_to
		await connection.query(
			"UPDATE complaints SET assigned_to = staff_id WHERE staff_id IS NOT NULL"
		);

		console.log("✅ Successfully synced assignments!\n");

		// Verify the update
		const [complaints]: any = await connection.query(
			"SELECT id, user_id, staff_id, assigned_to, title, status FROM complaints WHERE staff_id IS NOT NULL LIMIT 5"
		);

		console.log("📊 Sample assignments:");
		complaints.forEach((c: any) => {
			console.log(
				`  Complaint #${c.id}: staff_id=${c.staff_id}, assigned_to=${c.assigned_to}, status=${c.status}`
			);
		});

		// Count total assigned complaints
		const [count]: any = await connection.query(
			"SELECT COUNT(*) as total FROM complaints WHERE assigned_to IS NOT NULL"
		);

		console.log(`\n✅ Total assigned complaints: ${count[0].total}\n`);
	} catch (error) {
		console.error("❌ Error:", error);
	} finally {
		await connection.end();
	}
}

syncStaffAssignments();
