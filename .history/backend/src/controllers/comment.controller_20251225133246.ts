import { Router, Request, Response, NextFunction } from "express";
import { CommentService, ComplaintService } from "../services";
import { authenticate } from "../middlewares";
import { body, validationResult } from "express-validator";

const router: Router = Router();
const commentService = new CommentService();
const complaintService = new ComplaintService();

const handleValidation = (req: Request, res: Response, next: NextFunction) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		const errorMessages = errors
			.array()
			.map((e) => e.msg)
			.join(", ");
		res.status(400).json({ error: errorMessages });
		return;
	}
	next();
};

// Helper function to check if staff can access a complaint
const canStaffAccessComplaint = (
	staffId: number,
	staffDepartment: string | null | undefined,
	complaint: { assigned_to: number | null; category: string }
): boolean => {
	if (complaint.assigned_to === staffId) return true;
	if (complaint.assigned_to === null) {
		const categoryToDeptMap: Record<string, string> = {
			Electrical: "Electrical",
			Plumbing: "Plumbing",
			Facility: "Facility Management",
			IT: "IT Support",
		};
		const expectedDept = categoryToDeptMap[complaint.category];
		return staffDepartment === expectedDept;
	}
	return false;
};

const commentValidation = [
	body("complaint_id").isInt().withMessage("Valid complaint ID is required"),
	body("content").trim().notEmpty().withMessage("Comment content is required"),
	body("is_internal")
		.optional()
		.isBoolean()
		.withMessage("is_internal must be a boolean"),
];

// POST /api/comments - Add comment to complaint
router.post(
	"/",
	authenticate,
	commentValidation,
	handleValidation,
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const complaintId = parseInt(req.body.complaint_id);

			// Check access to complaint
			const complaint = await complaintService.getById(complaintId);
			if (!complaint) {
				res.status(404).json({ error: "Complaint not found" });
				return;
			}

			// Access control
			if (req.user!.role === "User" && complaint.user_id !== req.user!.userId) {
				res
					.status(403)
					.json({ error: "You can only comment on your own complaints" });
				return;
			} else if (req.user!.role === "Staff") {
				if (
					!canStaffAccessComplaint(
						req.user!.userId,
						req.user!.department,
						complaint
					)
				) {
					res
						.status(403)
						.json({ error: "You don't have access to this complaint" });
					return;
				}
			}

			// Users cannot post internal comments
			if (req.user!.role === "User" && req.body.is_internal) {
				req.body.is_internal = false;
			}

			const comment = await commentService.create(req.user!.userId, req.body);
			res.status(201).json(comment);
		} catch (error: any) {
			if (error.message.includes("not found")) {
				res.status(404).json({ error: error.message });
				return;
			}
			next(error);
		}
	}
);

// GET /api/comments/complaint/:id - Get all comments for a complaint
router.get(
	"/complaint/:id",
	authenticate,
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const complaintId = parseInt(req.params.id);

			// Check access to complaint
			const complaint = await complaintService.getById(complaintId);
			if (!complaint) {
				res.status(404).json({ error: "Complaint not found" });
				return;
			}

			// Access control
			if (req.user!.role === "User" && complaint.user_id !== req.user!.userId) {
				res
					.status(403)
					.json({ error: "You can only view comments on your own complaints" });
				return;
			} else if (req.user!.role === "Staff") {
				if (
					!canStaffAccessComplaint(
						req.user!.userId,
						req.user!.department,
						complaint
					)
				) {
					res
						.status(403)
						.json({ error: "You don't have access to this complaint" });
					return;
				}
			}

			const comments = await commentService.getByComplaintId(
				complaintId,
				req.user!.role
			);
			res.json(comments);
		} catch (error) {
			next(error);
		}
	}
);

// DELETE /api/comments/:id - Delete comment (only by author)
router.delete(
	"/:id",
	authenticate,
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const deleted = await commentService.delete(
				parseInt(req.params.id),
				req.user!.userId
			);
			if (!deleted) {
				res.status(403).json({ error: "Cannot delete this comment" });
				return;
			}
			res.status(204).send();
		} catch (error) {
			next(error);
		}
	}
);

export default router;
