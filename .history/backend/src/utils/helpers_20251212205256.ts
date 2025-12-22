import { Priority, SLA_HOURS, ComplaintCategory } from '../models';

// Calculate SLA deadline based on priority
export const calculateSlaDeadline = (priority: Priority, createdAt: Date = new Date()): Date => {
  const hours = SLA_HOURS[priority];
  const deadline = new Date(createdAt);
  deadline.setHours(deadline.getHours() + hours);
  return deadline;
};

// Check if a complaint is overdue
export const isOverdue = (slaDeadline: Date): boolean => {
  return new Date() > new Date(slaDeadline);
};

// Get hours remaining until SLA deadline
export const getHoursRemaining = (slaDeadline: Date): number => {
  const now = new Date();
  const deadline = new Date(slaDeadline);
  const diffMs = deadline.getTime() - now.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60));
};

// Check if SLA deadline is approaching (within 2 hours as specified)
export const isSlaApproaching = (slaDeadline: Date): boolean => {
  const hoursRemaining = getHoursRemaining(slaDeadline);
  return hoursRemaining > 0 && hoursRemaining <= 2;
};

// Sanitize filename for safe storage
export const sanitizeFilename = (filename: string): string => {
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_{2,}/g, '_')
    .substring(0, 200);
};

// Generate unique filename with timestamp
export const generateUniqueFilename = (originalName: string): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const ext = originalName.split('.').pop() || '';
  const name = sanitizeFilename(originalName.replace(`.${ext}`, ''));
  return `${name}_${timestamp}_${random}.${ext}`;
};

// Simple keyword-based category suggestion
const CATEGORY_KEYWORDS: Record<ComplaintCategory, string[]> = {
  Plumbing: ['water', 'leak', 'pipe', 'tap', 'faucet', 'drain', 'toilet', 'bathroom', 'sink', 'shower', 'plumbing'],
  Electrical: ['power', 'electric', 'light', 'switch', 'socket', 'outlet', 'wire', 'fan', 'ac', 'air conditioner'],
  Facility: ['door', 'window', 'furniture', 'chair', 'table', 'desk', 'lock', 'key', 'clean', 'maintenance'],
  IT: ['computer', 'laptop', 'internet', 'wifi', 'network', 'printer', 'software', 'hardware', 'mouse', 'keyboard'],
  Other: [],
};

// Suggest category based on description keywords
export const suggestCategory = (description: string): ComplaintCategory => {
  const lowerDesc = description.toLowerCase();
  
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (category === 'Other') continue;
    if (keywords.some(keyword => lowerDesc.includes(keyword))) {
      return category as ComplaintCategory;
    }
  }
  
  return 'Other';
};

// Suggest priority based on urgency keywords
const URGENT_KEYWORDS = ['urgent', 'emergency', 'critical', 'broken', 'not working', 'immediately', 'asap', 'dangerous'];
const HIGH_KEYWORDS = ['important', 'soon', 'quickly', 'priority'];

export const suggestPriority = (description: string): Priority => {
  const lowerDesc = description.toLowerCase();
  
  if (URGENT_KEYWORDS.some(keyword => lowerDesc.includes(keyword))) {
    return 'Critical';
  }
  if (HIGH_KEYWORDS.some(keyword => lowerDesc.includes(keyword))) {
    return 'High';
  }
  
  return 'Medium';
};

// Format date for display
export const formatDate = (date: Date): string => {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Calculate resolution time in hours
export const calculateResolutionTime = (createdAt: Date, resolvedAt: Date): number => {
  const diffMs = new Date(resolvedAt).getTime() - new Date(createdAt).getTime();
  return Math.round(diffMs / (1000 * 60 * 60) * 10) / 10; // Round to 1 decimal
};
