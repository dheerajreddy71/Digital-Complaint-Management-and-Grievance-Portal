import { Request, Response, NextFunction } from "express";
import { logger } from "../utils";

// Custom error class with status code
export class AppError extends Error {
	constructor(public message: string, public statusCode: number = 400) {
		super(message);
		this.name = "AppError";
	}
}

// Global error handler
export const errorHandler = (
	err: Error,
	req: Request,
	res: Response,
	next: NextFunction
): void => {
	// Log error for debugging
	logger.error("Error occurred", {
		error: err.message,
		stack: err.stack,
		path: req.path,
		method: req.method,
	});

	// Handle known errors
	if (err instanceof AppError) {
		res.status(err.statusCode).json({ error: err.message });
		return;
	}

	// Handle MySQL errors
	if ((err as any).code === "ER_DUP_ENTRY") {
		res
			.status(409)
			.json({ error: "Duplicate entry. This record already exists." });
		return;
	}

	if ((err as any).code === "ER_NO_REFERENCED_ROW_2") {
		res.status(400).json({ error: "Referenced record not found." });
		return;
	}

	// Handle JWT errors
	if (err.name === "JsonWebTokenError") {
		res.status(401).json({ error: "Invalid token" });
		return;
	}

	if (err.name === "TokenExpiredError") {
		res.status(401).json({ error: "Token expired" });
		return;
	}

	// Handle validation errors
	if (err.name === "ValidationError") {
		res.status(400).json({ error: err.message });
		return;
	}

	// Default to 500 for unhandled errors
	res.status(500).json({
		error:
			process.env.NODE_ENV === "production"
				? "An unexpected error occurred"
				: err.message,
	});
};

// 404 handler
export const notFoundHandler = (req: Request, res: Response): void => {
	res.status(404).json({ error: `Route not found: ${req.method} ${req.path}` });
};
