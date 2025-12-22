import { Router, Request, Response, NextFunction } from "express";
import { AnalyticsService } from "../services";
import { authenticate, authorize } from "../middlewares";

const router = Router();
const analyticsService = new AnalyticsService();

// GET /api/analytics - Get comprehensive analytics (admin only)
router.get(
	"/",
	authenticate,
	authorize("Admin"),
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const dateFrom = req.query.date_from
				? new Date(req.query.date_from as string)
				: undefined;
			const dateTo = req.query.date_to
				? new Date(req.query.date_to as string)
				: undefined;

			const analytics = await analyticsService.getAnalytics(dateFrom, dateTo);
			res.json(analytics);
		} catch (error) {
			next(error);
		}
	}
);

export default router;
