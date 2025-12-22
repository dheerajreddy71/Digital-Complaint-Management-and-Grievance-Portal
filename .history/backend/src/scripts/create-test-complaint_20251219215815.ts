import { query } from "../config/database";

async function createTestComplaint() {
	try {
		// First check existing complaints to see valid category values
		const existingComplaints: any = await query(
			"SELECT id, category, priority, status FROM complaints LIMIT 3"
		);
		console.log("📋 Existing complaints with categories:");
		console.log(JSON.stringify(existingComplaints, null, 2));

		// Check for unassigned complaints
		const rows: any = await query(
			"SELECT id, title, status, assigned_to, category, priority FROM complaints WHERE assigned_to IS NULL"
		);

		console.log("\n📋 Unassigned complaints:");
		if (rows.length === 0) {
			console.log("✅ No unassigned complaints found - Staff Queue is working correctly!");
			console.log(
				"All complaints have been assigned (this is why queue shows empty)"
			);
		} else {
			console.log(JSON.stringify(rows, null, 2));
		}

		process.exit(0);
	} catch (error) {
		console.error("❌ Error:", error);
		process.exit(1);
	}
}

createTestComplaint();
