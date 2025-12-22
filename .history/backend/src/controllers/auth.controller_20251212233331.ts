import { Router, Request, Response, NextFunction } from "express";
import { AuthService } from "../services";
import { loginRateLimiter } from "../middlewares";
import { body, validationResult } from "express-validator";

const router: Router = Router();
const authService = new AuthService();

// Validation rules
const registerValidation = [
	body("name").trim().notEmpty().withMessage("Name is required"),
	body("email").isEmail().withMessage("Valid email is required"),
	body("password")
		.isLength({ min: 8 })
		.withMessage("Password must be at least 8 characters")
		.matches(/[A-Z]/)
		.withMessage("Password must contain uppercase letter")
		.matches(/[0-9]/)
		.withMessage("Password must contain a number"),
	body("role")
		.isIn(["User", "Staff", "Admin"])
		.withMessage("Role must be User, Staff, or Admin"),
	body("expertise")
		.if(body("role").equals("Staff"))
		.notEmpty()
		.withMessage("Staff must specify expertise"),
];

const loginValidation = [
	body("email").isEmail().withMessage("Valid email is required"),
	body("password").notEmpty().withMessage("Password is required"),
];

// Helper to handle validation errors
const handleValidation = (req: Request, res: Response, next: NextFunction) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		res.status(400).json({ errors: errors.array() });
		return;
	}
	next();
};

// POST /api/auth/register - Register new user
router.post(
	"/register",
	registerValidation,
	handleValidation,
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const result = await authService.register(req.body, req.ip);
			res.status(201).json(result);
		} catch (error: any) {
			if (error.message === "Email already registered") {
				res.status(409).json({ error: error.message });
				return;
			}
			next(error);
		}
	}
);

// POST /api/auth/login - Login with email/password
router.post(
	"/login",
	loginRateLimiter,
	loginValidation,
	handleValidation,
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const result = await authService.login(req.body, req.ip);
			res.json(result);
		} catch (error: any) {
			if (error.message === "Invalid email or password") {
				res.status(401).json({ error: error.message });
				return;
			}
			next(error);
		}
	}
);

// POST /api/auth/refresh - Refresh access token
router.post(
	"/refresh",
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { refreshToken } = req.body;
			if (!refreshToken) {
				res.status(400).json({ error: "Refresh token is required" });
				return;
			}
			const result = await authService.refreshToken(refreshToken);
			res.json(result);
		} catch (error: any) {
			if (error.message.includes("token")) {
				res.status(401).json({ error: error.message });
				return;
			}
			next(error);
		}
	}
);

// POST /api/auth/logout - Logout (invalidate refresh token)
router.post(
	"/logout",
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { refreshToken } = req.body;
			if (refreshToken) {
				await authService.logout(refreshToken);
			}
			res.json({ message: "Logged out successfully" });
		} catch (error) {
			next(error);
		}
	}
);

export default router;
