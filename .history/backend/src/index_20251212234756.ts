import express, { Express } from "express";
import cors from "cors";
import helmet from "helmet";
import path from "path";
import { config } from "./config";
import { testConnection } from "./config/database";
import {
	authController,
	complaintController,
	notificationController,
	feedbackController,
	commentController,
	analyticsController,
	userController,
} from "./controllers";
import { errorHandler, notFoundHandler, apiRateLimiter } from "./middlewares";
import { requestLogger, logger } from "./utils";
import { startAllJobs } from "./jobs/scheduled-jobs";

const app: Express = express();

// Security middleware
app.use(helmet());
app.use(
	cors({
		origin: process.env.FRONTEND_URL || "http://localhost:4200",
		credentials: true,
	})
);

// Body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use(requestLogger);

// Rate limiting
app.use("/api", apiRateLimiter);

// Static files for uploads
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Health check endpoint
app.get("/health", (req, res) => {
	res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// API routes
app.use("/api/auth", authController);
app.use("/api/users", userController);
app.use("/api/complaints", complaintController);
app.use("/api/notifications", notificationController);
app.use("/api/feedback", feedbackController);
app.use("/api/comments", commentController);
app.use("/api/analytics", analyticsController);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const startServer = async () => {
	try {
		// Test database connection
		const dbConnected = await testConnection();
		if (!dbConnected) {
			logger.error("Failed to connect to database. Exiting...");
			process.exit(1);
		}

		// Start scheduled jobs
		if (config.nodeEnv === "production") {
			startAllJobs();
		}

		// Listen
		app.listen(config.port, () => {
			logger.info(
				`Server running on port ${config.port} in ${config.nodeEnv} mode`
			);
			logger.info(`API available at http://localhost:${config.port}/api`);
		});
	} catch (error) {
		logger.error("Failed to start server", { error });
		process.exit(1);
	}
};

startServer();

export default app;
