# Remaining TypeScript Fixes Needed

## AnalyticsData Property Mapping

The `AnalyticsData` interface uses nested properties. Replace all occurrences:

### Direct Property Access → Nested Access:

- `analytics.total_complaints` → `analytics.overview.total_complaints`
- `analytics.pending_complaints` → `analytics.overview.pending_complaints`
- `analytics.resolved_complaints` → `analytics.overview.resolved_complaints`
- `analytics.overdue_count` → `analytics.overview.overdue_complaints`
- `analytics.avg_resolution_time` → `analytics.overview.average_resolution_hours`
- `analytics.sla_compliance_rate` → `analytics.overview.sla_compliance_rate`

### Array Property Access → Array Access:

- `analytics.status_breakdown.pending` → `analytics.by_status.find(s => s.status === 'pending')?.count`
- `analytics.status_breakdown.resolved` → `analytics.by_status.find(s => s.status === 'resolved')?.count`
- `analytics.category_breakdown` → `analytics.by_category`
- `analytics.priority_breakdown` → `analytics.by_priority`

### StaffPerformanceMetrics Property Mapping:

- Use `StaffPerformanceMetrics` properties directly (already correct in models)
- Properties available: `staff_id`, `staff_name`, `total_resolved`, `average_rating`, `average_resolution_hours`

### StaffPerformance Properties (different from StaffPerformanceMetrics):

- `avg_resolution_time` → `average_resolution_hours`
- `current_load` → Does not exist (remove or calculate from active complaints)
- `resolved_count` → `total_resolved`
- `avg_rating` → `average_rating`

## Files that need AnalyticsData fixes:

1. `admin-overview.component.ts` - Lines 34, 45, 57, 68, 80, 92, 112, 642, 652, 670
2. `analytics-dashboard.component.ts` - Lines 47, 58, 76, 82, 110, 212, 214, 217, 221, 231, 288, 884, 891, 892, 894, 895, 900, 901, 927, 945, 950, 952, 969, 970
3. `staff-management.component.ts` - Line 520, 556
4. `staff-performance.component.ts` - Lines 38, 66, 485

## Other Remaining Fixes:

1. **UserRole.USER** → **UserRole.CITIZEN** in user-management:line 452, 520
2. **NotificationType** - Already fixed
3. **File | null** - Already handled
4. Add **UserRole** to complaint-list component template usage

## Quick Fix Commands (run in terminal):

```bash
# Add UserRole to template in complaint-list
# Import UserRole in the component class and expose it
```
