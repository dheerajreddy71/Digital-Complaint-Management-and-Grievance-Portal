import { 
  ComplaintRepository, 
  StatusHistoryRepository, 
  NotificationRepository,
  AuditLogRepository,
  UserRepository
} from '../repositories';
import { 
  CreateComplaintDto, 
  UpdateComplaintDto, 
  ComplaintResponse,
  ComplaintFilters,
  PaginatedResponse,
  ComplaintStatus,
  DuplicateCheckResult,
  NotificationType
} from '../models';
import { suggestCategory, suggestPriority, logger } from '../utils';

export class ComplaintService {
  private complaintRepo = new ComplaintRepository();
  private statusRepo = new StatusHistoryRepository();
  private notificationRepo = new NotificationRepository();
  private auditRepo = new AuditLogRepository();
  private userRepo = new UserRepository();

  // Create new complaint
  async create(userId: number, data: CreateComplaintDto, ipAddress?: string): Promise<ComplaintResponse> {
    const complaint = await this.complaintRepo.create(userId, data);

    // Log initial status
    await this.statusRepo.create({
      complaint_id: complaint.id,
      previous_status: null,
      new_status: 'Open',
      updated_by: userId,
      notes: 'Complaint submitted',
    });

    // Check for recurring issues
    const isRecurring = await this.complaintRepo.checkRecurring(data.category, data.location);
    if (isRecurring) {
      await this.complaintRepo.markAsRecurring(complaint.id);
      // Notify admin about recurring issue
      const admins = await this.userRepo.findAll();
      for (const admin of admins.filter(u => u.role === 'Admin')) {
        await this.notificationRepo.create({
          user_id: admin.id,
          complaint_id: complaint.id,
          type: 'Reminder',
          message: `Recurring issue detected: ${data.category} at ${data.location}`,
        });
      }
    }

    // Audit log
    await this.auditRepo.create({
      user_id: userId,
      action: 'COMPLAINT_CREATED',
      entity_type: 'Complaint',
      entity_id: complaint.id,
      details: { title: data.title, category: data.category, priority: data.priority },
      ip_address: ipAddress,
    });

    logger.info(`Complaint created: #${complaint.id} - ${data.title}`);

    return complaint;
  }

  // Get complaint by ID
  async getById(id: number): Promise<ComplaintResponse | null> {
    return this.complaintRepo.findById(id);
  }

  // Get complaints with filters
  async getAll(filters: ComplaintFilters): Promise<PaginatedResponse<ComplaintResponse>> {
    return this.complaintRepo.findAll(filters);
  }

  // Update complaint
  async update(
    complaintId: number, 
    data: UpdateComplaintDto, 
    updatedBy: number,
    ipAddress?: string
  ): Promise<ComplaintResponse | null> {
    const current = await this.complaintRepo.findById(complaintId);
    if (!current) return null;

    // If status is changing, validate transition and log history
    if (data.status && data.status !== current.status) {
      this.validateStatusTransition(current.status, data.status);

      await this.statusRepo.create({
        complaint_id: complaintId,
        previous_status: current.status,
        new_status: data.status,
        updated_by: updatedBy,
        notes: data.notes,
      });

      // Notify user about status change
      await this.notificationRepo.create({
        user_id: current.user_id,
        complaint_id: complaintId,
        type: data.status === 'Resolved' ? 'Resolved' : 'StatusUpdate',
        message: `Your complaint "${current.title}" status changed to ${data.status}`,
      });

      // Request feedback if resolved
      if (data.status === 'Resolved') {
        await this.notificationRepo.create({
          user_id: current.user_id,
          complaint_id: complaintId,
          type: 'FeedbackRequest',
          message: `Please rate the service for "${current.title}"`,
        });
      }
    }

    const updated = await this.complaintRepo.update(complaintId, data);

    // Audit log
    await this.auditRepo.create({
      user_id: updatedBy,
      action: 'COMPLAINT_UPDATED',
      entity_type: 'Complaint',
      entity_id: complaintId,
      details: data,
      ip_address: ipAddress,
    });

    return updated;
  }

