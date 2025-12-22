import { Router, Request, Response, NextFunction } from 'express';
import { UserRepository } from '../repositories';
import { authenticate, authorize } from '../middlewares';

const router = Router();
const userRepo = new UserRepository();

// GET /api/users/me - Get current user profile
router.get('/me', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await userRepo.findById(req.user!.userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    const { password, ...response } = user;
    res.json(response);
  } catch (error) {
    next(error);
  }
});

// PUT /api/users/me - Update current user profile
router.put('/me', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, contact_info, expertise } = req.body;
    const updated = await userRepo.update(req.user!.userId, { name, contact_info, expertise });
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

// PUT /api/users/me/availability - Update staff availability (staff only)
router.put(
  '/me/availability',
  authenticate,
  authorize('Staff'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { status } = req.body;
      if (!['Available', 'OnLeave', 'Busy'].includes(status)) {
        res.status(400).json({ error: 'Invalid availability status' });
        return;
      }
      await userRepo.updateAvailability(req.user!.userId, status);
      res.json({ message: 'Availability updated' });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/users/staff - Get all staff members (for assignment dropdown)
router.get(
  '/staff',
  authenticate,
  authorize('Admin'),
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
  '/staff/workload',
  authenticate,
  authorize('Admin'),
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
  '/',
  authenticate,
  authorize('Admin'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const users = await userRepo.findAll();
      res.json(users);
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /api/users/:id - Deactivate user (admin only)
router.delete(
  '/:id',
  authenticate,
  authorize('Admin'),
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
