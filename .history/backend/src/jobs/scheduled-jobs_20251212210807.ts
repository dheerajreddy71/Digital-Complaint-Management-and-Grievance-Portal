import cron from 'node-cron';
import { ComplaintRepository, NotificationRepository, UserRepository } from '../repositories';
import { logger } from '../utils';

const complaintRepo = new ComplaintRepository();
const notificationRepo = new NotificationRepository();
const userRepo = new UserRepository();

// Check for overdue complaints every hour as per spec
export const startSlaCheckJob = () => {
  cron.schedule('0 * * * *', async () => {
    try {
      logger.info('Running SLA check job...');
      
      // Update overdue flags
      const overdueCount = await complaintRepo.updateOverdueStatus();
      
      if (overdueCount > 0) {
        logger.info(`Marked ${overdueCount} complaints as overdue`);
        
        // Notify admins about SLA breaches
        const admins = await userRepo.findAll();
        for (const admin of admins.filter(u => u.role === 'Admin')) {
          await notificationRepo.create({
            user_id: admin.id,
            type: 'SLABreach',
            message: `${overdueCount} complaint(s) have exceeded their SLA deadline`,
          });
        }
      }
    } catch (error) {
      logger.error('SLA check job failed', { error });
    }
  });
  
  logger.info('SLA check job scheduled (every hour)');
};

// Check for approaching SLA deadlines (within 2 hours) every 30 minutes
export const startSlaReminderJob = () => {
  cron.schedule('*/30 * * * *', async () => {
    try {
      logger.info('Running SLA reminder job...');
      
      const approachingComplaints = await complaintRepo.getApproachingSLA();
      
      for (const complaint of approachingComplaints) {
        // Notify assigned staff
        if (complaint.staff_id) {
          await notificationRepo.create({
            user_id: complaint.staff_id,
            complaint_id: complaint.id,
            type: 'Reminder',
            message: `SLA deadline approaching for "${complaint.title}" - less than 2 hours remaining`,
          });
        }
      }
      
      if (approachingComplaints.length > 0) {
        logger.info(`Sent SLA reminders for ${approachingComplaints.length} complaints`);
      }
    } catch (error) {
      logger.error('SLA reminder job failed', { error });
    }
  });
  
  logger.info('SLA reminder job scheduled (every 30 minutes)');
};

// Clean up expired refresh tokens daily
export const startTokenCleanupJob = () => {
  cron.schedule('0 0 * * *', async () => {
    try {
      logger.info('Running token cleanup job...');
      // Import here to avoid circular dependencies
      const { RefreshTokenRepository } = await import('../repositories');
      const tokenRepo = new RefreshTokenRepository();
      const deleted = await tokenRepo.deleteExpired();
      logger.info(`Cleaned up ${deleted} expired refresh tokens`);
    } catch (error) {
      logger.error('Token cleanup job failed', { error });
    }
  });
  
  logger.info('Token cleanup job scheduled (daily at midnight)');
};

// Clean up old notifications (older than 90 days)
export const startNotificationCleanupJob = () => {
  cron.schedule('0 1 * * *', async () => {
    try {
      logger.info('Running notification cleanup job...');
      const deleted = await notificationRepo.deleteOld(90);
      logger.info(`Cleaned up ${deleted} old notifications`);
    } catch (error) {
      logger.error('Notification cleanup job failed', { error });
    }
  });
  
  logger.info('Notification cleanup job scheduled (daily at 1 AM)');
};

// Start all scheduled jobs
export const startAllJobs = () => {
  startSlaCheckJob();
  startSlaReminderJob();
  startTokenCleanupJob();
  startNotificationCleanupJob();
  logger.info('All scheduled jobs started');
};
