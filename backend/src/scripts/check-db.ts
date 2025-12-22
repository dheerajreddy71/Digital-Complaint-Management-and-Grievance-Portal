import mysql from "mysql2/promise";
import * as dotenv from "dotenv";

dotenv.config();

const config = {
	host: process.env.DB_HOST || "localhost",
	port: parseInt(process.env.DB_PORT || "3306"),
	user: process.env.DB_USER || "root",
	password: process.env.DB_PASSWORD || "",
	database: process.env.DB_NAME || "complaint_portal",
};

async function checkDatabase() {
	const connection = await mysql.createConnection(config);

	try {
		console.log("📊 Checking database status...\n");

		const [users] = await connection.query(
			"SELECT id, name, email, role FROM users"
		);
		console.log("👥 Users:");
		console.table(users);

		const [complaints] = await connection.query(
			"SELECT id, title, category, status, priority, assigned_to FROM complaints LIMIT 10"
		);
		console.log("\n📝 Sample Complaints:");
		console.table(complaints);

		const [columns] = await connection.query("SHOW COLUMNS FROM complaints");
		console.log("\n🔧 Complaints Table Structure:");
		console.table(columns);
	} catch (error: any) {
		console.error("❌ Error:", error.message);
	} finally {
		await connection.end();
	}
}

checkDatabase();