  // Assign complaint to staff
  async assign(
    complaintId: number, 
    staffId: number, 
    assignedBy: number,
    ipAddress?: string
  ): Promise<ComplaintResponse | null> {
    const complaint = await this.complaintRepo.findById(complaintId);
    if (!complaint) return null;

    const updated = await this.complaintRepo.assign(complaintId, staffId);

    // Log status change
    await this.statusRepo.create({
      complaint_id: complaintId,
      previous_status: complaint.status,
      new_status: 'Assigned',
      updated_by: assignedBy,
      notes: `Assigned to staff #${staffId}`,
    });

    // Notify staff about assignment
    await this.notificationRepo.create({
      user_id: staffId,
      complaint_id: complaintId,
      type: 'Assigned',
      message: `New complaint assigned to you: ${complaint.title}`,
    });

    // Notify user
    await this.notificationRepo.create({
      user_id: complaint.user_id,
      complaint_id: complaintId,
      type: 'StatusUpdate',
      message: `Your complaint "${complaint.title}" has been assigned to a technician`,
    });

    // Audit log
    await this.auditRepo.create({
      user_id: assignedBy,
      action: 'COMPLAINT_ASSIGNED',
      entity_type: 'Complaint',
      entity_id: complaintId,
      details: { staff_id: staffId },
      ip_address: ipAddress,
    });

    logger.info(`Complaint #${complaintId} assigned to staff #${staffId}`);

    return updated;
  }

  // Auto-assign based on workload and expertise
  async autoAssign(complaintId: number, assignedBy: number): Promise<ComplaintResponse | null> {
    const complaint = await this.complaintRepo.findById(complaintId);
    if (!complaint) return null;

    // Get staff with matching expertise and lowest workload
    const availableStaff = await this.userRepo.getStaffWithWorkload();
    
    // Filter by expertise if possible
    const categoryMap: Record<string, string> = {
      'Plumbing': 'Plumbing',
      'Electrical': 'Electrical',
      'IT': 'IT',
      'Facility': 'Facility',
    };

    const expertiseMatch = categoryMap[complaint.category] || complaint.category;
    
    let selectedStaff = availableStaff.find(s => 
      s.expertise?.toLowerCase().includes(expertiseMatch.toLowerCase())
    );

    // If no expertise match, get staff with lowest workload
    if (!selectedStaff && availableStaff.length > 0) {
      selectedStaff = availableStaff[0]; // Already sorted by workload
    }

    if (!selectedStaff) {
      throw new Error('No available staff for assignment');
    }

    return this.assign(complaintId, selectedStaff.id, assignedBy);
  }

  // Check for duplicate complaints
  async checkDuplicates(data: CreateComplaintDto, userId: number): Promise<DuplicateCheckResult> {
    return this.complaintRepo.checkDuplicates(data, userId);
  }

  // Get AI suggestions for category and priority
  getSuggestions(description: string): { category: string; priority: string } {
    return {
      category: suggestCategory(description),
      priority: suggestPriority(description),
    };
  }

  // Delete complaint (admin only)
  async delete(complaintId: number, deletedBy: number, ipAddress?: string): Promise<void> {
    await this.complaintRepo.delete(complaintId);

    await this.auditRepo.create({
      user_id: deletedBy,
      action: 'COMPLAINT_DELETED',
      entity_type: 'Complaint',
      entity_id: complaintId,
      ip_address: ipAddress,
    });
  }

  // Bulk assign (admin)
  async bulkAssign(complaintIds: number[], staffId: number, assignedBy: number): Promise<void> {
    for (const id of complaintIds) {
      await this.assign(id, staffId, assignedBy);
    }
  }

  // Bulk update status (admin)
  async bulkUpdateStatus(complaintIds: number[], status: ComplaintStatus, updatedBy: number): Promise<void> {
    for (const id of complaintIds) {
      await this.update(id, { status }, updatedBy);
    }
  }

  // Get complaint timeline
  async getTimeline(complaintId: number) {
    return this.statusRepo.getComplaintTimeline(complaintId);
  }

  // Validate status transition follows: Open → Assigned → In-progress → Resolved
  private validateStatusTransition(current: ComplaintStatus, next: ComplaintStatus): void {
    const validTransitions: Record<ComplaintStatus, ComplaintStatus[]> = {
      'Open': ['Assigned', 'In-progress'], // Skip to In-progress allowed for quick fixes
      'Assigned': ['In-progress', 'Resolved'],
      'In-progress': ['Resolved'],
      'Resolved': [], // Terminal state
    };

    if (!validTransitions[current].includes(next)) {
      throw new Error(`Invalid status transition from ${current} to ${next}`);
    }
  }
}
