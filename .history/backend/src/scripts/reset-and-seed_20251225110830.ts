import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

interface SeedUser {
	name: string;
	email: string;
	password: string;
	role: string;
	department: string;
	expertise: string | null;
}

// Complete user database with departments
const users: SeedUser[] = [
	// ===== ADMIN =====
	{
		name: "System Administrator",
		email: "admin@portal.com",
		password: "Admin123!",
		role: "Admin",
		department: "Administration",
		expertise: null,
	},

	// ===== PLUMBING DEPARTMENT =====
	{
		name: "Robert Martinez (Plumber)",
		email: "robert.plumber@portal.com",
		password: "Staff123!",
		role: "Staff",
		department: "Plumbing",
		expertise: "Plumbing",
	},
	{
		name: "Sarah Johnson (Plumber)",
		email: "sarah.plumber@portal.com",
		password: "Staff123!",
		role: "Staff",
		department: "Plumbing",
		expertise: "Plumbing",
	},

	// ===== ELECTRICAL DEPARTMENT =====
	{
		name: "Michael Chen (Electrician)",
		email: "michael.electric@portal.com",
		password: "Staff123!",
		role: "Staff",
		department: "Electrical",
		expertise: "Electrical",
	},
	{
		name: "Emily Davis (Electrician)",
		email: "emily.electric@portal.com",
		password: "Staff123!",
		role: "Staff",
		department: "Electrical",
		expertise: "Electrical",
	},
	{
		name: "James Wilson (Electrician)",
		email: "james.electric@portal.com",
		password: "Staff123!",
		role: "Staff",
		department: "Electrical",
		expertise: "Electrical",
	},

	// ===== FACILITY DEPARTMENT =====
	{
		name: "David Brown (Facility Tech)",
		email: "david.facility@portal.com",
		password: "Staff123!",
		role: "Staff",
		department: "Facility",
		expertise: "Facility",
	},
	{
		name: "Lisa Anderson (Facility Tech)",
		email: "lisa.facility@portal.com",
		password: "Staff123!",
		role: "Staff",
		department: "Facility",
		expertise: "Facility",
	},

	// ===== IT DEPARTMENT =====
	{
		name: "Kevin Lee (IT Support)",
		email: "kevin.it@portal.com",
		password: "Staff123!",
		role: "Staff",
		department: "IT",
		expertise: "IT",
	},
	{
		name: "Anna Taylor (IT Support)",
		email: "anna.it@portal.com",
		password: "Staff123!",
		role: "Staff",
		department: "IT",
		expertise: "IT",
	},

	// ===== NORMAL USERS =====
	{
		name: "John Smith (Resident)",
		email: "john.smith@example.com",
		password: "User123!",
		role: "User",
		department: "Residents",
		expertise: null,
	},
	{
		name: "Emma Watson (Resident)",
		email: "emma.watson@example.com",
		password: "User123!",
		role: "User",
		department: "Residents",
		expertise: null,
	},
	{
		name: "Oliver Robinson (Resident)",
		email: "oliver.robinson@example.com",
		password: "User123!",
		role: "User",
		department: "Residents",
		expertise: null,
	},
	{
		name: "Sophia Garcia (Student)",
		email: "sophia.garcia@example.com",
		password: "User123!",
		role: "User",
		department: "Students",
		expertise: null,
	},
	{
		name: "William Thomas (Student)",
		email: "william.thomas@example.com",
		password: "User123!",
		role: "User",
		department: "Students",
		expertise: null,
	},
];

interface ComplaintTemplate {
	title: string;
	description: string;
	category: string;
	priority: string;
	location: string;
	userOffset: number; // Which user (offset from users array)
	daysAgo: number; // How many days ago was it created
}

