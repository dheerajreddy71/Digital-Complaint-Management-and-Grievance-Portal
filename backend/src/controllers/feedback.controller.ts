import { Router, Request, Response, NextFunction } from "express";
import { FeedbackService } from "../services";
import { authenticate, authorize } from "../middlewares";
import { body, validationResult } from "express-validator";

const router: Router = Router();
const feedbackService = new FeedbackService();

const handleValidation = (req: Request, res: Response, next: NextFunction) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		res.status(400).json({ errors: errors.array() });
		return;
	}
	next();
};

const feedbackValidation = [
	body("complaint_id").isInt().withMessage("Valid complaint ID is required"),
	body("rating")
		.isInt({ min: 1, max: 5 })
		.withMessage("Rating must be between 1 and 5"),
	body("is_resolved").isBoolean().withMessage("is_resolved must be a boolean"),
];

// POST /api/feedback - Submit feedback for resolved complaint
router.post(
	"/",
	authenticate,
	feedbackValidation,
	handleValidation,
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const feedback = await feedbackService.submit(req.body, req.user!.userId);
			res.status(201).json(feedback);
		} catch (error: any) {
			if (
				error.message.includes("not found") ||
				error.message.includes("resolved") ||
				error.message.includes("already submitted") ||
				error.message.includes("own complaints")
			) {
				res.status(400).json({ error: error.message });
				return;
			}
			next(error);
		}
	}
);

// GET /api/feedback/complaint/:id - Get feedback for a complaint
router.get(
	"/complaint/:id",
	authenticate,
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const feedback = await feedbackService.getByComplaintId(
				parseInt(req.params.id)
			);
			if (!feedback) {
				res.status(404).json({ error: "Feedback not found" });
				return;
			}
			res.json(feedback);
		} catch (error) {
			next(error);
		}
	}
);

// GET /api/feedback/staff-performance - Get staff performance metrics (admin)
router.get(
	"/staff-performance",
	authenticate,
	authorize("Admin"),
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const metrics = await feedbackService.getStaffPerformance();
			res.json(metrics);
		} catch (error) {
			next(error);
		}
	}
);

// GET /api/feedback - Get all feedback (admin)
router.get(
	"/",
	authenticate,
	authorize("Admin"),
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const feedback = await feedbackService.getAll();
			res.json(feedback);
		} catch (error) {
			next(error);
		}
	}
);

export default router;
