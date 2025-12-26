import { query } from "../config/database";

async function createQueueTestData() {
	console.log("Creating test complaints for queue...\n");

	// Calculate SLA deadlines
	const getSlaDeadline = (priority: string): Date => {
		const now = new Date();
		switch (priority) {
			case "Critical":
				return new Date(now.getTime() + 4 * 60 * 60 * 1000); // 4 hours
			case "High":
				return new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours
			case "Medium":
				return new Date(now.getTime() + 48 * 60 * 60 * 1000); // 48 hours
			default:
				return new Date(now.getTime() + 72 * 60 * 60 * 1000); // 72 hours
		}
	};

	const complaints = [
		{
			userId: 11,
			title: "Broken door handle needs replacement",
			description:
				"The door handle in my apartment is completely broken and needs immediate replacement. Cannot lock the door properly.",
			category: "Facility",
			priority: "High",
			location: "Building A, Apt 301",
		},
		{
			userId: 12,
			title: "Water heater not heating water",
			description:
				"The water heater is not working. Only cold water is coming out even after waiting for 30 minutes.",
			category: "Plumbing",
			priority: "High",
			location: "Building B, Apt 205",
		},
		{
			userId: 13,
			title: "Computer not connecting to network",
			description:
				"My work computer cannot connect to the office network. Tried restarting multiple times but still not working.",
			category: "IT",
			priority: "Medium",
			location: "Building C, Office 402",
		},
		{
			userId: 14,
			title: "Ceiling light not working",
			description:
				"The main ceiling light in the living room is not turning on. Bulb seems fine.",
			category: "Electrical",
			priority: "Medium",
			location: "Building A, Apt 105",
		},
		{
			userId: 15,
			title: "Leaking faucet in kitchen sink",
			description:
				"The kitchen sink faucet is leaking continuously. Water is dripping even when turned off completely.",
			category: "Plumbing",
			priority: "Low",
			location: "Building B, Apt 310",
		},
	];

	try {
		for (const c of complaints) {
			const slaDeadline = getSlaDeadline(c.priority);

			await query(
				`INSERT INTO complaints 
        (user_id, title, description, category, priority, location, status, sla_deadline, created_at) 
        VALUES (?, ?, ?, ?, ?, ?, 'Open', ?, NOW())`,
				[
					c.userId,
					c.title,
					c.description,
					c.category,
					c.priority,
					c.location,
					slaDeadline,
				]
			);

			console.log(`✅ Created: ${c.title} (${c.priority} - ${c.category})`);
		}

		// Check total
		const result: any = await query(
			"SELECT COUNT(*) as count FROM complaints WHERE status = 'Open' AND assigned_to IS NULL"
		);

		console.log(`\n📊 Total unassigned Open complaints: ${result[0].count}`);
		console.log(
			"\n✅ Queue test data created successfully! Refresh the queue page to see them.\n"
		);

		process.exit(0);
	} catch (error) {
		console.error("❌ Error creating test data:", error);
		process.exit(1);
	}
}

createQueueTestData();