// Diverse complaint scenarios
const complaintTemplates: ComplaintTemplate[] = [
	// HIGH PRIORITY - Recent
	{
		title: "Water pipe burst in basement",
		description:
			"Major water leak from ceiling causing flooding in basement storage area. Water is pouring continuously and has damaged several items. Immediate attention required to prevent further property damage.",
		category: "Plumbing",
		priority: "Critical",
		location: "Building A - Basement Level",
		userOffset: 10, // John Smith
		daysAgo: 0.5,
	},
	{
		title: "Complete power outage in apartment",
		description:
			"All electricity is down in my unit since 6 AM this morning. No lights, refrigerator stopped working, and I cannot work from home. This is affecting my daily life significantly.",
		category: "Electrical",
		priority: "High",
		location: "Building B - Apt 304",
		userOffset: 11, // Emma Watson
		daysAgo: 0.3,
	},
	{
		title: "Network completely down - Unable to work",
		description:
			"Internet and WiFi connection has been down for the past 4 hours. I have important deadlines and online meetings scheduled. Multiple residents are affected. Please resolve urgently.",
		category: "IT",
		priority: "High",
		location: "Building C - Floor 2",
		userOffset: 13, // Sophia Garcia
		daysAgo: 0.2,
	},

	// MEDIUM PRIORITY - Recent
	{
		title: "Toilet flush not working properly",
		description:
			"The toilet flush mechanism is broken and requires multiple attempts to flush. Sometimes it doesn't flush at all. This is causing hygiene concerns and inconvenience.",
		category: "Plumbing",
		priority: "Medium",
		location: "Building A - Apt 205",
		userOffset: 12, // Oliver Robinson
		daysAgo: 1,
	},
	{
		title: "Ceiling fan making loud noise",
		description:
			"Ceiling fan in living room makes grinding and rattling sounds when turned on. It seems unstable and might be a safety hazard. Speed control also not working properly.",
		category: "Electrical",
		priority: "Medium",
		location: "Building D - Apt 401",
		userOffset: 14, // William Thomas
		daysAgo: 1.5,
	},
	{
		title: "AC unit leaking water inside room",
		description:
			"Air conditioning unit is dripping water onto the floor. There's a puddle forming underneath and it's creating a slip hazard. The cooling is also not as effective as before.",
		category: "Facility",
		priority: "Medium",
		location: "Building B - Apt 302",
		userOffset: 10, // John Smith
		daysAgo: 2,
	},
	{
		title: "Printer in common area not working",
		description:
			"The shared printer keeps showing error messages and paper jams. Multiple residents need to print documents for work and studies. Requires technical support.",
		category: "IT",
		priority: "Medium",
		location: "Building A - Common Area Floor 1",
		userOffset: 11, // Emma Watson
		daysAgo: 2.5,
	},

	// LOW PRIORITY - Older
	{
		title: "Kitchen sink draining slowly",
		description:
			"Kitchen sink is taking longer than usual to drain water. Seems like there might be a partial clog in the pipes. Not an emergency but needs attention to prevent complete blockage.",
		category: "Plumbing",
		priority: "Low",
		location: "Building C - Apt 108",
		userOffset: 12, // Oliver Robinson
		daysAgo: 3,
	},
	{
		title: "Hallway light flickering",
		description:
			"The light in the 3rd-floor hallway flickers intermittently. It's annoying and might indicate an electrical issue. Should be checked before it becomes a bigger problem.",
		category: "Electrical",
		priority: "Low",
		location: "Building A - 3rd Floor Hallway",
		userOffset: 13, // Sophia Garcia
		daysAgo: 4,
	},
	{
		title: "Broken window latch in bedroom",
		description:
			"Window latch is broken and window cannot be properly secured. Concerned about security and also drafts coming through. Please send someone to fix or replace the latch.",
		category: "Facility",
		priority: "Low",
		location: "Building D - Apt 505",
		userOffset: 14, // William Thomas
		daysAgo: 5,
	},
	{
		title: "WiFi signal weak in my apartment",
		description:
			"WiFi coverage is very weak in my unit. I have to stay near the router to get decent signal. Other apartments in the building seem to have better coverage. Can this be improved?",
		category: "IT",
		priority: "Low",
		location: "Building B - Apt 201",
		userOffset: 10, // John Smith
		daysAgo: 6,
	},

	// ADDITIONAL VARIETY
	{
		title: "Bathroom shower head not working",
		description:
			"Shower head has very low water pressure and some nozzles are completely blocked. Makes showering difficult. Please clean or replace the shower head.",
		category: "Plumbing",
		priority: "Medium",
		location: "Building C - Apt 306",
		userOffset: 11, // Emma Watson
		daysAgo: 3,
	},
	{
		title: "Power socket not functioning",
		description:
			"One of the power sockets in my bedroom stopped working yesterday. I tested with multiple devices and it's definitely dead. Need it fixed as I use it for laptop charging.",
		category: "Electrical",
		priority: "Medium",
		location: "Building A - Apt 102",
		userOffset: 12, // Oliver Robinson
		daysAgo: 1,
	},
	{
		title: "Door lock jammed - Cannot open smoothly",
		description:
			"Main door lock is very difficult to turn. Sometimes gets stuck and I worry about getting locked out. Lock mechanism needs lubrication or replacement.",
		category: "Facility",
		priority: "Medium",
		location: "Building B - Apt 405",
		userOffset: 13, // Sophia Garcia
		daysAgo: 2,
	},
	{
		title: "Email access issues - Cannot login",
		description:
			"Having trouble accessing my portal email account. Password reset link is not working either. Need IT support to regain access as I have important communications pending.",
		category: "IT",
		priority: "High",
		location: "Building D - Apt 203",
		userOffset: 14, // William Thomas
		daysAgo: 0.5,
	},
];

