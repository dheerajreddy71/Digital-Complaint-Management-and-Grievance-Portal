import { Priority } from "../models/types";

// SLA configuration (hours) per priority level
export const SLA_HOURS: Record<Priority, number> = {
	Critical: 4,
	High: 12,
	Medium: 24,
	Low: 48,
};

// Warning threshold (percentage of SLA time elapsed before warning)
export const SLA_WARNING_THRESHOLD = 0.75; // 75%

/**
 * Calculate SLA deadline based on priority
 * @param priority - Complaint priority level
 * @param createdAt - Complaint creation timestamp
 * @returns SLA deadline date
 */
export function calculateSLADeadline(
	priority: Priority,
	createdAt: Date = new Date()
): Date {
	const hours = SLA_HOURS[priority];
	const deadline = new Date(createdAt);
	deadline.setHours(deadline.getHours() + hours);
	return deadline;
}

/**
 * Check if complaint is overdue
 * @param slaDeadline - SLA deadline timestamp
 * @param resolvedAt - Resolution timestamp (if resolved)
 * @returns true if overdue, false otherwise
 */
export function isOverdue(
	slaDeadline: Date,
	resolvedAt: Date | null = null
): boolean {
	const compareDate = resolvedAt || new Date();
	return compareDate > slaDeadline;
}

/**
 * Check if complaint is approaching SLA deadline (warning threshold)
 * @param slaDeadline - SLA deadline timestamp
 * @param createdAt - Complaint creation timestamp
 * @returns true if approaching deadline, false otherwise
 */
export function isApproachingDeadline(
	slaDeadline: Date,
	createdAt: Date
): boolean {
	const now = new Date();
	const totalTime = slaDeadline.getTime() - createdAt.getTime();
	const elapsed = now.getTime() - createdAt.getTime();
	const percentageElapsed = elapsed / totalTime;

	return (
		percentageElapsed >= SLA_WARNING_THRESHOLD && now < slaDeadline
	);
}

/**
 * Get remaining time until SLA deadline
 * @param slaDeadline - SLA deadline timestamp
 * @returns Object with days, hours, minutes remaining
 */
export function getRemainingTime(slaDeadline: Date): {
	days: number;
	hours: number;
	minutes: number;
	isOverdue: boolean;
} {
	const now = new Date();
	const diff = slaDeadline.getTime() - now.getTime();

	if (diff <= 0) {
		return { days: 0, hours: 0, minutes: 0, isOverdue: true };
	}

	const minutes = Math.floor(diff / 60000);
	const hours = Math.floor(minutes / 60);
	const days = Math.floor(hours / 24);

	return {
		days,
		hours: hours % 24,
		minutes: minutes % 60,
		isOverdue: false,
	};
}

/**
 * Format remaining time as human-readable string
 * @param slaDeadline - SLA deadline timestamp
 * @returns Formatted string like "2 days 3 hours" or "Overdue by 5 hours"
 */
export function formatRemainingTime(slaDeadline: Date): string {
	const remaining = getRemainingTime(slaDeadline);

	if (remaining.isOverdue) {
		const now = new Date();
		const overdueMs = now.getTime() - slaDeadline.getTime();
		const overdueHours = Math.floor(overdueMs / 3600000);
		const overdueDays = Math.floor(overdueHours / 24);

		if (overdueDays > 0) {
			return `Overdue by ${overdueDays} day${overdueDays > 1 ? "s" : ""}`;
		}
		return `Overdue by ${overdueHours} hour${overdueHours > 1 ? "s" : ""}`;
	}

	if (remaining.days > 0) {
		return `${remaining.days} day${remaining.days > 1 ? "s" : ""} ${remaining.hours} hour${remaining.hours !== 1 ? "s" : ""}`;
	}

	if (remaining.hours > 0) {
		return `${remaining.hours} hour${remaining.hours > 1 ? "s" : ""} ${remaining.minutes} min`;
	}

	return `${remaining.minutes} minute${remaining.minutes !== 1 ? "s" : ""}`;
}

/**
 * Recalculate SLA deadline when priority changes
 * @param originalDeadline - Original SLA deadline
 * @param originalPriority - Original priority level
 * @param newPriority - New priority level
 * @param createdAt - Complaint creation timestamp
 * @returns New SLA deadline
 */
export function recalculateSLAForPriorityChange(
	originalDeadline: Date,
	originalPriority: Priority,
	newPriority: Priority,
	createdAt: Date
): Date {
	// If priority upgraded (Critical > High > Medium > Low)
	// recalculate from creation time with new SLA
	return calculateSLADeadline(newPriority, createdAt);
}

/**
 * Get SLA status for display
 * @param slaDeadline - SLA deadline timestamp
 * @param createdAt - Complaint creation timestamp
 * @param resolvedAt - Resolution timestamp (if resolved)
 * @returns Status object with label, color, and percentage
 */
export function getSLAStatus(
	slaDeadline: Date,
	createdAt: Date,
	resolvedAt: Date | null = null
): {
	label: string;
	color: "success" | "warning" | "error" | "default";
	percentage: number;
} {
	if (resolvedAt) {
		const wasOverdue = isOverdue(slaDeadline, resolvedAt);
		return {
			label: wasOverdue ? "Resolved (Overdue)" : "Resolved (On Time)",
			color: wasOverdue ? "warning" : "success",
			percentage: 100,
		};
	}

	const now = new Date();
	const totalTime = slaDeadline.getTime() - createdAt.getTime();
	const elapsed = now.getTime() - createdAt.getTime();
	const percentage = Math.min((elapsed / totalTime) * 100, 100);

	if (isOverdue(slaDeadline)) {
		return {
			label: formatRemainingTime(slaDeadline),
			color: "error",
			percentage: 100,
		};
	}

	if (isApproachingDeadline(slaDeadline, createdAt)) {
		return {
			label: formatRemainingTime(slaDeadline),
			color: "warning",
			percentage,
		};
	}

	return {
		label: formatRemainingTime(slaDeadline),
		color: "default",
		percentage,
	};
}
