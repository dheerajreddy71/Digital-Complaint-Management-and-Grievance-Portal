import { Router, Request, Response, NextFunction } from "express";
import { CommentService } from "../services";
import { authenticate } from "../middlewares";
import { body, validationResult } from "express-validator";

const router: Router = Router();
const commentService = new CommentService();

const handleValidation = (req: Request, res: Response, next: NextFunction) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		res.status(400).json({ errors: errors.array() });
		return;
	}
	next();
};

const commentValidation = [
	body("complaint_id").isInt().withMessage("Valid complaint ID is required"),
	body("content").trim().notEmpty().withMessage("Comment content is required"),
	body("is_internal").optional().isBoolean().withMessage("is_internal must be a boolean"),
];

// POST /api/comments - Add comment to complaint
router.post(
	"/",
	authenticate,
	commentValidation,
	handleValidation,
	async (req: Request, res: Response, next: NextFunction) => {
		try {
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
			const comments = await commentService.getByComplaintId(
				parseInt(req.params.id)
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