async function main() {
	const connection = await mysql.createConnection({
		host: process.env.DB_HOST || "localhost",
		user: process.env.DB_USER || "root",
		password: process.env.DB_PASSWORD || "",
		database: process.env.DB_NAME || "complaint_portal",
	});

	try {
		console.log("\n🗑️  COMPLETE DATABASE RESET INITIATED...\n");

		// 1. Clear all existing data
		console.log("📌 Step 1: Clearing existing data...");
		await connection.query("SET FOREIGN_KEY_CHECKS = 0");

		const tables = [
			"audit_logs",
			"feedback",
			"comments",
			"status_history",
			"notifications",
			"complaints",
			"refresh_tokens",
			"users",
		];

		for (const table of tables) {
			await connection.query(`TRUNCATE TABLE ${table}`);
			console.log(`   ✅ Cleared ${table}`);
		}

		await connection.query("SET FOREIGN_KEY_CHECKS = 1");

		// 2. Create users with hashed passwords
		console.log("\n📌 Step 2: Creating users...");
		const userIds: number[] = [];

		for (const user of users) {
			const hashedPassword = await bcrypt.hash(user.password, 10);
			const [result]: any = await connection.query(
				`INSERT INTO users (name, email, password, role, contact_info, expertise, availability_status, is_active) 
         VALUES (?, ?, ?, ?, ?, ?, 'Available', TRUE)`,
				[
					user.name,
					user.email,
					hashedPassword,
					user.role,
					`+1-555-${Math.floor(Math.random() * 9000) + 1000}`,
					user.expertise,
				]
			);
			userIds.push(result.insertId);
			console.log(
				`   ✅ ${user.role.padEnd(6)} | ${user.name.padEnd(35)} | ${user.email}`
			);
		}

		// 3. Get staff members by department for smart assignment
		console.log("\n📌 Step 3: Mapping staff by department...");
		const staffByDept: {
			[key: string]: Array<{ id: number; name: string; workload: number }>;
		} = {
			Plumbing: [],
			Electrical: [],
			Facility: [],
			IT: [],
			Other: [],
		};

		for (let i = 0; i < users.length; i++) {
			const user = users[i];
			if (user.role === "Staff" && user.expertise) {
				staffByDept[user.expertise].push({
					id: userIds[i],
					name: user.name,
					workload: 0, // Initial workload
				});
				console.log(
					`   ✅ ${user.expertise} Dept: ${user.name} (ID: ${userIds[i]})`
				);
			}
		}

		// 4. Create complaints with intelligent auto-assignment
		console.log("\n📌 Step 4: Creating complaints with auto-assignment...");

		const priorityWeights: { [key: string]: number } = {
			Critical: 5,
			High: 3,
			Medium: 2,
			Low: 1,
		};

		for (const template of complaintTemplates) {
			const userId = userIds[template.userOffset];
			const createdAt = new Date(
				Date.now() - template.daysAgo * 24 * 60 * 60 * 1000
			);

			// Smart staff selection: lowest workload in department
			const deptStaff = staffByDept[template.category] || staffByDept["Other"];
			deptStaff.sort((a, b) => a.workload - b.workload); // Sort by workload
			const assignedStaff = deptStaff[0];

			// Calculate SLA deadline based on priority
			const slaHours: { [key: string]: number } = {
				Critical: 4,
				High: 24,
				Medium: 48,
				Low: 72,
			};
			const slaDeadline = new Date(
				createdAt.getTime() + slaHours[template.priority] * 60 * 60 * 1000
			);

			// Determine status based on age
			let status = "Assigned";
			let resolvedAt = null;

			if (template.daysAgo > 4) {
				status = "Resolved";
				resolvedAt = new Date(createdAt.getTime() + 2 * 24 * 60 * 60 * 1000); // Resolved 2 days after creation
			} else if (template.daysAgo > 2) {
				status = "In-progress";
			}

			// Check if overdue
			const isOverdue = status !== "Resolved" && new Date() > slaDeadline;

			// Insert complaint
			const [result]: any = await connection.query(
				`INSERT INTO complaints (
          user_id, staff_id, assigned_to, title, description, category, priority, 
          location, status, sla_deadline, is_overdue, resolved_at, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
				[
					userId,
					assignedStaff.id,
					assignedStaff.id, // assigned_to (same as staff_id)
					template.title,
					template.description,
					template.category,
					template.priority,
					template.location,
					status,
					slaDeadline,
					isOverdue,
					resolvedAt,
					createdAt,
				]
			);

			const complaintId = result.insertId;

			// Update staff workload
			assignedStaff.workload += priorityWeights[template.priority];

			// Create status history
			// 1. System creates complaint
			await connection.query(
				`INSERT INTO status_history (complaint_id, previous_status, new_status, updated_by, timestamp)
         VALUES (?, NULL, 'Open', ?, ?)`,
				[complaintId, userId, createdAt]
			);

			// 2. Assigned to department
			const assignedToDepTime = new Date(createdAt.getTime() + 5 * 60 * 1000); // 5 mins later
			await connection.query(
				`INSERT INTO status_history (complaint_id, previous_status, new_status, updated_by, notes, timestamp)
         VALUES (?, 'Open', 'Assigned', ?, ?, ?)`,
				[
					complaintId,
					1, // System/Admin
					`Assigned to ${template.category} Department`,
					assignedToDepTime,
				]
			);

			// 3. Assigned to specific staff
			const assignedToStaffTime = new Date(
				assignedToDepTime.getTime() + 2 * 60 * 1000
			); // 2 mins later
			await connection.query(
				`INSERT INTO status_history (complaint_id, previous_status, new_status, updated_by, notes, timestamp)
         VALUES (?, 'Assigned', 'Assigned', ?, ?, ?)`,
				[
					complaintId,
					1, // System/Admin
					`Assigned to ${assignedStaff.name}`,
					assignedToStaffTime,
				]
			);

			// 4. If in-progress or resolved, add those statuses
			if (status === "In-progress" || status === "Resolved") {
				const inProgressTime = new Date(
					assignedToStaffTime.getTime() + 30 * 60 * 1000
				); // 30 mins later
				await connection.query(
					`INSERT INTO status_history (complaint_id, previous_status, new_status, updated_by, notes, timestamp)
           VALUES (?, 'Assigned', 'In-progress', ?, ?, ?)`,
					[
						complaintId,
						assignedStaff.id,
						"Started working on this issue",
						inProgressTime,
					]
				);

				if (status === "Resolved" && resolvedAt) {
					await connection.query(
						`INSERT INTO status_history (complaint_id, previous_status, new_status, updated_by, notes, timestamp)
             VALUES (?, 'In-progress', 'Resolved', ?, ?, ?)`,
						[
							complaintId,
							assignedStaff.id,
							"Issue has been fixed and verified",
							resolvedAt,
						]
					);

					// Add feedback for resolved complaints
					const rating = Math.floor(Math.random() * 2) + 4; // 4 or 5 stars
					const feedbackComments = [
						"Very satisfied with the quick response!",
						"Problem solved efficiently. Thank you!",
						"Great service, much appreciated.",
						"Fixed perfectly. No issues now.",
					];

					await connection.query(
						`INSERT INTO feedback (complaint_id, rating, review, is_resolved, submitted_at)
             VALUES (?, ?, ?, TRUE, ?)`,
						[
							complaintId,
							rating,
							feedbackComments[
								Math.floor(Math.random() * feedbackComments.length)
							],
							new Date(resolvedAt.getTime() + 60 * 60 * 1000), // 1 hour after resolution
						]
					);
				}
			}

			// Create notification for user
			await connection.query(
				`INSERT INTO notifications (user_id, complaint_id, message, type, created_at)
         VALUES (?, ?, ?, 'StatusUpdate', ?)`,
				[
					userId,
					complaintId,
					`Your complaint "${template.title}" has been assigned to ${assignedStaff.name}`,
					assignedToStaffTime,
				]
			);

			// Create notification for staff
			await connection.query(
				`INSERT INTO notifications (user_id, complaint_id, message, type, created_at)
         VALUES (?, ?, ?, 'Assigned', ?)`,
				[
					assignedStaff.id,
					complaintId,
					`New ${template.priority} priority complaint assigned: "${template.title}"`,
					assignedToStaffTime,
				]
			);

			console.log(
				`   ✅ ${template.priority.padEnd(8)} | ${template.category.padEnd(
					10
				)} → ${assignedStaff.name.padEnd(25)} | ${template.title.substring(
					0,
					40
				)}`
			);
		}

		// 5. Add some comments to complaints
		console.log("\n📌 Step 5: Adding sample comments...");
		const internalComments = [
			"Checked the issue, will need to order replacement parts.",
			"Issue is more complex than initially thought. Escalating.",
			"Scheduled visit for tomorrow morning.",
		];

		const publicComments = [
			"We are working on this issue. Expected resolution within 24 hours.",
			"Parts have arrived. Will complete the repair today.",
			"Issue has been identified and fix is in progress.",
		];

		// Add internal comment to complaint #1
		await connection.query(
			`INSERT INTO comments (complaint_id, user_id, content, is_internal)
       VALUES (1, 2, ?, TRUE)`,
			[internalComments[0]]
		);

		// Add public comment to complaint #2
		await connection.query(
			`INSERT INTO comments (complaint_id, user_id, content, is_internal)
       VALUES (2, 3, ?, FALSE)`,
			[publicComments[0]]
		);

		console.log("   ✅ Sample comments added");

		// 6. Summary
		const [userCount]: any = await connection.query(
			"SELECT role, COUNT(*) as count FROM users GROUP BY role"
		);
		const [complaintCount]: any = await connection.query(
			"SELECT status, COUNT(*) as count FROM complaints GROUP BY status"
		);
		const [feedbackCount]: any = await connection.query(
			"SELECT COUNT(*) as count FROM feedback"
		);

		console.log("\n" + "=".repeat(70));
		console.log("✅ DATABASE RESET COMPLETED SUCCESSFULLY!");
		console.log("=".repeat(70));

		console.log("\n📊 SUMMARY:");
		console.log("\n👥 Users by Role:");
		userCount.forEach((row: any) => {
			console.log(`   ${row.role.padEnd(6)}: ${row.count}`);
		});

		console.log("\n📝 Complaints by Status:");
		complaintCount.forEach((row: any) => {
			console.log(`   ${row.status.padEnd(12)}: ${row.count}`);
		});

		console.log(`\n⭐ Total Feedback Submitted: ${feedbackCount[0].count}\n`);
	} catch (error) {
		console.error("\n❌ Error during database reset:", error);
		throw error;
	} finally {
		await connection.end();
	}
}

main().catch(console.error);
