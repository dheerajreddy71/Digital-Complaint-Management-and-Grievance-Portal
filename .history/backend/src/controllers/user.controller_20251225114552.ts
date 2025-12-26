import { Router, Request, Response, NextFunction } from "express";
import { UserRepository } from "../repositories";
import { authenticate, authorize } from "../middlewares";

const router: import("express").Router = Router();
const userRepo = new UserRepository();

// GET /api/users/me - Get current user profile
router.get(
	"/me",
	authenticate,
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const user = await userRepo.findById(req.user!.userId);
			if (!user) {
				res.status(404).json({ error: "User not found" });
				return;
			}
			const { password, ...response } = user;
			res.json(response);
		} catch (error) {
			next(error);
		}
	}
);

// PUT /api/users/me - Update current user profile
router.put(
	"/me",
	authenticate,
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { name, contact_info, expertise } = req.body;
			const updated = await userRepo.update(req.user!.userId, {
				name,
				contact_info,
				expertise,
			});
			res.json(updated);
		} catch (error) {
			next(error);
		}
	}
);

// PUT /api/users/me/availability - Update staff availability (staff only)
router.put(
	"/me/availability",
	authenticate,
	authorize("Staff"),
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { status } = req.body;
			const validStatuses = ["available", "busy", "offline"];
			if (!validStatuses.includes(status?.toLowerCase())) {
				res.status(400).json({ error: "Invalid availability status" });
				return;
			}
			await userRepo.updateAvailability(req.user!.userId, status.toLowerCase());
			const user = await userRepo.findById(req.user!.userId);
			if (!user) {
				res.status(404).json({ error: "User not found" });
				return;
			}
			const { password, ...response } = user;
			res.json(response);
		} catch (error) {
			next(error);
		}
	}
);

// PUT /api/users/:id/availability - Update user availability (admin only)
router.put(
	"/:id/availability",
	authenticate,
	authorize("Admin"),
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { status } = req.body;
			const validStatuses = ["available", "busy", "offline"];
			if (!validStatuses.includes(status?.toLowerCase())) {
				res.status(400).json({ error: "Invalid availability status" });
				return;
			}
			await userRepo.updateAvailability(
				parseInt(req.params.id),
				status.toLowerCase()
			);
			const user = await userRepo.findById(parseInt(req.params.id));
			res.json(user);
		} catch (error) {
			next(error);
		}
	}
);

// GET /api/users/staff - Get all staff members (for assignment dropdown)
router.get(
	"/staff",
	authenticate,
	authorize("Admin"),
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const staff = await userRepo.findAllStaff();
			res.json(staff);
		} catch (error) {
			next(error);
		}
	}
);

// GET /api/users/staff/workload - Get staff with workload info
router.get(
	"/staff/workload",
	authenticate,
	authorize("Admin"),
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const staff = await userRepo.getStaffWithWorkload();
			res.json(staff);
		} catch (error) {
			next(error);
		}
	}
);

// GET /api/users - Get all users (admin only)
router.get(
	"/",
	authenticate,
	authorize("Admin"),
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const page = parseInt(req.query.page as string) || 1;
			const limit = parseInt(req.query.limit as string) || 10;
			const search = req.query.search as string;
			const role = req.query.role as string;

			let users = await userRepo.findAll();

			// Apply filters
			if (search) {
				const searchLower = search.toLowerCase();
				users = users.filter(
					(u) =>
						u.name.toLowerCase().includes(searchLower) ||
						u.email.toLowerCase().includes(searchLower)
				);
			}

			if (role && role !== "all" && role !== "All Roles") {
				users = users.filter(
					(u) => u.role.toLowerCase() === role.toLowerCase()
				);
			}

			const total = users.length;
			const totalPages = Math.ceil(total / limit);
			const startIndex = (page - 1) * limit;
			const paginatedUsers = users.slice(startIndex, startIndex + limit);

			res.json({
				data: paginatedUsers,
				pagination: {
					page,
					limit,
					total,
					totalPages,
				},
			});
		} catch (error) {
			next(error);
		}
	}
);

// POST /api/users - Create new user (admin only)
router.post(
	"/",
	authenticate,
	authorize("Admin"),
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const {
				name,
				email,
				password,
				role,
				department,
				contact_info,
				expertise,
			} = req.body;

			// Validate required fields
			if (!name || !email || !password || !role) {
				res
					.status(400)
					.json({ error: "Name, email, password, and role are required" });
				return;
			}

			// Check if user already exists
			const existingUser = await userRepo.findByEmail(email);
			if (existingUser) {
				res.status(409).json({ error: "User with this email already exists" });
				return;
			}

			const newUser = await userRepo.create({
				name,
				email,
				password,
				role,
				department,
				expertise,
			});

			res.status(201).json(newUser);
		} catch (error) {
			next(error);
		}
	}
);

// PUT /api/users/:id - Update user (admin only)
router.put(
	"/:id",
	authenticate,
	authorize("Admin"),
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { name, email, role, department, contact_info, expertise } =
				req.body;
			const updated = await userRepo.update(parseInt(req.params.id), {
				name,
				email,
				role,
				department,
				contact_info,
				expertise,
			});
			res.json(updated);
		} catch (error) {
			next(error);
		}
	}
);

// DELETE /api/users/:id - Deactivate user (admin only)
router.delete(
	"/:id",
	authenticate,
	authorize("Admin"),
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			await userRepo.deactivate(parseInt(req.params.id));
			res.status(204).send();
		} catch (error) {
			next(error);
		}
	}
);

export default router;
