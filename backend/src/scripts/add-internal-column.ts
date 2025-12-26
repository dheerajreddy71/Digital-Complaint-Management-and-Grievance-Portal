import mysql from "mysql2/promise";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

async function addMissingColumn() {
	const connection = await mysql.createConnection({
		host: process.env.DB_HOST || "localhost",
		user: process.env.DB_USER || "root",
		password: process.env.DB_PASSWORD || "",
		database: process.env.DB_NAME || "complaint_portal",
	});

	try {
		console.log("\n🔧 Adding is_internal column to comments table...\n");

		// Check if column exists
		const [columns]: any = await connection.query(
			"SHOW COLUMNS FROM comments LIKE 'is_internal'"
		);

		if (columns.length === 0) {
			await connection.query(
				"ALTER TABLE comments ADD COLUMN is_internal BOOLEAN DEFAULT FALSE AFTER content"
			);
			console.log("✅ is_internal column added successfully!\n");
		} else {
			console.log("✅ is_internal column already exists!\n");
		}
	} catch (error) {
		console.error("❌ Error:", error);
	} finally {
		await connection.end();
	}
}

addMissingColumn();
