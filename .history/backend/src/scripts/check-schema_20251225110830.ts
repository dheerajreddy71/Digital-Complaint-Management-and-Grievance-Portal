import mysql from "mysql2/promise";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

async function checkSchema() {
	const connection = await mysql.createConnection({
		host: process.env.DB_HOST || "localhost",
		user: process.env.DB_USER || "root",
		password: process.env.DB_PASSWORD || "",
		database: process.env.DB_NAME || "complaint_portal",
	});

	try {
		console.log("\n🔍 Checking complaints table schema...\n");

		const [columns]: any = await connection.query(
			"SHOW COLUMNS FROM complaints"
		);

		console.log("Columns in complaints table:");
		columns.forEach((col: any) => {
			console.log(`  - ${col.Field} (${col.Type})`);
		});

		console.log("\n🔍 Checking a sample complaint...\n");

		const [complaints]: any = await connection.query(
			"SELECT id, user_id, staff_id, assigned_to, title, status FROM complaints LIMIT 1"
		);

		if (complaints.length > 0) {
			console.log("Sample complaint:", complaints[0]);
		}
	} catch (error) {
		console.error("❌ Error:", error);
	} finally {
		await connection.end();
	}
}

checkSchema();
