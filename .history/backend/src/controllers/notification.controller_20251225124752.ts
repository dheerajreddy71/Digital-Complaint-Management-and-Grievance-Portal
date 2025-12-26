import { Router, Request, Response, NextFunction } from "express";
import { NotificationService } from "../services";
import { authenticate } from "../middlewares";

const router: Router = Router();
const notificationService = new NotificationService();

// GET /api/notifications - Get user's notifications
router.get(
	"/",
	authenticate,
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const page = parseInt(req.query.page as string) || 1;
			const limit = parseInt(req.query.limit as string) || 25;
			
			const notifications = await notificationService.getUserNotifications(
				req.user!.userId,
				limit
			);
			
			// Return in expected format with pagination
			res.json({
				data: notifications,
				total: notifications.length,
				page,
				limit
			});
		} catch (error) {
			next(error);
		}
	}
);

// GET /api/notifications/unread-count - Get unread notification count
router.get(
	"/unread-count",
	authenticate,
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const count = await notificationService.getUnreadCount(req.user!.userId);
			res.json({ count });
		} catch (error) {
			next(error);
		}
	}
);

// PUT /api/notifications/:id/read - Mark notification as read
router.put(
	"/:id/read",
	authenticate,
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			await notificationService.markAsRead(
				parseInt(req.params.id),
				req.user!.userId
			);
			res.json({ message: "Marked as read" });
		} catch (error) {
			next(error);
		}
	}
);

// PUT /api/notifications/read-all - Mark all notifications as read
router.put(
	"/read-all",
	authenticate,
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			await notificationService.markAllAsRead(req.user!.userId);
			res.json({ message: "All notifications marked as read" });
		} catch (error) {
			next(error);
		}
	}
);

export default router;
