import mysql from "mysql2/promise";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

const config = {
	host: process.env.DB_HOST || "localhost",
	port: parseInt(process.env.DB_PORT || "3306"),
	user: process.env.DB_USER || "root",
	password: process.env.DB_PASSWORD || "",
	database: process.env.DB_NAME || "complaint_portal",
	multipleStatements: true,
};

async function runMigration() {
	let connection;

	try {
		console.log("🔄 Connecting to database...");
		connection = await mysql.createConnection(config);
		console.log("✅ Connected to database");

		console.log("\n📖 Reading migration script...");
		const migrationPath = path.join(__dirname, "migrate-database.sql");
		const migrationSQL = fs.readFileSync(migrationPath, "utf8");

		console.log("🚀 Running migration...");
		const [results] = await connection.query(migrationSQL);

		console.log("\n✅ Migration completed successfully!");

		// Display results
		if (Array.isArray(results)) {
			const lastResult = results[results.length - 1];
			if (Array.isArray(lastResult)) {
				console.log("\n📊 Database Statistics:");
				console.table(lastResult);
			}
		}
	} catch (error: any) {
		console.error("❌ Migration failed:", error.message);
		console.error("\nFull error:", error);
		process.exit(1);
	} finally {
		if (connection) {
			await connection.end();
			console.log("\n🔌 Database connection closed");
		}
	}
}

// Run migration
console.log("🎯 Starting database migration...\n");
runMigration();
