import mysql from "mysql2/promise";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

async function verify() {
	const connection = await mysql.createConnection({
		host: process.env.DB_HOST || "localhost",
		user: process.env.DB_USER || "root",
		password: process.env.DB_PASSWORD || "",
		database: process.env.DB_NAME || "complaint_portal",
	});

	try {
		console.log("\n📊 STAFF ASSIGNMENT VERIFICATION\n");
		console.log("=".repeat(70));

		const [staff]: any = await connection.query(
			`SELECT 
        u.id,
        u.name,
        u.email,
        u.expertise,
        COUNT(c.id) as assigned_count
      FROM users u
      LEFT JOIN complaints c ON u.id = c.assigned_to
      WHERE u.role = 'Staff'
      GROUP BY u.id, u.name, u.email, u.expertise
      ORDER BY u.expertise, u.name`
		);

		console.log("\n🔧 Plumbing Department:");
		staff
			.filter((s: any) => s.expertise === "Plumbing")
			.forEach((s: any) => {
				console.log(`  ${s.name.padEnd(35)} ${s.assigned_count} complaint(s)`);
			});

		console.log("\n⚡ Electrical Department:");
		staff
			.filter((s: any) => s.expertise === "Electrical")
			.forEach((s: any) => {
				console.log(`  ${s.name.padEnd(35)} ${s.assigned_count} complaint(s)`);
			});

		console.log("\n🏢 Facility Department:");
		staff
			.filter((s: any) => s.expertise === "Facility")
			.forEach((s: any) => {
				console.log(`  ${s.name.padEnd(35)} ${s.assigned_count} complaint(s)`);
			});

		console.log("\n💻 IT Department:");
		staff
			.filter((s: any) => s.expertise === "IT")
			.forEach((s: any) => {
				console.log(`  ${s.name.padEnd(35)} ${s.assigned_count} complaint(s)`);
			});

		const totalAssigned = staff.reduce(
			(sum: number, s: any) => sum + s.assigned_count,
			0
		);
		console.log("\n" + "=".repeat(70));
		console.log(`📊 Total Assigned Complaints: ${totalAssigned}`);
		console.log("=".repeat(70) + "\n");

		// Check if any complaints are unassigned
		const [unassigned]: any = await connection.query(
			"SELECT COUNT(*) as count FROM complaints WHERE assigned_to IS NULL"
		);
		if (unassigned[0].count > 0) {
			console.log(
				`⚠️  Warning: ${unassigned[0].count} unassigned complaints\n`
			);
		}
	} catch (error) {
		console.error("❌ Error:", error);
	} finally {
		await connection.end();
	}
}

verify();
