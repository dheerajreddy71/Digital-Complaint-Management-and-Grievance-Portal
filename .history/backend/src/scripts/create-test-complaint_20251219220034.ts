import { query } from "../config/database";

async function createTestComplaint() {
	try {
		// Fix data inconsistencies - complaints with assigned_to=NULL should have status='Open'
		const updateResult: any = await query(
			"UPDATE complaints SET status = 'Open' WHERE assigned_to IS NULL AND status != 'Resolved' AND status != 'Closed'"
		);
		console.log("✅ Fixed data inconsistencies");

		// Create a new unassigned complaint
		const insertResult: any = await query(
			`INSERT INTO complaints 
			(user_id, title, description, category, priority, location, status, sla_deadline, created_at, updated_at) 
			VALUES (?, ?, ?, ?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 8 HOUR), NOW(), NOW())`,
			[
				3, // user_id (Regular User)
				"Broken Light in Hallway",
				"The overhead light in the second floor hallway near Room 205 is flickering and needs replacement.",
				"Electrical", // Valid category from existing data
				"Medium",
				"2nd Floor Hallway near Room 205",
				"Open",
			]
		);

		console.log(
			"\n✅ Created new unassigned complaint with ID:",
			(insertResult as any).insertId
		);

		// Check unassigned Open complaints (what staff queue shows)
		const queueComplaints: any = await query(
			"SELECT id, title, status, assigned_to, category, priority FROM complaints WHERE status='Open' AND assigned_to IS NULL ORDER BY created_at DESC"
		);

		console.log("\n📋 Staff Queue (Open & Unassigned complaints):");
		console.log(JSON.stringify(queueComplaints, null, 2));
		console.log(`\n✅ Found ${queueComplaints.length} complaints in staff queue`);

		process.exit(0);
	} catch (error) {
		console.error("❌ Error:", error);
		process.exit(1);
	}
}

createTestComplaint();
