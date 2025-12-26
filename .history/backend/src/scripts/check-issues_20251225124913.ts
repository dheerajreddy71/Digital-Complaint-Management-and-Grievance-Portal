import { query } from "../config/database";

async function checkIssues() {
  console.log("=== Checking Database Issues ===\n");

  // Check complaints assigned to David Brown (id=7)
  console.log("1. Complaints assigned to David Brown (id=7):");
  const davidComplaints = await query<any[]>("SELECT id, title, category, assigned_to, status FROM complaints WHERE assigned_to = 7");
  console.table(davidComplaints);

  // Check Facility complaints
  console.log("\n2. Facility category complaints:");
  const facilityComplaints = await query<any[]>("SELECT id, title, category, assigned_to, status FROM complaints WHERE category = 'Facility'");
  console.table(facilityComplaints);

  // Check unassigned complaints by category
  console.log("\n3. Unassigned complaints by category:");
  const unassignedByCategory = await query<any[]>("SELECT category, COUNT(*) as count FROM complaints WHERE assigned_to IS NULL GROUP BY category");
  console.table(unassignedByCategory);

  process.exit(0);
}

checkIssues().catch(console.error);
