import { query } from "../config/database";

async function createTestComplaint() {
	try {
		// Create an unassigned complaint
		const [result]: any = await query(
			`INSERT INTO complaints 
			(user_id, title, description, category, priority, location, status, complaint_number, created_at, updated_at) 
			VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
			[
				3, // user_id
				"Broken AC in Conference Room",
				"The air conditioning unit in the main conference room is not cooling properly. Temperature is currently 28°C.",
				"HVAC",
				"High",
				"Conference Room A, 3rd Floor",
				"Open",
				`CMP-2025-${String(Math.floor(Math.random() * 10000)).padStart(4, "0")}`,
			]
		);

		console.log("✅ Created unassigned complaint with ID:", result.insertId);

		// Check all unassigned complaints
		const rows: any = await query(
			"SELECT id, title, status, assigned_to FROM complaints WHERE assigned_to IS NULL"
		);

		console.log("\n📋 All unassigned complaints:");
		console.log(JSON.stringify(rows, null, 2));

		process.exit(0);
	} catch (error) {
		console.error("❌ Error:", error);
		process.exit(1);
	}
}

createTestComplaint();
