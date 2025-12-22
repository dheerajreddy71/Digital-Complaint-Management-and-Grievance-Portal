import { Router, Request, Response, NextFunction } from "express";
import { AnalyticsService } from "../services";
import { ExportService } from "../services/export.service";
import { authenticate, authorize } from "../middlewares";

const router: Router = Router();
const analyticsService = new AnalyticsService();
const exportService = new ExportService();

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

// GET /api/analytics/export - Export analytics report
router.get(
	"/export",
	authenticate,
	authorize("Admin"),
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const format = (req.query.format as string) || "excel";
			const dateFrom = req.query.date_from
				? new Date(req.query.date_from as string)
				: undefined;
			const dateTo = req.query.date_to
				? new Date(req.query.date_to as string)
				: undefined;

			// Set appropriate headers
			if (format === "excel") {
				res.setHeader(
					"Content-Type",
					"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
				);
				res.setHeader(
					"Content-Disposition",
					`attachment; filename=analytics_${Date.now()}.xlsx`
				);
			} else if (format === "pdf") {
				res.setHeader("Content-Type", "application/pdf");
				res.setHeader(
					"Content-Disposition",
					`attachment; filename=analytics_${Date.now()}.pdf`
				);
			}

			await exportService.exportAnalytics(format as any, res, dateFrom, dateTo);
		} catch (error) {
			next(error);
		}
	}
);

export default router;
