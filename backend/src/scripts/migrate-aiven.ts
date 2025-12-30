import mysql from "mysql2/promise";
import config from "../config";

async function migrateDatabase(): Promise<void> {
	console.log("Connecting to Aiven database...");
	console.log("Host:", config.database.host);
	console.log("Database:", config.database.name);

	const connection = await mysql.createConnection({
		host: config.database.host,
		port: config.database.port,
		user: config.database.user,
		password: config.database.password,
		database: config.database.name,
		ssl: { rejectUnauthorized: false },
	});

	try {
		// Check and add resolution_notes column
		const [resolutionColumn]: any = await connection.query(
			`SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
			WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'complaints' AND COLUMN_NAME = 'resolution_notes'`,
			[config.database.name]
		);

		if (resolutionColumn.length === 0) {
			console.log("Adding resolution_notes column...");
			await connection.query(
				`ALTER TABLE complaints ADD COLUMN resolution_notes TEXT DEFAULT NULL`
			);
			console.log("✅ Added resolution_notes column");
		} else {
			console.log("✅ resolution_notes column already exists");
		}

		// Check and add feedback column
		const [feedbackCol]: any = await connection.query(
			`SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
			WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'complaints' AND COLUMN_NAME = 'feedback'`,
			[config.database.name]
		);

		if (feedbackCol.length === 0) {
			console.log("Adding feedback column...");
			await connection.query(
				`ALTER TABLE complaints ADD COLUMN feedback TEXT DEFAULT NULL`
			);
			console.log("✅ Added feedback column");
		} else {
			console.log("✅ feedback column already exists");
		}

		// Check and add feedback_rating column
		const [feedbackColumn]: any = await connection.query(
			`SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
			WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'complaints' AND COLUMN_NAME = 'feedback_rating'`,
			[config.database.name]
		);

		if (feedbackColumn.length === 0) {
			console.log("Adding feedback_rating column...");
			await connection.query(
				`ALTER TABLE complaints ADD COLUMN feedback_rating INT DEFAULT NULL`
			);
			console.log("✅ Added feedback_rating column");
		} else {
			console.log("✅ feedback_rating column already exists");
		}

		// Check and add staff_id column
		const [columns]: any = await connection.query(
			`SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
			WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'complaints' AND COLUMN_NAME = 'staff_id'`,
			[config.database.name]
		);

		if (columns.length === 0) {
			console.log("Adding staff_id column...");
			await connection.query(
				`ALTER TABLE complaints ADD COLUMN staff_id INT DEFAULT NULL`
			);
			console.log("✅ Added staff_id column");

			console.log("Adding foreign key constraint...");
			await connection.query(
				`ALTER TABLE complaints ADD CONSTRAINT fk_complaints_staff 
				FOREIGN KEY (staff_id) REFERENCES users(id) ON DELETE SET NULL`
			);
			console.log("✅ Added foreign key constraint");
		} else {
			console.log("✅ staff_id column already exists");
		}

		// Check and add deadline_at column
		const [deadlineColumn]: any = await connection.query(
			`SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
			WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'complaints' AND COLUMN_NAME = 'deadline_at'`,
			[config.database.name]
		);

		if (deadlineColumn.length === 0) {
			console.log("Adding deadline_at column...");
			await connection.query(
				`ALTER TABLE complaints ADD COLUMN deadline_at TIMESTAMP DEFAULT NULL`
			);
			console.log("✅ Added deadline_at column");
		} else {
			console.log("✅ deadline_at column already exists");
		}

		console.log("\n✅ Migration completed successfully!");
	} catch (error: any) {
		console.error("Migration error:", error.message);
		throw error;
	} finally {
		await connection.end();
		console.log("Database connection closed.");
	}
}

migrateDatabase().catch((error) => {
	console.error("Fatal error:", error);
	process.exit(1);
});
