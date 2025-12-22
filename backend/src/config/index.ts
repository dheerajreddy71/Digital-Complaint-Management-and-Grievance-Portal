import dotenv from "dotenv";
import path from "path";

// Load env file from project root
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

export const config = {
	// Server
	nodeEnv: process.env.NODE_ENV || "development",
	port: parseInt(process.env.PORT || "3000", 10),

	// Database
	db: {
		host: process.env.DB_HOST || "localhost",
		port: parseInt(process.env.DB_PORT || "3306", 10),
		user: process.env.DB_USER || "root",
		password: process.env.DB_PASSWORD || "",
		name: process.env.DB_NAME || "complaint_portal",
	},

	// JWT - document specifies 30min access, 7 days refresh
	jwt: {
		secret: process.env.JWT_SECRET || "default-secret-change-me",
		refreshSecret: process.env.JWT_REFRESH_SECRET || "default-refresh-secret",
		expiresIn: process.env.JWT_EXPIRES_IN || "30m",
		refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
	},

	// File uploads
	upload: {
		maxSize: parseInt(process.env.UPLOAD_MAX_SIZE || "5242880", 10), // 5MB
		dir: process.env.UPLOAD_DIR || "uploads",
		allowedTypes: ["image/jpeg", "image/png", "application/pdf"],
	},

	// Rate limiting - document specs: 5 attempts/15min login, 10/hour complaints
	rateLimit: {
		login: {
			windowMs:
				parseInt(process.env.LOGIN_RATE_LIMIT_WINDOW || "15", 10) * 60 * 1000,
			max: parseInt(process.env.LOGIN_RATE_LIMIT_MAX || "5", 10),
		},
		complaint: {
			windowMs:
				parseInt(process.env.COMPLAINT_RATE_LIMIT_WINDOW || "60", 10) *
				60 *
				1000,
			max: parseInt(process.env.COMPLAINT_RATE_LIMIT_MAX || "10", 10),
		},
	},

	// Email (optional)
	email: {
		host: process.env.SMTP_HOST,
		port: parseInt(process.env.SMTP_PORT || "587", 10),
		user: process.env.SMTP_USER,
		pass: process.env.SMTP_PASS,
		from: process.env.EMAIL_FROM || "noreply@portal.com",
	},
};
