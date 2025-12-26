import { query } from "../config/database";

async function checkIssues() {
	console.log("=== Checking Database Issues ===\n");

	// Test the actual query that should run for David Brown
	console.log("1. Running query for assigned_to=7:");
	const davidAssigned = await query<any[]>(
		`SELECT c.id, c.title, c.category, c.assigned_to, c.status 
     FROM complaints c 
     WHERE c.assigned_to = ?`,
		[7]
	);
	console.table(davidAssigned);

	// Test the OR query for category=Facility OR assigned_to=7
	console.log(
		"\n2. Running OR query for category='Facility' OR assigned_to=7:"
	);
	const davidAll = await query<any[]>(
		`SELECT c.id, c.title, c.category, c.assigned_to, c.status 
     FROM complaints c 
     WHERE (c.category = ? OR c.assigned_to = ?)`,
		["Facility", 7]
	);
	console.table(davidAll);

	// Check Emily's data (id=5, department=Electrical)
	console.log(
		"\n3. Running OR query for category='Electrical' OR assigned_to=5 (Emily):"
	);
	const emilyAll = await query<any[]>(
		`SELECT c.id, c.title, c.category, c.assigned_to, c.status 
     FROM complaints c 
     WHERE (c.category = ? OR c.assigned_to = ?)`,
		["Electrical", 5]
	);
	console.table(emilyAll);

	// Check unassigned Facility complaints (queue for David)
	console.log("\n4. Unassigned Facility complaints (David's queue):");
	const facilityQueue = await query<any[]>(
		`SELECT c.id, c.title, c.category, c.assigned_to, c.status 
     FROM complaints c 
     WHERE c.assigned_to IS NULL AND c.category = 'Facility'`
	);
	console.table(facilityQueue);

	process.exit(0);
}

checkIssues().catch(console.error);
