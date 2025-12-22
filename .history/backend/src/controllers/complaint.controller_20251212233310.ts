import { Router, Request, Response, NextFunction } from "express";
import { ComplaintService } from "../services";
import {
	authenticate,
	authorize,
	complaintRateLimiter,
	uploadMultiple,
} from "../middlewares";
import { body, query, param, validationResult } from "express-validator";
import { ComplaintFilters } from "../models";

const router: Router = Router();
const complaintService = new ComplaintService();

// Validation helpers
const handleValidation = (req: Request, res: Response, next: NextFunction) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		res.status(400).json({ errors: errors.array() });
		return;
	}
	next();
};

const createValidation = [
	body("title").trim().notEmpty().withMessage("Title is required"),
	body("description").trim().notEmpty().withMessage("Description is required"),
	body("category")
		.isIn(["Plumbing", "Electrical", "Facility", "IT", "Other"])
		.withMessage("Invalid category"),
	body("priority")
		.isIn(["Low", "Medium", "High", "Critical"])
		.withMessage("Invalid priority"),
	body("location").trim().notEmpty().withMessage("Location is required"),
];

// POST /api/complaints - Create new complaint
router.post(
	"/",
	authenticate,
	complaintRateLimiter,
	uploadMultiple,
	createValidation,
	handleValidation,
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			// Handle file uploads
			const files = req.files as Express.Multer.File[] | undefined;
			const attachments = files?.map((f) => f.path) || [];

			const complaint = await complaintService.create(
				req.user!.userId,
				{ ...req.body, attachments },
				req.ip
			);
			res.status(201).json(complaint);
		} catch (error) {
			next(error);
		}
	}
);

// GET /api/complaints - Get complaints with filters
router.get(
	"/",
	authenticate,
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const filters: ComplaintFilters = {
				status: req.query.status as any,
				category: req.query.category as any,
				priority: req.query.priority as any,
				search: req.query.search as string,
				is_overdue:
					req.query.is_overdue === "true"
						? true
						: req.query.is_overdue === "false"
						? false
						: undefined,
				is_escalated: req.query.is_escalated === "true" ? true : undefined,
				date_from: req.query.date_from
					? new Date(req.query.date_from as string)
					: undefined,
				date_to: req.query.date_to
					? new Date(req.query.date_to as string)
					: undefined,
				sort_by: req.query.sort_by as any,
				sort_order: req.query.sort_order as any,
				page: parseInt(req.query.page as string) || 1,
				limit: parseInt(req.query.limit as string) || 10,
			};

			// Non-admins can only see their own complaints or assigned ones
			if (req.user!.role === "User") {
				filters.user_id = req.user!.userId;
			} else if (req.user!.role === "Staff") {
				// Staff sees only assigned complaints unless specified
				if (!req.query.all) {
					filters.staff_id = req.user!.userId;
				}
			}
			// Admin sees all

			const result = await complaintService.getAll(filters);
			res.json(result);
		} catch (error) {
			next(error);
		}
	}
);

// GET /api/complaints/suggest - Get AI suggestions for category/priority
router.post("/suggest", authenticate, async (req: Request, res: Response) => {
	const { description } = req.body;
	const suggestions = complaintService.getSuggestions(description || "");
	res.json(suggestions);
});

// POST /api/complaints/check-duplicates - Check for duplicate complaints
router.post(
	"/check-duplicates",
	authenticate,
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const result = await complaintService.checkDuplicates(
				req.body,
				req.user!.userId
			);
			res.json(result);
		} catch (error) {
			next(error);
		}
	}
);

// GET /api/complaints/:id - Get complaint by ID
router.get(
	"/:id",
	authenticate,
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const complaint = await complaintService.getById(parseInt(req.params.id));

			if (!complaint) {
				res.status(404).json({ error: "Complaint not found" });
				return;
			}

			// Check access - users can only view their own, staff can view assigned
			if (req.user!.role === "User" && complaint.user_id !== req.user!.userId) {
				res.status(403).json({ error: "Access denied" });
				return;
			}

			res.json(complaint);
		} catch (error) {
			next(error);
		}
	}
);

// GET /api/complaints/:id/timeline - Get complaint timeline/history
router.get(
	"/:id/timeline",
	authenticate,
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const timeline = await complaintService.getTimeline(
				parseInt(req.params.id)
			);
			res.json(timeline);
		} catch (error) {
			next(error);
		}
	}
);

// PUT /api/complaints/:id - Update complaint
router.put(
	"/:id",
	authenticate,
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const complaintId = parseInt(req.params.id);
			const complaint = await complaintService.getById(complaintId);

			if (!complaint) {
				res.status(404).json({ error: "Complaint not found" });
				return;
			}

			// Users can only update their own open complaints
			if (req.user!.role === "User") {
				if (complaint.user_id !== req.user!.userId) {
					res.status(403).json({ error: "Access denied" });
					return;
				}
				if (complaint.status !== "Open") {
					res.status(400).json({
						error: "Cannot modify complaint after it has been assigned",
					});
					return;
				}
			}

			const updated = await complaintService.update(
				complaintId,
				req.body,
				req.user!.userId,
				req.ip
			);

			res.json(updated);
		} catch (error: any) {
			if (error.message.includes("Invalid status")) {
				res.status(400).json({ error: error.message });
				return;
			}
			next(error);
		}
	}
);

// POST /api/complaints/:id/assign - Assign complaint to staff
router.post(
	"/:id/assign",
	authenticate,
	authorize("Admin"),
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { staff_id } = req.body;
			const complaintId = parseInt(req.params.id);

			const result = await complaintService.assign(
				complaintId,
				staff_id,
				req.user!.userId,
				req.ip
			);

			if (!result) {
				res.status(404).json({ error: "Complaint not found" });
				return;
			}

			res.json(result);
		} catch (error) {
			next(error);
		}
	}
);

// POST /api/complaints/:id/auto-assign - Auto-assign based on workload/expertise
router.post(
	"/:id/auto-assign",
	authenticate,
	authorize("Admin"),
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const result = await complaintService.autoAssign(
				parseInt(req.params.id),
				req.user!.userId
			);

			if (!result) {
				res.status(404).json({ error: "Complaint not found" });
				return;
			}

			res.json(result);
		} catch (error: any) {
			if (error.message.includes("No available staff")) {
				res.status(400).json({ error: error.message });
				return;
			}
			next(error);
		}
	}
);

// POST /api/complaints/bulk/assign - Bulk assign complaints
router.post(
	"/bulk/assign",
	authenticate,
	authorize("Admin"),
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { complaint_ids, staff_id } = req.body;
			await complaintService.bulkAssign(
				complaint_ids,
				staff_id,
				req.user!.userId
			);
			res.json({ message: `${complaint_ids.length} complaints assigned` });
		} catch (error) {
			next(error);
		}
	}
);

// POST /api/complaints/bulk/status - Bulk update status
router.post(
	"/bulk/status",
	authenticate,
	authorize("Admin"),
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { complaint_ids, status } = req.body;
			await complaintService.bulkUpdateStatus(
				complaint_ids,
				status,
				req.user!.userId
			);
			res.json({ message: `${complaint_ids.length} complaints updated` });
		} catch (error) {
			next(error);
		}
	}
);

// DELETE /api/complaints/:id - Delete complaint (admin only)
router.delete(
	"/:id",
	authenticate,
	authorize("Admin"),
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			await complaintService.delete(
				parseInt(req.params.id),
				req.user!.userId,
				req.ip
			);
			res.status(204).send();
		} catch (error) {
			next(error);
		}
	}
);

export default router;
