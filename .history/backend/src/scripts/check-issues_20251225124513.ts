import { query } from "../config/database";

async function checkIssues() {
  console.log("=== Checking Database Issues ===\n");

  // Check staff users and departments
  console.log("1. Staff Users and Departments:");
  const staff = await query<any[]>("SELECT id, name, email, department, role FROM users WHERE role = 'Staff'");
  console.table(staff);

  // Check complaints with categories
  console.log("\n2. Complaints by Category:");
  const categories = await query<any[]>("SELECT category, COUNT(*) as count FROM complaints GROUP BY category");
  console.table(categories);

  // Check notifications for a specific user
  console.log("\n3. Notifications (last 10):");
  const notifications = await query<any[]>("SELECT id, user_id, message, is_read, created_at FROM notifications ORDER BY id DESC LIMIT 10");
  console.table(notifications);

  // Check unread notification counts by user
  console.log("\n4. Unread Notification Counts by User:");
  const unreadCounts = await query<any[]>(`
    SELECT u.id, u.name, COUNT(n.id) as unread_count 
    FROM users u 
    LEFT JOIN notifications n ON u.id = n.user_id AND n.is_read = FALSE 
    GROUP BY u.id, u.name
    HAVING unread_count > 0
  `);
  console.table(unreadCounts);

  // Check if department matches category mapping
  console.log("\n5. Department to Category Mapping:");
  const deptMapping = await query<any[]>(`
    SELECT DISTINCT u.department as staff_department, c.category as complaint_category
    FROM users u
    CROSS JOIN complaints c
    WHERE u.role = 'Staff' AND u.department IS NOT NULL
    GROUP BY u.department, c.category
  `);
  console.table(deptMapping);

  process.exit(0);
}

checkIssues().catch(console.error);
