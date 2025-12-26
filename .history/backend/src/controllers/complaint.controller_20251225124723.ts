import { Router, Request, Response, NextFunction } from "express";
import { ComplaintService } from "../services";
import { ExportService } from "../services/export.service";
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
const exportService = new ExportService();

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
	uploadMultiple, // Process files first
	createValidation, // Then validate
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

			// Helper function to map department to complaint category
			const mapDepartmentToCategory = (department: string | null | undefined): string | undefined => {
				if (!department) return undefined;
				const mapping: Record<string, string> = {
					'Electrical': 'Electrical',
					'Plumbing': 'Plumbing',
					'Facility Management': 'Facility',
					'IT Support': 'IT',
				};
				return mapping[department] || department;
			};

			// Non-admins can only see their own complaints or assigned ones
			if (req.user!.role === "User") {
				filters.user_id = req.user!.userId;
			} else if (req.user!.role === "Staff") {
				// Staff can see:
				// 1. Unassigned complaints (queue) when assigned_to=null
				// 2. Complaints assigned to them
				// 3. Complaints from their department (if department is set)
				const staffCategory = mapDepartmentToCategory(req.user!.department);

				if (req.query.assigned_to === "null") {
					// Queue: unassigned complaints from their department
					filters.assigned_to = "null";
					// Filter by department if staff has department
					if (staffCategory) {
						filters.category = staffCategory as any;
					}
				} else if (!req.query.all) {
					// Default: show only assigned complaints
					filters.assigned_to = req.user!.userId;
				}
				// If all=true, show all complaints from their department + assigned to them
				if (req.query.all && staffCategory) {
					filters.category = staffCategory as any;
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
// Admin can assign to any staff, Staff can only pick up (self-assign) unassigned complaints
router.post(
	"/:id/assign",
	authenticate,
	authorize("Admin", "Staff"),
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const complaintId = parseInt(req.params.id);
			let staff_id = req.body.staff_id;

			// Staff can only self-assign (pick up)
			if (req.user!.role === "Staff") {
				// Get the complaint to check if it's unassigned
				const complaint = await complaintService.getById(complaintId);
				if (!complaint) {
					res.status(404).json({ error: "Complaint not found" });
					return;
				}
				// Staff can only pick up unassigned complaints
				if (complaint.assigned_to) {
					res.status(403).json({ error: "Complaint is already assigned" });
					return;
				}
				// Staff can only assign to themselves
				staff_id = req.user!.userId;
			}

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

// POST /api/complaints/:id/status - Update complaint status with validation
router.post(
	"/:id/status",
	authenticate,
	[
		body("status")
			.isIn(["Open", "Assigned", "In-progress", "Resolved", "Closed"])
			.withMessage("Invalid status"),
		body("notes").optional().trim(),
		body("resolution_notes")
			.if(body("status").equals("Resolved"))
			.trim()
			.notEmpty()
			.withMessage("Resolution notes required when resolving complaint"),
	],
	handleValidation,
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const complaintId = parseInt(req.params.id);
			const { status, notes, resolution_notes } = req.body;

			// Get current complaint
			const complaint = await complaintService.getById(complaintId);
			if (!complaint) {
				res.status(404).json({ error: "Complaint not found" });
				return;
			}

			// Staff can only update their assigned complaints
			if (
				req.user!.role === "Staff" &&
				complaint.assigned_to !== req.user!.userId
			) {
				res.status(403).json({
					error: "You can only update complaints assigned to you",
				});
				return;
			}

			// Users cannot update status
			if (req.user!.role === "User") {
				res.status(403).json({ error: "Users cannot update complaint status" });
				return;
			}

			const updated = await complaintService.updateStatus(
				complaintId,
				status,
				req.user!.userId,
				notes || undefined,
				resolution_notes || undefined,
				req.ip
			);

			res.json(updated);
		} catch (error: any) {
			if (
				error.message.includes("Invalid") ||
				error.message.includes("transition")
			) {
				res.status(400).json({ error: error.message });
				return;
			}
			next(error);
		}
	}
);

// POST /api/complaints/:id/reopen - Reopen resolved complaint
router.post(
	"/:id/reopen",
	authenticate,
	[
		body("reason")
			.trim()
			.isLength({ min: 20 })
			.withMessage("Please provide a detailed reason (minimum 20 characters)"),
	],
	handleValidation,
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const complaintId = parseInt(req.params.id);
			const { reason } = req.body;

			const complaint = await complaintService.getById(complaintId);
			if (!complaint) {
				res.status(404).json({ error: "Complaint not found" });
				return;
			}

			// Users can only reopen their own complaints
			if (req.user!.role === "User" && complaint.user_id !== req.user!.userId) {
				res
					.status(403)
					.json({ error: "You can only reopen your own complaints" });
				return;
			}

			// Check if within 7-day reopen window for users
			if (req.user!.role === "User") {
				if (complaint.status !== "Resolved") {
					res
						.status(400)
						.json({ error: "Only resolved complaints can be reopened" });
					return;
				}

				if (complaint.resolved_at) {
					const daysSinceResolved =
						(Date.now() - new Date(complaint.resolved_at).getTime()) /
						(1000 * 60 * 60 * 24);
					if (daysSinceResolved > 7) {
						res.status(400).json({
							error:
								"Reopen window has expired (must be within 7 days of resolution)",
						});
						return;
					}
				}
			}

			const reopened = await complaintService.reopen(
				complaintId,
				reason,
				req.user!.userId,
				req.ip
			);

			res.json(reopened);
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

// GET /api/complaints/export - Export complaints
router.get(
	"/export",
	authenticate,
	authorize("Admin", "Staff"),
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const format = (req.query.format as string) || "csv";
			const filters = {
				status: req.query.status as string,
				category: req.query.category as string,
				priority: req.query.priority as string,
				dateFrom: req.query.dateFrom as string,
				dateTo: req.query.dateTo as string,
			};

			// Set appropriate headers
			if (format === "csv") {
				res.setHeader("Content-Type", "text/csv");
				res.setHeader(
					"Content-Disposition",
					`attachment; filename=complaints_${Date.now()}.csv`
				);
			} else if (format === "excel") {
				res.setHeader(
					"Content-Type",
					"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
				);
				res.setHeader(
					"Content-Disposition",
					`attachment; filename=complaints_${Date.now()}.xlsx`
				);
			} else if (format === "pdf") {
				res.setHeader("Content-Type", "application/pdf");
				res.setHeader(
					"Content-Disposition",
					`attachment; filename=complaints_${Date.now()}.pdf`
				);
			}

			await exportService.exportComplaints(
				{ format: format as any, filters },
				res
			);
		} catch (error) {
			next(error);
		}
	}
);

export default router;
