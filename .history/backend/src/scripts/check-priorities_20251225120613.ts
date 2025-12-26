import { query } from "../config/database";

async function checkPriorities() {
	try {
		console.log("Checking priority values in database...\n");

		// Check distinct priorities
		const distinctRows: any = await query(
			"SELECT DISTINCT priority FROM complaints ORDER BY priority"
		);
		console.log("Distinct priorities in database:", distinctRows);

		// Check priority counts
		const countRows: any = await query(
			"SELECT priority, COUNT(*) as count FROM complaints GROUP BY priority ORDER BY priority"
		);
		console.log("\nPriority breakdown:");
		countRows.forEach((row: any) => {
			console.log(`  ${row.priority}: ${row.count}`);
		});

		process.exit(0);
	} catch (error) {
		console.error("Error:", error);
		process.exit(1);
	}
}

checkPriorities();
