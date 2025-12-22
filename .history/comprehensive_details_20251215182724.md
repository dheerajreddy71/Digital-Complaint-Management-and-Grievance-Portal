Digital Complaint Management & Grievance Portal
Project Title: Digital Complaint Management & Grievance Portal
Objective
Develop a full-stack web application where users can register complaints, track their status, and provide feedback, with admin assignment and analytics (optional), using Angular, Node.js (TypeScript), and MySQL.
________________________________________
Functional Requirements
1. User Roles
•	User (Resident/Student/Employee): Can register complaints, track status, and provide feedback.
•	Staff/Technician: Can view assigned complaints, update status, and add resolution notes.
•	Admin (Optional): Can assign complaints, monitor all complaints, manage users, and view analytics.
Registration Options:
•	Users choose their role at signup: User / Staff / Admin (optional).
________________________________________
2. Complaint Registration & Management
Users can submit complaints with:
•	Title, description, category (plumbing, electrical, facility, etc.)
•	Priority level: Low / Medium / High / Critical
•	Location/Room Number: Specify exact location for faster resolution
•	Optional attachments (store as file path/URL)
Admin can assign complaints to staff/technicians.
UI Suggestions:
•	Complaint Registration Page: Form to submit a complaint with smart category suggestions.
•	User Dashboard: Track complaints and view status with visual progress indicators.
•	Admin Dashboard (Optional): Assign complaints, view complaint list, and drag-and-drop assignment interface.
________________________________________
3. Complaint Status Tracking
•	Complaint lifecycle: Open → Assigned → In-progress → Resolved
•	SLA Tracking: Each category has predefined response time (e.g., Plumbing: 24 hrs, Electrical: 12 hrs)
•	Overdue Marking: Automatically flag complaints that exceed SLA deadlines
•	Users get updates when status changes.
•	Staff/Technicians can update status and add resolution notes.
UI Suggestions:
•	Status Tracking Page: Shows status progression with timeline view (similar to order tracking).
•	Notes Section: Staff can add updates or resolution details with timestamps.
•	Progress Bar: Visual indicator showing complaint lifecycle stages.
________________________________________
4. Frontend Requirements (Angular 16)
•	Use Angular Material for all UI components.
•	Maintain a clean folder/component hierarchy.
•	Implement Angular PWA: Enable offline mode and app installation.
•	Dark/Light Mode Toggle: User preference stored in local storage.
Suggested Components
•	RegistrationComponent → Register new users with role selection.
•	ComplaintListComponent → View complaints (User) with filtering and search.
•	ComplaintDetailsComponent → Submit/view individual complaint details with attachment preview.
•	ComplaintTimelineComponent → Display complete complaint history with timestamps.
•	StaffDashboardComponent → Manage assigned complaints with workload indicator (Staff).
•	AdminDashboardComponent (Optional) → Assign complaints, view analytics, and performance metrics.
•	FeedbackComponent → Submit rating and feedback after complaint resolution.
•	NotificationCenterComponent → View all notifications in one place.
•	FilterSortComponent → Advanced filtering by date, category, priority, status, staff.
Suggested Routes
Path	Component	Description
/register	RegistrationComponent	User registration & role selection
/complaints	ComplaintListComponent	View all user complaints with filters
/complaints/new	ComplaintDetailsComponent	Submit a new complaint
/complaints/:id	ComplaintTimelineComponent	View complaint timeline and history
/complaints/:id/feedback	FeedbackComponent	Submit feedback after resolution
/staff/dashboard	StaffDashboardComponent	Manage assigned complaints
/admin/dashboard (optional)	AdminDashboardComponent	Assign complaints & analytics
/notifications	NotificationCenterComponent	View all notifications
________________________________________
5. Backend Requirements (Node.js + TypeScript + Express)
•	Use MySQL for persistent storage.
•	Create REST APIs for complaints, users, staff assignment, and notifications.
•	Layered Architecture: Separate controllers, services, repositories, and middlewares.
•	JWT with Refresh Token: Access token (30 min) + Refresh token (7 days).
•	Rate Limiting: Implement on login and complaint submission endpoints.
•	Scheduled Jobs: Check for SLA breaches and send reminders.
•	Include validation and error handling.
•	Admin-related APIs are optional depending on implementation.
Additional Backend Features
•	WebSocket Support (Optional): Real-time status updates and notifications.
•	Email Service Integration: Send email alerts for status changes.
•	Audit Logging: Log all critical actions (complaint created, status changed, staff assigned).
•	Auto-Assignment Logic: Assign complaints based on staff workload and expertise.
•	File Upload Validation: Restrict file types (JPG, PNG, PDF), size limits, and sanitize filenames.
________________________________________
6. Database Structure (MySQL)
Users Table
Field	Type	Description
id	INT (PK)	Primary key
name	VARCHAR	User name
email	VARCHAR	Unique email
password	VARCHAR	Hashed password
role	ENUM	User / Staff / Admin
contact_info	VARCHAR	Phone number
expertise	VARCHAR	Staff specialization (nullable)
is_active	BOOLEAN	Account status
created_at	TIMESTAMP	Creation timestamp
Complaints Table
Field	Type	Description
id	INT (PK)	Primary key
user_id	INT (FK)	References Users.id
staff_id	INT (FK)	Assigned staff (nullable)
title	VARCHAR	Complaint title
description	TEXT	Detailed description
category	ENUM	Plumbing/Electrical/Facility/IT/Other
priority	ENUM	Low/Medium/High/Critical
location	VARCHAR	Room/Building/Area
status	ENUM	Open/Assigned/In-progress/Resolved
sla_deadline	DATETIME	Expected resolution time
is_overdue	BOOLEAN	SLA breach flag
attachments	TEXT	File paths (JSON array)
created_at	TIMESTAMP	Creation timestamp
updated_at	TIMESTAMP	Last update timestamp
resolved_at	TIMESTAMP	Resolution timestamp (nullable)
Status_History Table (Optional but Recommended)
Field	Type	Description
id	INT (PK)	Primary key
complaint_id	INT (FK)	References Complaints.id
previous_status	ENUM	Previous status
new_status	ENUM	New status
updated_by	INT (FK)	References Users.id
notes	TEXT	Status update notes
timestamp	TIMESTAMP	Change timestamp
Feedback Table
Field	Type	Description
id	INT (PK)	Primary key
complaint_id	INT (FK)	References Complaints.id
rating	INT	Rating 1-5
review	TEXT	Feedback comment
is_resolved	BOOLEAN	Issue fully resolved?
submitted_at	TIMESTAMP	Submission timestamp
Notifications Table
Field	Type	Description
id	INT (PK)	Primary key
user_id	INT (FK)	References Users.id
complaint_id	INT (FK)	References Complaints.id
type	ENUM	Assigned/StatusUpdate/Resolved/Reminder
message	TEXT	Notification content
is_read	BOOLEAN	Read status
created_at	TIMESTAMP	Creation timestamp
Audit_Logs Table (Optional)
Field	Type	Description
id	INT (PK)	Primary key
user_id	INT (FK)	References Users.id
action	VARCHAR	Action performed
entity_type	VARCHAR	Complaint/User/Staff
entity_id	INT	Related entity ID
details	JSON	Additional details
ip_address	VARCHAR	User IP
timestamp	TIMESTAMP	Action timestamp
Maximum 4-5 tables with proper relations: Users ↔ Complaints ↔ Status_History ↔ Feedback ↔ Notifications.
________________________________________
7. Validation Outline
•	Complaint title, description, and category must not be empty.
•	Priority field is required at complaint creation.
•	Location field should be validated against predefined locations (optional).
•	Status must follow defined flow: Open → Assigned → In-progress → Resolved.
•	Role at registration must be valid: User / Staff / Admin (optional).
•	File uploads: Max size 5MB, allowed types: JPG, PNG, PDF.
•	Rating: Must be between 1-5.
•	SLA deadlines: Automatically calculated based on category.
•	Include all necessary validation to maintain workflow and data integrity.
________________________________________
8. Additional Requirements
•	Proper HTTP status codes (200, 201, 400, 401, 403, 404, 500).
•	UI must show meaningful success or error messages with toast notifications.
•	Real-time updates for complaint status using polling (every 30 seconds) or WebSockets (optional).
•	In-app notification system with unread count badge.
•	Email notifications for status changes and SLA reminders.
•	Admin analytics dashboard is optional but recommended.
________________________________________
9. Exception Handling
•	Frontend and backend should gracefully handle all errors.
•	UI must show user-friendly error messages using Angular Material Snackbar.
•	Backend should log errors for debugging and maintenance.
•	Global error interceptor in Angular for handling HTTP errors.
•	Try-catch blocks in all backend async operations.
•	Database transaction rollbacks on errors.
________________________________________
10. Role-Based Access (Using Angular Guards)
Use Angular route guards to control access:
•	User: Submit complaints, view status, give feedback.
•	Staff/Technician: View assigned complaints, update status, add notes.
•	Admin (Optional): Assign complaints, view analytics & overall system data, manage users.
Unauthorized users are redirected to login or a Not Authorized page.
Guards ensure proper role-based component access and secure workflow.
Backend RBAC middleware validates role permissions on every protected route.
________________________________________
✅ Advanced Feature Enhancements
11. Priority & SLA Management
Implementation:
•	Each complaint assigned a priority: Low / Medium / High / Critical.
•	Admin or user sets priority at creation.
•	SLA deadlines calculated automatically: 
o	Critical: 4 hours
o	High: 12 hours
o	Medium: 24 hours
o	Low: 48 hours
•	Backend scheduled job checks for overdue complaints every hour.
•	Overdue complaints highlighted in red on dashboards.
Benefits: Better workflow, faster handling of urgent issues, improved accountability.
________________________________________
12. Complaint Timeline & Activity History
Implementation:
•	Track every action on a complaint: 
o	Complaint created
o	Technician assigned
o	Status changed
o	Notes added
o	Attachments uploaded
o	Feedback submitted
•	Display as vertical timeline with timestamps and actor names.
•	Each entry shows "Who did What and When".
UI Design: Similar to Amazon/Swiggy order tracking with icons and progress lines.
Benefits: Complete transparency, professional appearance, audit trail.
________________________________________
13. Feedback & Rating System
Implementation:
•	After complaint resolution, user prompted to: 
o	Rate service: ★★★★★ (1-5 stars)
o	Provide written feedback
o	Mark if issue was fully resolved
•	Admin dashboard shows: 
o	Average rating per staff member
o	Staff performance leaderboard
o	Feedback trends over time
Benefits: Measure staff performance, identify training needs, improve service quality.
________________________________________
14. Advanced Search, Filter & Sort
Implementation:
•	Search: By complaint ID, title, description, location.
•	Filter: By date range, category, priority, status, assigned staff, overdue status.
•	Sort: By newest/oldest, priority, SLA deadline, pending longest.
•	Save filter presets: Users can save commonly used filter combinations.
UI: Filter panel with chips showing active filters, clear all option.
Benefits: Quick complaint discovery, better dashboard usability, time-saving.
________________________________________
15. Smart Notification System
Implementation:
•	In-app notifications: Bell icon with unread count badge.
•	Email notifications: Optional, user can configure preferences.
•	Notification types: 
o	Complaint assigned to staff
o	Status updated
o	Resolution completed
o	SLA deadline approaching (2 hours before)
o	SLA breached
o	Feedback requested
•	Mark as read/unread functionality.
•	Notification history page.
Benefits: Keep all stakeholders informed, reduce response time, improve engagement.
________________________________________
16. Attachment Management with Preview
Implementation:
•	Support multiple file uploads per complaint.
•	File types: Images (JPG, PNG), PDFs, videos (optional).
•	Preview in modal: Click thumbnail to view full image or PDF.
•	Image carousel: Navigate between multiple attachments.
•	Before/After photos: Staff can upload resolution photos.
•	Download option: For all attachment types.
Benefits: Better issue documentation, visual proof, easier troubleshooting.
________________________________________
17. Auto-Assignment Intelligence
Implementation:
•	Admin enables auto-assignment rules: 
o	Assign to staff with least active complaints
o	Assign based on category expertise
o	Round-robin distribution
o	Skip staff on leave/offline
•	Staff profile includes: 
o	Specialization tags (Plumbing, Electrical, etc.)
o	Current workload count
o	Availability status
•	Algorithm considers all factors before assignment.
Benefits: Balanced workload, faster assignment, reduced admin manual work.
________________________________________
18. QR Code Generation for Locations
Implementation:
•	Generate QR codes for common locations (rooms, labs, buildings).
•	Users scan QR code → auto-fills location in complaint form.
•	QR code can also pre-select category based on location type.
•	Admin panel to generate and print QR codes.
Use Case: Campus hostels, offices, labs, public facilities.
Benefits: Faster complaint submission, accurate location data, improved UX.
________________________________________
19. Analytics & Reporting Dashboard
Implementation:
•	Admin Dashboard includes: 
o	Total complaints by status (pie chart)
o	Category-wise distribution (bar chart)
o	Priority breakdown (donut chart)
o	SLA compliance rate
o	Average resolution time
o	Staff performance comparison
o	Complaint trends over time (line chart)
o	Peak hours/days heatmap
o	Most affected locations
•	Export reports: Download as PDF or Excel.
•	Date range filters: Last 7 days, 30 days, custom range.
Tools: Angular ApexCharts or Chart.js for visualizations.
Benefits: Data-driven decisions, identify bottlenecks, track improvements.
________________________________________
20. Bulk Operations (Admin)
Implementation:
•	Select multiple complaints using checkboxes.
•	Bulk actions: 
o	Assign to staff
o	Change priority
o	Change status
o	Delete/archive
o	Export selected
•	Confirmation modal before bulk operations.
Benefits: Save time for admins, efficient complaint management.
________________________________________
21. Complaint Duplication Detection
Implementation:
•	When user submits complaint, system checks for: 
o	Similar title (using string matching)
o	Same category + location
o	Timeframe: Last 7 days
•	Show warning: "Similar complaint exists, do you want to proceed?"
•	Option to view existing complaint instead.
Benefits: Reduce duplicate complaints, cleaner database, better tracking.
________________________________________
22. Staff Workload Indicator
Implementation:
•	Staff dashboard shows: 
o	Active complaints count
o	Overdue complaints count
o	Workload status: Light / Moderate / Heavy (color-coded)
o	Today's assignments
•	Admin can see all staff workloads at a glance.
•	Auto-assignment considers workload before assignment.
Benefits: Fair distribution, prevent staff burnout, visibility into capacity.
________________________________________
23. Recurring Complaint Flagging
Implementation:
•	System detects recurring complaints: 
o	Same location + category within 30 days
o	Frequency > 3 times
•	Flag as "Recurring Issue" with special badge.
•	Admin notified to investigate root cause.
•	Separate section for recurring complaints.
Benefits: Identify systemic problems, proactive maintenance, prevent repeated issues.
________________________________________
24. Mobile-First Responsive Design
Implementation:
•	Fully responsive UI for all screen sizes.
•	Bottom navigation for mobile view.
•	Swipe gestures for complaint cards.
•	Touch-friendly buttons and inputs.
•	Camera integration for photo upload on mobile.
Benefits: Better mobile experience, accessibility for all devices.
________________________________________
25. User Preferences & Settings
Implementation:
•	User profile settings page: 
o	Theme preference (Light/Dark)
o	Notification preferences (Email on/off, types)
o	Default complaint category
o	Language preference (optional)
o	Dashboard layout (Grid/List)
•	Settings stored per user in database.
Benefits: Personalized experience, user control, improved satisfaction.
________________________________________
26. Export & Import Functionality
Implementation:
•	Export: 
o	Export complaints as CSV/Excel
o	Export filtered results
o	Export analytics reports as PDF
•	Import (Admin only): 
o	Bulk upload users via CSV
o	Import historical complaints
o	Template download for proper format
Benefits: Data portability, migration support, reporting flexibility.
________________________________________
27. Complaint Escalation System
Implementation:
•	If complaint not resolved within SLA + grace period: 
o	Auto-escalate to senior staff or admin
o	Change priority to Critical
o	Send urgent notification
o	Flag in dashboard as "Escalated"
•	Manual escalation button for users.
Benefits: Ensures attention to neglected complaints, accountability, SLA enforcement.
________________________________________
28. Multi-Language Support (i18n)
Implementation:
•	Angular internationalization (i18n) for UI text.
•	Support multiple languages: English, Hindi, Spanish (example).
•	Language switcher in navigation bar.
•	User's language preference saved.
Benefits: Accessibility for diverse users, wider adoption, inclusivity.
________________________________________
29. Complaint Categorization with AI Suggestions
Implementation:
•	User types description in complaint form.
•	Simple keyword-based algorithm suggests: 
o	Category (Plumbing, Electrical, etc.)
o	Priority (based on keywords like "urgent", "broken")
•	User can accept or modify suggestion.
•	Backend uses simple string matching initially.
•	Future: Integrate ML model for better accuracy.
Benefits: Faster form filling, accurate categorization, improved user experience.
________________________________________
30. Staff Leave/Availability Management
Implementation:
•	Staff can mark themselves as: 
o	Available
o	On Leave
o	Busy
•	Auto-assignment skips unavailable staff.
•	Admin can view staff availability calendar.
•	Complaints not assigned to staff on leave.
Benefits: Realistic workload planning, prevents missed assignments, better coordination.
________________________________________
31. Commenting System
Implementation:
•	Users and staff can add comments on complaints.
•	Comment thread displayed chronologically.
•	Comments include: 
o	Commenter name and role
o	Timestamp
o	Optional attachments
•	Push notifications when new comment added.
Benefits: Two-way communication, clarifications, better collaboration.
________________________________________
32. Complaint Templates
Implementation:
•	Frequently reported issues saved as templates.
•	Admin creates templates with: 
o	Pre-filled category
o	Standard description
o	Default priority
•	Users select template and customize if needed.
Example Templates: "Broken AC", "Water leakage", "WiFi not working".
Benefits: Faster complaint submission, consistency, less typing.
________________________________________
33. Dashboard Widgets & Customization
Implementation:
•	User dashboard with draggable widgets: 
o	My active complaints
o	Recent updates
o	Quick submit button
o	Notification feed
o	Statistics
•	Users can show/hide widgets.
•	Save layout preference.
Benefits: Personalized dashboard, improved UX, quick access to important info.
________________________________________
34. Geolocation for Mobile
Implementation:
•	Mobile users can enable location services.
•	Auto-detect building/area based on GPS coordinates.
•	Pre-fill location in complaint form.
•	Map view showing complaint location (admin).
Benefits: Accurate location data, faster resolution, useful for large campuses.
________________________________________
35. Performance Metrics & Gamification (Staff)
Implementation:
•	Staff dashboard shows personal metrics: 
o	Total complaints resolved
o	Average resolution time
o	Rating score
o	SLA compliance rate
o	Badges earned (Fast Resolver, High Rated, etc.)
•	Leaderboard for friendly competition.
Benefits: Motivates staff, recognizes top performers, improves service quality.
________________________________________
36. Complaint Archival & History
Implementation:
•	Resolved complaints automatically archived after 90 days.
•	Archived complaints moved to separate view.
•	Users can search archived complaints.
•	Admin can permanently delete archived complaints.
•	Maintains database performance.
Benefits: Clean active view, historical data preserved, better performance.
________________________________________
37. Custom Fields for Complaint Types
Implementation:
•	Admin configures additional fields per category: 
o	Plumbing: Fixture type, Floor number
o	Electrical: Appliance type, Circuit area
o	IT: Software/Hardware, Device ID
•	Dynamic form rendering based on selected category.
Benefits: Collect relevant information, better categorization, faster resolution.
________________________________________
38. Scheduled Maintenance Mode
Implementation:
•	Admin can enable maintenance mode.
•	Display message: "System under maintenance, will be back at [time]".
•	Restrict all operations except admin access.
•	Countdown timer showing when system will be online.
Benefits: Inform users during downtime, professional handling of maintenance.
________________________________________
39. JWT Refresh Token Implementation
Implementation:
•	Access token expires in 30 minutes.
•	Refresh token expires in 7 days.
•	Token refresh endpoint.
•	Angular interceptor auto-refreshes token before expiry.
•	Logout clears both tokens.
Benefits: Enhanced security, better session management, reduced re-login frequency.
________________________________________
40. Rate Limiting & Security
Implementation:
•	Login endpoint: 5 attempts per 15 minutes per IP.
•	Complaint submission: 10 per hour per user.
•	API endpoints protected with rate limiting middleware.
•	Prevent brute force attacks.
Tools: express-rate-limit package.
Benefits: DDoS protection, prevent abuse, system stability.
________________________________________
📌 Technology Stack (Unchanged)
•	Frontend: Angular 16 with Angular Material
•	Backend: Node.js with TypeScript and Express
•	Database: MySQL
•	Authentication: JWT (with refresh tokens)
•	File Storage: Local server or cloud integration (AWS S3, Cloudinary)
•	Optional: WebSockets for real-time updates
________________________________________
⭐ Recommended Priority for Implementation
Phase 1: Core + Essential 
1.	Basic CRUD operations
2.	Role-based authentication & guards
3.	Status tracking with lifecycle
4.	Priority & SLA management
5.	Notification system (in-app)
6.	Feedback & rating system
Phase 2: User Experience 
7.	Complaint timeline/history
8.	Advanced search, filter, sort
9.	Attachment management with preview
10.	Dark/Light mode
11.	Mobile-responsive design
12.	Analytics dashboard
Phase 3: Intelligence & Automation 
13.	Auto-assignment logic
14.	QR code generation
15.	AI category suggestions
16.	Recurring complaint detection
17.	Escalation system
18.	Duplication detection
Phase 4: Advanced Features 
19.	Staff workload management
20.	Bulk operations
21.	Commenting system
22.	JWT refresh tokens
23.	Audit logging
24.	Export/Import functionality
25.	Geolocation support
26.	Gamification for staff
________________________________________
🎯 Final Notes
This enhanced project document transforms your complaint management system from a basic CRUD application to an industry-grade, production-ready portal with features found in enterprise solutions.
Key Differentiators:
•	SLA tracking and escalation
•	Intelligent auto-assignment
•	Comprehensive analytics
•	Professional timeline UI
•	Multi-stakeholder engagement
•	Performance gamification
•	Security best practices
