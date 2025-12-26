import { query } from "../config/database";

async function checkQueue() {
	try {
		console.log("Checking queue complaints...\n");

		const result = await query(`
      SELECT id, title, status, assigned_to, category, priority 
      FROM complaints 
      WHERE status = 'Open' AND assigned_to IS NULL 
      ORDER BY id DESC 
      LIMIT 15
    `);

		console.log(
			`Found ${(result as any[]).length} Open unassigned complaints:\n`
		);
		(result as any[]).forEach((c: any) => {
			console.log(
				`  #${c.id}: ${c.title} [${c.category}/${c.priority}] - assigned_to: ${c.assigned_to}`
			);
		});

		const allOpen = await query(`
      SELECT COUNT(*) as count 
      FROM complaints 
      WHERE status = 'Open'
    `);

		const unassigned = await query(`
      SELECT COUNT(*) as count 
      FROM complaints 
      WHERE assigned_to IS NULL
    `);

		console.log(`\nTotal Open: ${(allOpen as any[])[0].count}`);
		console.log(`Total Unassigned: ${(unassigned as any[])[0].count}`);

		process.exit(0);
	} catch (error) {
		console.error("Error:", error);
		process.exit(1);
	}
}

checkQueue();
