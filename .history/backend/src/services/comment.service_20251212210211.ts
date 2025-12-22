import { CommentRepository, NotificationRepository, ComplaintRepository } from '../repositories';
import { CreateCommentDto, CommentResponse } from '../models';

export class CommentService {
  private commentRepo = new CommentRepository();
  private notificationRepo = new NotificationRepository();
  private complaintRepo = new ComplaintRepository();

  // Add comment to complaint
  async create(userId: number, data: CreateCommentDto): Promise<CommentResponse> {
    const complaint = await this.complaintRepo.findById(data.complaint_id);
    if (!complaint) {
      throw new Error('Complaint not found');
    }

    const comment = await this.commentRepo.create(userId, data);

    // Notify relevant parties about new comment
    const notifyUsers = new Set<number>();
    
    // Notify complaint owner if commenter is not the owner
    if (complaint.user_id !== userId) {
      notifyUsers.add(complaint.user_id);
    }
    
    // Notify assigned staff if exists and not the commenter
    if (complaint.staff_id && complaint.staff_id !== userId) {
      notifyUsers.add(complaint.staff_id);
    }

    for (const targetUserId of notifyUsers) {
      await this.notificationRepo.create({
        user_id: targetUserId,
        complaint_id: data.complaint_id,
        type: 'StatusUpdate',
        message: `New comment on "${complaint.title}"`,
      });
    }

    return comment;
  }

  // Get all comments for a complaint
  async getByComplaintId(complaintId: number): Promise<CommentResponse[]> {
    return this.commentRepo.findByComplaintId(complaintId);
  }

  // Delete comment (only by author)
  async delete(commentId: number, userId: number): Promise<boolean> {
    return this.commentRepo.delete(commentId, userId);
  }
}
