import { FeedbackRepository, ComplaintRepository, NotificationRepository } from '../repositories';
import { CreateFeedbackDto, Feedback, FeedbackResponse, StaffPerformanceMetrics } from '../models';
import { logger } from '../utils';

export class FeedbackService {
  private feedbackRepo = new FeedbackRepository();
  private complaintRepo = new ComplaintRepository();
  private notificationRepo = new NotificationRepository();

  // Submit feedback for resolved complaint
  async submit(data: CreateFeedbackDto, userId: number): Promise<Feedback> {
    // Verify complaint exists and is resolved
    const complaint = await this.complaintRepo.findById(data.complaint_id);
    if (!complaint) {
      throw new Error('Complaint not found');
    }
    if (complaint.status !== 'Resolved') {
      throw new Error('Can only submit feedback for resolved complaints');
    }
    if (complaint.user_id !== userId) {
      throw new Error('You can only submit feedback for your own complaints');
    }

    // Check if feedback already exists
    if (await this.feedbackRepo.exists(data.complaint_id)) {
      throw new Error('Feedback already submitted for this complaint');
    }

    // Validate rating
    if (data.rating < 1 || data.rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    const feedback = await this.feedbackRepo.create(data);

    // Notify staff about feedback if assigned
    if (complaint.staff_id) {
      await this.notificationRepo.create({
        user_id: complaint.staff_id,
        complaint_id: data.complaint_id,
        type: 'Resolved',
        message: `You received a ${data.rating}-star rating for "${complaint.title}"`,
      });
    }

    logger.info(`Feedback submitted for complaint #${data.complaint_id}: ${data.rating} stars`);

    return feedback;
  }

  // Get feedback for a complaint
  async getByComplaintId(complaintId: number): Promise<FeedbackResponse | null> {
    return this.feedbackRepo.findByComplaintId(complaintId);
  }

  // Get staff performance metrics (admin dashboard)
  async getStaffPerformance(): Promise<StaffPerformanceMetrics[]> {
    return this.feedbackRepo.getStaffPerformance();
  }

  // Get all feedback (admin)
  async getAll(): Promise<FeedbackResponse[]> {
    return this.feedbackRepo.findAll();
  }
}
