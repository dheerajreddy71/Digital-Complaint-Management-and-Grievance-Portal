import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services";
import { TokenPayload, UserRole } from "../models";

// Extend Express Request to include user info
declare global {
	namespace Express {
		interface Request {
			user?: TokenPayload;
		}
	}
}

const authService = new AuthService();

// Verify JWT token and attach user info to request
export const authenticate = (
	req: Request,
	res: Response,
	next: NextFunction
): void => {
	try {
		const authHeader = req.headers.authorization;

		if (!authHeader || !authHeader.startsWith("Bearer ")) {
			res.status(401).json({ error: "No token provided" });
			return;
		}

		const token = authHeader.split(" ")[1];
		const payload = authService.verifyAccessToken(token);

		req.user = payload;
		next();
	} catch (error) {
		res.status(401).json({ error: "Invalid or expired token" });
	}
};

// Role-based access control middleware factory
export const authorize = (...allowedRoles: UserRole[]) => {
	return (req: Request, res: Response, next: NextFunction): void => {
		if (!req.user) {
			res.status(401).json({ error: "Authentication required" });
			return;
		}

		if (!allowedRoles.includes(req.user.role)) {
			res.status(403).json({ error: "Insufficient permissions" });
			return;
		}

		next();
	};
};

// Convenience shortcuts for common role checks
export const adminOnly = authorize("Admin");
export const staffOnly = authorize("Staff", "Admin");
export const userOnly = authorize("User", "Staff", "Admin");
