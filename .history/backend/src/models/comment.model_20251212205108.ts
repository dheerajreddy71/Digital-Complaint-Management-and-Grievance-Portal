// Comment system for two-way communication on complaints
export interface Comment {
  id: number;
  complaint_id: number;
  user_id: number;
  content: string;
  attachments: string; // JSON array
  created_at: Date;
}

export interface CreateCommentDto {
  complaint_id: number;
  content: string;
  attachments?: string[];
}

export interface CommentResponse extends Omit<Comment, 'attachments'> {
  attachments: string[];
  user_name: string;
  user_role: string;
}
