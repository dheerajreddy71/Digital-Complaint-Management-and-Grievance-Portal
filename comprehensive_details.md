Digital Complaint Management & Grievance Portal
Project Title: Digital Complaint Management & Grievance Portal
Objective
Develop a full-stack web application where users can register complaints, track their status, and provide feedback, with admin assignment and analytics (optional), using Angular, Node.js (TypeScript), and MySQL.

---

Functional Requirements

1. User Roles
   • User (Resident/Student/Employee): Can register complaints, track status, and provide feedback.
   • Staff/Technician: Can view assigned complaints, update status, and add resolution notes.
   • Admin (Optional): Can assign complaints, monitor all complaints, manage users, and view analytics.
   Registration Options:
   • Users choose their role at signup: User / Staff / Admin (optional).

---

2. Complaint Registration & Management
   Users can submit complaints with:
   • Title, description, category (plumbing, electrical, facility, etc.)
   • Priority level: Low / Medium / High / Critical
   • Location/Room Number: Specify exact location for faster resolution
   • Optional attachments (store as file path/URL)
   Admin can assign complaints to staff/technicians.
   UI Suggestions:
   • Complaint Registration Page: Form to submit a complaint with smart category suggestions.
   • User Dashboard: Track complaints and view status with visual progress indicators.
   • Admin Dashboard (Optional): Assign complaints, view complaint list, and drag-and-drop assignment interface.

---

3. Complaint Status Tracking
   • Complaint lifecycle: Open → Assigned → In-progress → Resolved
   • SLA Tracking: Each category has predefined response time (e.g., Plumbing: 24 hrs, Electrical: 12 hrs)
   • Overdue Marking: Automatically flag complaints that exceed SLA deadlines
   • Users get updates when status changes.
   • Staff/Technicians can update status and add resolution notes.
   UI Suggestions:
   • Status Tracking Page: Shows status progression with timeline view (similar to order tracking).
   • Notes Section: Staff can add updates or resolution details with timestamps.
   • Progress Bar: Visual indicator showing complaint lifecycle stages.

---

4. Frontend Requirements (Angular 16)
   • Use Angular Material for all UI components.
   • Maintain a clean folder/component hierarchy.
   • Implement Angular PWA: Enable offline mode and app installation.
   • Dark/Light Mode Toggle: User preference stored in local storage.
   Suggested Components
   • RegistrationComponent → Register new users with role selection.
   • ComplaintListComponent → View complaints (User) with filtering and search.
   • ComplaintDetailsComponent → Submit/view individual complaint details with attachment preview.
   • ComplaintTimelineComponent → Display complete complaint history with timestamps.
   • StaffDashboardComponent → Manage assigned complaints with workload indicator (Staff).
   • AdminDashboardComponent (Optional) → Assign complaints, view analytics, and performance metrics.
   • FeedbackComponent → Submit rating and feedback after complaint resolution.
   • NotificationCenterComponent → View all notifications in one place.
   • FilterSortComponent → Advanced filtering by date, category, priority, status, staff.
   Suggested Routes
   Path Component Description
   /register RegistrationComponent User registration & role selection
   /complaints ComplaintListComponent View all user complaints with filters
   /complaints/new ComplaintDetailsComponent Submit a new complaint
   /complaints/:id ComplaintTimelineComponent View complaint timeline and history
   /complaints/:id/feedback FeedbackComponent Submit feedback after resolution
   /staff/dashboard StaffDashboardComponent Manage assigned complaints
   /admin/dashboard (optional) AdminDashboardComponent Assign complaints & analytics
   /notifications NotificationCenterComponent View all notifications

---

5. Backend Requirements (Node.js + TypeScript + Express)
   • Use MySQL for persistent storage.
   • Create REST APIs for complaints, users, staff assignment, and notifications.
   • Layered Architecture: Separate controllers, services, repositories, and middlewares.
   • JWT with Refresh Token: Access token (30 min) + Refresh token (7 days).
   • Rate Limiting: Implement on login and complaint submission endpoints.
   • Scheduled Jobs: Check for SLA breaches and send reminders.
   • Include validation and error handling.
   • Admin-related APIs are optional depending on implementation.
   Additional Backend Features
   • WebSocket Support (Optional): Real-time status updates and notifications.
   • Email Service Integration: Send email alerts for status changes.
   • Audit Logging: Log all critical actions (complaint created, status changed, staff assigned).
   • Auto-Assignment Logic: Assign complaints based on staff workload and expertise.
   • File Upload Validation: Restrict file types (JPG, PNG, PDF), size limits, and sanitize filenames.

---

6. Database Structure (MySQL)
   Users Table
   Field Type Description
   id INT (PK) Primary key
   name VARCHAR User name
   email VARCHAR Unique email
   password VARCHAR Hashed password
   role ENUM User / Staff / Admin
   contact_info VARCHAR Phone number
   expertise VARCHAR Staff specialization (nullable)
   is_active BOOLEAN Account status
   created_at TIMESTAMP Creation timestamp
   Complaints Table
   Field Type Description
   id INT (PK) Primary key
   user_id INT (FK) References Users.id
   staff_id INT (FK) Assigned staff (nullable)
   title VARCHAR Complaint title
   description TEXT Detailed description
   category ENUM Plumbing/Electrical/Facility/IT/Other
   priority ENUM Low/Medium/High/Critical
   location VARCHAR Room/Building/Area
   status ENUM Open/Assigned/In-progress/Resolved
   sla_deadline DATETIME Expected resolution time
   is_overdue BOOLEAN SLA breach flag
   attachments TEXT File paths (JSON array)
   created_at TIMESTAMP Creation timestamp
   updated_at TIMESTAMP Last update timestamp
   resolved_at TIMESTAMP Resolution timestamp (nullable)
   Status_History Table (Optional but Recommended)
   Field Type Description
   id INT (PK) Primary key
   complaint_id INT (FK) References Complaints.id
   previous_status ENUM Previous status
   new_status ENUM New status
   updated_by INT (FK) References Users.id
   notes TEXT Status update notes
   timestamp TIMESTAMP Change timestamp
   Feedback Table
   Field Type Description
   id INT (PK) Primary key
   complaint_id INT (FK) References Complaints.id
   rating INT Rating 1-5
   review TEXT Feedback comment
   is_resolved BOOLEAN Issue fully resolved?
   submitted_at TIMESTAMP Submission timestamp
   Notifications Table
   Field Type Description
   id INT (PK) Primary key
   user_id INT (FK) References Users.id
   complaint_id INT (FK) References Complaints.id
   type ENUM Assigned/StatusUpdate/Resolved/Reminder
   message TEXT Notification content
   is_read BOOLEAN Read status
   created_at TIMESTAMP Creation timestamp
   Audit_Logs Table (Optional)
   Field Type Description
   id INT (PK) Primary key
   user_id INT (FK) References Users.id
   action VARCHAR Action performed
   entity_type VARCHAR Complaint/User/Staff
   entity_id INT Related entity ID
   details JSON Additional details
   ip_address VARCHAR User IP
   timestamp TIMESTAMP Action timestamp
   Maximum 4-5 tables with proper relations: Users ↔ Complaints ↔ Status_History ↔ Feedback ↔ Notifications.

---

7. Validation Outline
   • Complaint title, description, and category must not be empty.
   • Priority field is required at complaint creation.
   • Location field should be validated against predefined locations (optional).
   • Status must follow defined flow: Open → Assigned → In-progress → Resolved.
   • Role at registration must be valid: User / Staff / Admin (optional).
   • File uploads: Max size 5MB, allowed types: JPG, PNG, PDF.
   • Rating: Must be between 1-5.
   • SLA deadlines: Automatically calculated based on category.
   • Include all necessary validation to maintain workflow and data integrity.

---

8. Additional Requirements
   • Proper HTTP status codes (200, 201, 400, 401, 403, 404, 500).
   • UI must show meaningful success or error messages with toast notifications.
   • Real-time updates for complaint status using polling (every 30 seconds) or WebSockets (optional).
   • In-app notification system with unread count badge.
   • Email notifications for status changes and SLA reminders.
   • Admin analytics dashboard is optional but recommended.

---

9. Exception Handling
   • Frontend and backend should gracefully handle all errors.
   • UI must show user-friendly error messages using Angular Material Snackbar.
   • Backend should log errors for debugging and maintenance.
   • Global error interceptor in Angular for handling HTTP errors.
   • Try-catch blocks in all backend async operations.
   • Database transaction rollbacks on errors.

---

10. Role-Based Access (Using Angular Guards)
    Use Angular route guards to control access:
    • User: Submit complaints, view status, give feedback.
    • Staff/Technician: View assigned complaints, update status, add notes.
    • Admin (Optional): Assign complaints, view analytics & overall system data, manage users.
    Unauthorized users are redirected to login or a Not Authorized page.
    Guards ensure proper role-based component access and secure workflow.
    Backend RBAC middleware validates role permissions on every protected route.

---

✅ Advanced Feature Enhancements 11. Priority & SLA Management
Implementation:
• Each complaint assigned a priority: Low / Medium / High / Critical.
• Admin or user sets priority at creation.
• SLA deadlines calculated automatically:
o Critical: 4 hours
o High: 12 hours
o Medium: 24 hours
o Low: 48 hours
• Backend scheduled job checks for overdue complaints every hour.
• Overdue complaints highlighted in red on dashboards.
Benefits: Better workflow, faster handling of urgent issues, improved accountability.

---

12. Complaint Timeline & Activity History
    Implementation:
    • Track every action on a complaint:
    o Complaint created
    o Technician assigned
    o Status changed
    o Notes added
    o Attachments uploaded
    o Feedback submitted
    • Display as vertical timeline with timestamps and actor names.
    • Each entry shows "Who did What and When".
    UI Design: Similar to Amazon/Swiggy order tracking with icons and progress lines.
    Benefits: Complete transparency, professional appearance, audit trail.

---

13. Feedback & Rating System
    Implementation:
    • After complaint resolution, user prompted to:
    o Rate service: ★★★★★ (1-5 stars)
    o Provide written feedback
    o Mark if issue was fully resolved
    • Admin dashboard shows:
    o Average rating per staff member
    o Staff performance leaderboard
    o Feedback trends over time
    Benefits: Measure staff performance, identify training needs, improve service quality.

---

14. Advanced Search, Filter & Sort
    Implementation:
    • Search: By complaint ID, title, description, location.
    • Filter: By date range, category, priority, status, assigned staff, overdue status.
    • Sort: By newest/oldest, priority, SLA deadline, pending longest.
    • Save filter presets: Users can save commonly used filter combinations.
    UI: Filter panel with chips showing active filters, clear all option.
    Benefits: Quick complaint discovery, better dashboard usability, time-saving.

---

15. Smart Notification System
    Implementation:
    • In-app notifications: Bell icon with unread count badge.
    • Email notifications: Optional, user can configure preferences.
    • Notification types:
    o Complaint assigned to staff
    o Status updated
    o Resolution completed
    o SLA deadline approaching (2 hours before)
    o SLA breached
    o Feedback requested
    • Mark as read/unread functionality.
    • Notification history page.
    Benefits: Keep all stakeholders informed, reduce response time, improve engagement.

---

16. Attachment Management with Preview
    Implementation:
    • Support multiple file uploads per complaint.
    • File types: Images (JPG, PNG), PDFs, videos (optional).
    • Preview in modal: Click thumbnail to view full image or PDF.
    • Image carousel: Navigate between multiple attachments.
    • Before/After photos: Staff can upload resolution photos.
    • Download option: For all attachment types.
    Benefits: Better issue documentation, visual proof, easier troubleshooting.

---

17. Auto-Assignment Intelligence
    Implementation:
    • Admin enables auto-assignment rules:
    o Assign to staff with least active complaints
    o Assign based on category expertise
    o Round-robin distribution
    o Skip staff on leave/offline
    • Staff profile includes:
    o Specialization tags (Plumbing, Electrical, etc.)
    o Current workload count
    o Availability status
    • Algorithm considers all factors before assignment.
    Benefits: Balanced workload, faster assignment, reduced admin manual work.

---

18. QR Code Generation for Locations
    Implementation:
    • Generate QR codes for common locations (rooms, labs, buildings).
    • Users scan QR code → auto-fills location in complaint form.
    • QR code can also pre-select category based on location type.
    • Admin panel to generate and print QR codes.
    Use Case: Campus hostels, offices, labs, public facilities.
    Benefits: Faster complaint submission, accurate location data, improved UX.

---

19. Analytics & Reporting Dashboard
    Implementation:
    • Admin Dashboard includes:
    o Total complaints by status (pie chart)
    o Category-wise distribution (bar chart)
    o Priority breakdown (donut chart)
    o SLA compliance rate
    o Average resolution time
    o Staff performance comparison
    o Complaint trends over time (line chart)
    o Peak hours/days heatmap
    o Most affected locations
    • Export reports: Download as PDF or Excel.
    • Date range filters: Last 7 days, 30 days, custom range.
    Tools: Angular ApexCharts or Chart.js for visualizations.
    Benefits: Data-driven decisions, identify bottlenecks, track improvements.

---

20. Bulk Operations (Admin)
    Implementation:
    • Select multiple complaints using checkboxes.
    • Bulk actions:
    o Assign to staff
    o Change priority
    o Change status
    o Delete/archive
    o Export selected
    • Confirmation modal before bulk operations.
    Benefits: Save time for admins, efficient complaint management.

---

21. Complaint Duplication Detection
    Implementation:
    • When user submits complaint, system checks for:
    o Similar title (using string matching)
    o Same category + location
    o Timeframe: Last 7 days
    • Show warning: "Similar complaint exists, do you want to proceed?"
    • Option to view existing complaint instead.
    Benefits: Reduce duplicate complaints, cleaner database, better tracking.

---

22. Staff Workload Indicator
    Implementation:
    • Staff dashboard shows:
    o Active complaints count
    o Overdue complaints count
    o Workload status: Light / Moderate / Heavy (color-coded)
    o Today's assignments
    • Admin can see all staff workloads at a glance.
    • Auto-assignment considers workload before assignment.
    Benefits: Fair distribution, prevent staff burnout, visibility into capacity.

---

23. Recurring Complaint Flagging
    Implementation:
    • System detects recurring complaints:
    o Same location + category within 30 days
    o Frequency > 3 times
    • Flag as "Recurring Issue" with special badge.
    • Admin notified to investigate root cause.
    • Separate section for recurring complaints.
    Benefits: Identify systemic problems, proactive maintenance, prevent repeated issues.

---

24. Mobile-First Responsive Design
    Implementation:
    • Fully responsive UI for all screen sizes.
    • Bottom navigation for mobile view.
    • Swipe gestures for complaint cards.
    • Touch-friendly buttons and inputs.
    • Camera integration for photo upload on mobile.
    Benefits: Better mobile experience, accessibility for all devices.

---

25. User Preferences & Settings
    Implementation:
    • User profile settings page:
    o Theme preference (Light/Dark)
    o Notification preferences (Email on/off, types)
    o Default complaint category
    o Language preference (optional)
    o Dashboard layout (Grid/List)
    • Settings stored per user in database.
    Benefits: Personalized experience, user control, improved satisfaction.

---

26. Export & Import Functionality
    Implementation:
    • Export:
    o Export complaints as CSV/Excel
    o Export filtered results
    o Export analytics reports as PDF
    • Import (Admin only):
    o Bulk upload users via CSV
    o Import historical complaints
    o Template download for proper format
    Benefits: Data portability, migration support, reporting flexibility.

---

27. Complaint Escalation System
    Implementation:
    • If complaint not resolved within SLA + grace period:
    o Auto-escalate to senior staff or admin
    o Change priority to Critical
    o Send urgent notification
    o Flag in dashboard as "Escalated"
    • Manual escalation button for users.
    Benefits: Ensures attention to neglected complaints, accountability, SLA enforcement.

---

28. Multi-Language Support (i18n)
    Implementation:
    • Angular internationalization (i18n) for UI text.
    • Support multiple languages: English, Hindi, Spanish (example).
    • Language switcher in navigation bar.
    • User's language preference saved.
    Benefits: Accessibility for diverse users, wider adoption, inclusivity.

---

29. Complaint Categorization with AI Suggestions
    Implementation:
    • User types description in complaint form.
    • Simple keyword-based algorithm suggests:
    o Category (Plumbing, Electrical, etc.)
    o Priority (based on keywords like "urgent", "broken")
    • User can accept or modify suggestion.
    • Backend uses simple string matching initially.
    • Future: Integrate ML model for better accuracy.
    Benefits: Faster form filling, accurate categorization, improved user experience.

---

30. Staff Leave/Availability Management
    Implementation:
    • Staff can mark themselves as:
    o Available
    o On Leave
    o Busy
    • Auto-assignment skips unavailable staff.
    • Admin can view staff availability calendar.
    • Complaints not assigned to staff on leave.
    Benefits: Realistic workload planning, prevents missed assignments, better coordination.

---

31. Commenting System
    Implementation:
    • Users and staff can add comments on complaints.
    • Comment thread displayed chronologically.
    • Comments include:
    o Commenter name and role
    o Timestamp
    o Optional attachments
    • Push notifications when new comment added.
    Benefits: Two-way communication, clarifications, better collaboration.

---

32. Complaint Templates
    Implementation:
    • Frequently reported issues saved as templates.
    • Admin creates templates with:
    o Pre-filled category
    o Standard description
    o Default priority
    • Users select template and customize if needed.
    Example Templates: "Broken AC", "Water leakage", "WiFi not working".
    Benefits: Faster complaint submission, consistency, less typing.

---

33. Dashboard Widgets & Customization
    Implementation:
    • User dashboard with draggable widgets:
    o My active complaints
    o Recent updates
    o Quick submit button
    o Notification feed
    o Statistics
    • Users can show/hide widgets.
    • Save layout preference.
    Benefits: Personalized dashboard, improved UX, quick access to important info.

---

34. Geolocation for Mobile
    Implementation:
    • Mobile users can enable location services.
    • Auto-detect building/area based on GPS coordinates.
    • Pre-fill location in complaint form.
    • Map view showing complaint location (admin).
    Benefits: Accurate location data, faster resolution, useful for large campuses.

---

35. Performance Metrics & Gamification (Staff)
    Implementation:
    • Staff dashboard shows personal metrics:
    o Total complaints resolved
    o Average resolution time
    o Rating score
    o SLA compliance rate
    o Badges earned (Fast Resolver, High Rated, etc.)
    • Leaderboard for friendly competition.
    Benefits: Motivates staff, recognizes top performers, improves service quality.

---

36. Complaint Archival & History
    Implementation:
    • Resolved complaints automatically archived after 90 days.
    • Archived complaints moved to separate view.
    • Users can search archived complaints.
    • Admin can permanently delete archived complaints.
    • Maintains database performance.
    Benefits: Clean active view, historical data preserved, better performance.

---

37. Custom Fields for Complaint Types
    Implementation:
    • Admin configures additional fields per category:
    o Plumbing: Fixture type, Floor number
    o Electrical: Appliance type, Circuit area
    o IT: Software/Hardware, Device ID
    • Dynamic form rendering based on selected category.
    Benefits: Collect relevant information, better categorization, faster resolution.

---

38. Scheduled Maintenance Mode
    Implementation:
    • Admin can enable maintenance mode.
    • Display message: "System under maintenance, will be back at [time]".
    • Restrict all operations except admin access.
    • Countdown timer showing when system will be online.
    Benefits: Inform users during downtime, professional handling of maintenance.

---

39. JWT Refresh Token Implementation
    Implementation:
    • Access token expires in 30 minutes.
    • Refresh token expires in 7 days.
    • Token refresh endpoint.
    • Angular interceptor auto-refreshes token before expiry.
    • Logout clears both tokens.
    Benefits: Enhanced security, better session management, reduced re-login frequency.

---

40. Rate Limiting & Security
    Implementation:
    • Login endpoint: 5 attempts per 15 minutes per IP.
    • Complaint submission: 10 per hour per user.
    • API endpoints protected with rate limiting middleware.
    • Prevent brute force attacks.
    Tools: express-rate-limit package.
    Benefits: DDoS protection, prevent abuse, system stability.

---

📌 Technology Stack (Unchanged)
• Frontend: Angular 16 with Angular Material
• Backend: Node.js with TypeScript and Express
• Database: MySQL
• Authentication: JWT (with refresh tokens)
• File Storage: Local server or cloud integration (AWS S3, Cloudinary)
• Optional: WebSockets for real-time updates
⭐ Recommended Priority for Implementation
Phase 1: Core + Essential

1. Basic CRUD operations
2. Role-based authentication & guards
3. Status tracking with lifecycle
4. Priority & SLA management
5. Notification system (in-app)
6. Feedback & rating system
   Phase 2: User Experience
7. Complaint timeline/history
8. Advanced search, filter, sort
9. Attachment management with preview
10. Dark/Light mode
11. Mobile-responsive design
12. Analytics dashboard
    Phase 3: Intelligence & Automation
13. Auto-assignment logic
14. QR code generation
15. AI category suggestions
16. Recurring complaint detection
17. Escalation system
18. Duplication detection
    Phase 4: Advanced Features
19. Staff workload management
20. Bulk operations
21. Commenting system
22. JWT refresh tokens
23. Audit logging
24. Export/Import functionality
25. Geolocation support
26. Gamification for staff
    🎯 Final Notes
    This enhanced project document transforms your complaint management system from a basic CRUD application to an industry-grade, production-ready portal with features found in enterprise solutions.
    Key Differentiators:
    • SLA tracking and escalation
    • Intelligent auto-assignment
    • Comprehensive analytics
    • Professional timeline UI
    • Multi-stakeholder engagement
    • Performance gamification
    • Security best practices
    Implementing even 60-70% of these features will create an exceptional portfolio project that demonstrates full-stack expertise, system design thinking, and real-world problem-solving skills.
    Digital Complaint Management & Grievance Portal
    Complete System Blueprint & Requirements Document

---

1. PROJECT OVERVIEW
   1.1 Project Title
   Digital Complaint Management & Grievance Portal
   1.2 Project Objective
   Design a scalable, role-based web application where users can raise complaints, track their progress, and provide feedback. Complaints are automatically categorized, prioritized, and assigned to the appropriate department and staff based on predefined logic and performance metrics.
   1.3 Technology Context
   • Frontend: Angular 16 with Angular Material
   • Backend: Node.js with TypeScript and Express
   • Database: MySQL
   • Authentication: JWT with refresh token mechanism
   1.4 Target Users
   • General users (residents, students, employees)
   • Departmental staff and technicians
   • System administrators

---

2. CORE SYSTEM RULES & FOUNDATIONAL LOGIC
   2.1 Authentication & Registration Rules
   2.1.1 Login Page Behavior
   • Login page displays only email and password fields
   • No role selection or role indicator visible
   • System authenticates credentials against Users table
   • After successful authentication:
   o Backend validates user credentials
   o Retrieves user role from database
   o Generates JWT tokens (access + refresh)
   o Returns user profile with role information
   o Frontend stores tokens securely
   o Redirects to appropriate dashboard based on role
   2.1.2 Registration Page Behavior
   • Default Role Assignment: All new registrations are automatically assigned "User" role
   • No Role Selection: Registration form does NOT include role dropdown
   • Registration form collects:
   o Full name (mandatory)
   o Email address (mandatory, unique)
   o Password (mandatory, minimum 8 characters, must include uppercase, lowercase, number)
   o Confirm password (mandatory, must match)
   o Phone number (mandatory, 10 digits)
   o Address/Location (optional)
   o Profile photo (optional)
   • Registration flow:
   o User submits registration form
   o Backend validates all fields
   o Checks email uniqueness
   o Hashes password using bcrypt
   o Creates user record with role = "User"
   o Sends verification email (optional enhancement)
   o Returns success message
   o Redirects to login page
   2.1.3 Role Upgrade Mechanism
   • User to Staff Upgrade:
   o Only Admin can perform role upgrades
   o Admin navigates to User Management screen
   o Selects a user from the list
   o Clicks "Assign Department" button
   o Modal opens with department dropdown
   o Admin selects department (Electricity, Plumbing, Cleaning, IT, Facility, Security, etc.)
   o System automatically:
    Updates user role from "User" to "Staff"
    Assigns selected department_id to user record
    Sets is_active = true for staff
    Records upgrade in audit log
   o User receives notification about role upgrade
   o Upon next login, user sees Staff Dashboard
   • Staff to Admin Upgrade:
   o Admin role is system-controlled
   o Cannot be assigned through UI
   o Requires direct database modification or super-admin action
   o Only existing Admin can create new Admin accounts
   • Role Downgrade:
   o Admin can remove department assignment
   o Automatically reverts Staff to User role
   o All active assignments transferred to other staff
   o Historical data preserved
   2.2 User Role Definitions & Capabilities
   2.2.1 User (Default Role)
   Primary Capabilities:
   • Register and submit complaints
   • View personal complaint history
   • Track complaint status and progress
   • View complaint timeline and activity log
   • Add comments to own complaints
   • Upload additional attachments after complaint creation
   • Receive notifications about status changes
   • Rate and provide feedback after complaint resolution
   • Reopen complaints if issue persists (within 7 days of resolution)
   • Export personal complaint history
   Restrictions:
   • Cannot view other users' complaints
   • Cannot modify complaint after submission (except adding comments/attachments)
   • Cannot change complaint priority or category
   • Cannot assign or reassign complaints
   • No access to analytics or reports
   • No access to user management
   2.2.2 Staff / Technician
   Primary Capabilities:
   • View complaints assigned to them only
   • Filter complaints by status, priority, date
   • Update complaint status (Assigned → In Progress → Resolved)
   • Add resolution notes with timestamps
   • Upload resolution photos/documents
   • Request complaint reassignment if outside expertise
   • View personal performance metrics
   • Respond to user comments
   • Mark complaints as duplicate
   • Escalate complaints to supervisor/admin
   • Set out-of-office status
   • View complaint location on map (if geolocation enabled)
   Restrictions:
   • Can only see complaints assigned to own department
   • Cannot modify complaint priority
   • Cannot reassign complaints to other staff
   • Cannot access user management
   • Cannot view other staff performance metrics
   • Cannot modify department configurations
   • No access to system-wide analytics
   Performance Tracking (Automatic):
   • Total complaints resolved
   • Average resolution time
   • SLA compliance rate
   • Average rating received
   • Number of overdue complaints
   • Response time (assignment to first action)
   • Reopened complaint count
   2.2.3 Admin
   Primary Capabilities:
   • User Management:
   o View all registered users
   o Search and filter users
   o Assign departments to users (User → Staff upgrade)
   o Remove department assignments (Staff → User downgrade)
   o Activate/deactivate user accounts
   o Reset user passwords
   o View user complaint history
   • Staff Management:
   o View all staff members by department
   o Monitor staff workload in real-time
   o View staff performance metrics
   o Reassign staff to different departments
   o Set staff availability status
   o Configure staff expertise tags
   • Department Management:
   o Create, edit, delete departments
   o Set department-wise SLA standards
   o Assign department heads
   o Configure department-specific categories
   • Complaint Management:
   o View all complaints across all departments
   o Filter by department, status, priority, date range, staff
   o Manually reassign complaints
   o Override auto-assignment
   o Bulk reassignment operations
   o Close complaints administratively
   o Delete spam/duplicate complaints
   • Configuration & Rules:
   o Configure auto-priority rules
   o Set SLA timelines per category
   o Define auto-assignment weights
   o Configure notification templates
   o Manage complaint categories and subcategories
   o Set escalation rules
   • Analytics & Reports:
   o System-wide dashboard with KPIs
   o Department-wise performance comparison
   o Staff performance leaderboard
   o Complaint trend analysis
   o SLA compliance reports
   o Category-wise distribution
   o Peak hours/days analysis
   o Export reports as PDF/Excel
   Full System Access:
   • No restrictions on data visibility
   • Can perform all operations
   • Access to audit logs
   • System configuration access

---

3. DASHBOARD DESIGNS (DETAILED SPECIFICATIONS)
   3.1 User Dashboard
   3.1.1 Layout Structure
   Header Section:
   • Profile icon (top-right) with dropdown:
   o My Profile
   o Settings
   o Logout
   • Notification bell icon with unread count badge
   • Application title/logo (top-left)
   • Welcome message: "Welcome, [User Name]"
   Main Content Area: Divided into three sections:
   Section 1: Summary Cards (Horizontal Row) Four cards displaying:
1. Total Complaints Card:
   o Large number showing total complaints registered
   o Icon: Document/clipboard icon
   o Background color: Light blue
1. Open/In Progress Card:
   o Count of complaints with status = Open or In Progress or Assigned
   o Icon: Clock/pending icon
   o Background color: Light orange
   o Click to filter complaints table
1. Resolved Complaints Card:
   o Count of resolved complaints
   o Icon: Checkmark/success icon
   o Background color: Light green
   o Click to filter complaints table
1. Average Resolution Time:
   o Shows average time taken to resolve user's complaints
   o Format: "X days Y hours"
   o Icon: Timer icon
   o Background color: Light purple
   Section 2: Quick Actions Panel
   • Large prominent button: "Register New Complaint" (primary color, elevated)
   • Secondary buttons:
   o "View All Complaints"
   o "Notifications"
   o "Pending Feedback" (shows count if any)
   Section 3: My Complaints Table Table displaying recent complaints with columns:
   • Complaint ID: Unique identifier (e.g., CMP-2025-0001)
   • Title: Truncated to 50 characters with tooltip on hover
   • Category: Badge/chip showing category name with color coding
   • Priority: Badge with color:
   o Critical: Red
   o High: Orange
   o Medium: Yellow
   o Low: Green
   • Status: Badge with color:
   o Open: Gray
   o Assigned: Blue
   o In Progress: Orange
   o Resolved: Green
   • Created Date: Format: "15 Dec 2025, 10:30 AM"
   • Last Updated: Relative time format: "2 hours ago"
   • Assigned To: Staff name (if assigned), otherwise "Pending Assignment"
   • Actions: Icon buttons:
   o View Details (eye icon)
   o Add Comment (chat icon) - if complaint not resolved
   o Give Feedback (star icon) - if complaint resolved and feedback pending
   Table Features:
   • Pagination: 10, 25, 50, 100 records per page
   • Default sort: Most recent first
   • Sortable columns: Created Date, Last Updated, Priority
   • Search box: Real-time filter across Complaint ID, Title, Description
   • Filter dropdowns:
   o Status filter (All, Open, Assigned, In Progress, Resolved)
   o Priority filter (All, Critical, High, Medium, Low)
   o Category filter (All, Electricity, Plumbing, etc.)
   o Date range picker (From - To)
   • "Clear Filters" button
   • Export button: Download filtered results as CSV
   3.1.2 Complaint Detail View
   When user clicks "View Details" on any complaint:
   Modal/Separate Page Layout:
   Header Section:
   • Complaint ID (large, bold)
   • Status badge (current status)
   • Priority badge
   • Created date
   • Back button
   Information Cards:
1. Basic Information Card:
   o Title
   o Category
   o Subcategory (if applicable)
   o Location/Room Number
   o Description (full text)
   o Attachments (thumbnail gallery, click to preview)
1. Assignment Information Card:
   o Assigned To: Staff name with profile photo
   o Department: Department name
   o Assigned Date: Timestamp
   o Expected Resolution: SLA deadline with countdown
   o Status indicator: Visual progress bar (Open → Assigned → In Progress → Resolved)
1. Timeline Section (Vertical Timeline UI): Chronological list of all activities:
   o Complaint registered by [User Name] on [Date Time]
   o Complaint assigned to [Staff Name] on [Date Time]
   o Status changed to "In Progress" by [Staff Name] on [Date Time]
   o [Staff Name] added note: "[Note text]" on [Date Time]
   o Attachment uploaded by [User/Staff Name] on [Date Time]
   o Status changed to "Resolved" by [Staff Name] on [Date Time]
   o Feedback submitted by [User Name] on [Date Time]
   Each entry includes:
   o Actor name and role
   o Action description
   o Timestamp
   o Icon representing action type
1. Comments Section:
   o Conversation thread between user and staff
   o Each comment shows:
    Commenter name and profile photo
    Comment text
    Timestamp
    Attachments (if any)
   o Text box at bottom: "Add a comment..."
   o Attach file button
   o Submit button
   o Comments auto-refresh every 30 seconds
1. Resolution Details (If complaint is resolved):
   o Resolution notes added by staff
   o Resolution date and time
   o Resolution attachments (photos/documents)
   o Time taken to resolve (calculated)
1. Feedback Section (If complaint is resolved and feedback not given):
   o Prominent prompt: "Please rate our service"
   o Star rating selector (1-5 stars)
   o Text area: "Tell us about your experience..."
   o Checkbox: "Was your issue fully resolved?"
   o Submit Feedback button
   Action Buttons (Context-dependent):
   • Add Comment (if complaint not resolved)
   • Upload Attachment
   • Request Reopen (if complaint resolved within 7 days)
   • Print/Download PDF
   • Report Issue (spam/inappropriate)
   3.1.3 Complaint Registration Flow
   Step 1: Complaint Form Page
   Form Fields:
1. Complaint Title (Mandatory):
   o Text input
   o Max length: 100 characters
   o Character counter displayed
   o Validation: Must not be empty
   o Placeholder: "Brief description of the issue"
1. Category Selection (Mandatory):
   o Dropdown with options:
    Electricity
    Plumbing
    Cleaning
    IT/Network
    Facility/Infrastructure
    Security
    Transport
    Other
   o Icon displayed next to each category
   o Validation: Must select one
1. Subcategory Selection (Conditional):
   o Dropdown appears after category selection
   o Options depend on selected category
   o Examples:
    Electricity: Power outage, Faulty wiring, Switch/Socket issue, Light not working, Fan issue
    Plumbing: Water leakage, Drainage block, Tap/Faucet issue, Toilet flush issue, Geyser problem
    IT: Internet not working, Computer hardware, Software issue, Login problem, Network slow
   o Optional field (can select "Other")
1. Location/Room Number (Mandatory):
   o Text input with autocomplete
   o Dropdown showing predefined locations
   o Option to enter manually if not in list
   o Examples: "Room 301", "Building A - Ground Floor", "Lab 2"
   o Validation: Must not be empty
   o Character limit: 100
1. Priority Selection (Conditional):
   o Auto-Priority Categories: When category + subcategory match predefined critical rules:
    Electricity: Power outage → Auto High Priority
    Electricity: Faulty wiring → Auto Critical Priority
    Plumbing: Water leakage → Auto High Priority
    Security: Emergency → Auto Critical Priority
    IT: System down → Auto High Priority
   Behavior when auto-priority triggered:
    Priority dropdown is disabled/grayed out
    Priority badge displayed as read-only
    Tooltip explains: "Priority automatically set based on issue type"
    User cannot override
   o Manual Priority Selection: When category/subcategory does NOT match auto-priority rules:
    Priority dropdown is enabled
    Options: Low, Medium, High
    Default selection: Medium
    User can change before submission
    Help text: "Select priority based on urgency"
1. Detailed Description (Mandatory):
   o Textarea
   o Min length: 20 characters
   o Max length: 1000 characters
   o Character counter displayed
   o Validation: Must provide adequate description
   o Placeholder: "Describe the issue in detail. Include when it started, what you observed, and any other relevant information."
1. Attachments (Optional):
   o File upload component
   o Supports: JPG, PNG, PDF, MP4 (images, documents, videos)
   o Max file size: 5 MB per file
   o Max files: 5 attachments
   o Thumbnail preview for uploaded files
   o Remove button for each file
   o Drag-and-drop support
   o Validation: Check file type and size before upload
1. Contact Information (Pre-filled, Editable):
   o Phone number (from user profile)
   o Email (from user profile, read-only)
   o User can update phone number for this complaint
   Form Validation Rules:
   • Real-time validation as user types
   • Error messages displayed below each field
   • Submit button disabled until all mandatory fields valid
   • Confirmation modal before final submission:
   o "Please review your complaint details"
   o Summary of entered information
   o "Confirm & Submit" button
   o "Go Back & Edit" button
   Step 2: Submission Process
1. User clicks "Submit Complaint"
1. Frontend validates all fields
1. Displays loading spinner on submit button
1. Uploads attachments to server (if any)
1. Sends complaint data to backend API
1. Backend performs:
   o Field validation
   o Duplicate detection (checks for similar complaints in last 7 days)
   o If duplicate found:
    Returns warning with existing complaint ID
    Option to proceed or view existing complaint
   o If not duplicate:
    Creates complaint record with status = "Open"
    Triggers auto-assignment algorithm
    Creates initial timeline entry
    Generates unique Complaint ID
    Sends notification to assigned staff
    Creates notification for user
1. Frontend receives success response
1. Displays success message with Complaint ID
1. Options presented:
   o "View Complaint Details"
   o "Register Another Complaint"
   o "Go to Dashboard"
   Step 3: Post-Submission
   • User redirected to dashboard (default) or complaint detail page
   • Success toast notification: "Complaint registered successfully. ID: CMP-2025-XXXX"
   • Email sent to user with complaint details and tracking link
   3.1.4 Notifications Panel
   Notification Center (Accessed via bell icon):
   • Side drawer or modal opens
   • Header: "Notifications" with unread count
   • Tab options:
   o All
   o Unread
   o Complaint Updates
   o System Alerts
   Notification Card Structure:
   • Icon based on notification type
   • Title: Brief notification message
   • Description: Detailed information
   • Timestamp: Relative time ("2 hours ago")
   • Read/Unread indicator (dot)
   • Click to navigate to relevant page
   • Mark as read button
   • Delete notification button
   Notification Types:
1. Complaint Assigned:
   o "Your complaint #CMP-XXX has been assigned to [Staff Name]"
1. Status Updated:
   o "Complaint #CMP-XXX status changed to In Progress"
1. Resolution Completed:
   o "Complaint #CMP-XXX has been resolved. Please provide feedback."
1. Staff Comment:
   o "[Staff Name] added a comment on complaint #CMP-XXX"
1. SLA Warning:
   o "Complaint #CMP-XXX is approaching deadline"
1. Complaint Reopened:
   o "Complaint #CMP-XXX has been reopened for review"
   Features:
   • Mark all as read button
   • Clear all button
   • Load more (pagination)
   • Real-time updates (polling every 30 seconds or WebSocket)
   3.1.5 User Settings Page
   Profile Section:
   • Profile photo upload
   • Edit name
   • Edit phone number
   • Edit address
   • Change password
   Notification Preferences:
   • Email notifications (on/off toggle)
   • Types of email notifications to receive:
   o Complaint assigned (checkbox)
   o Status updates (checkbox)
   o Resolution completed (checkbox)
   o Staff comments (checkbox)
   • In-app notification sound (on/off toggle)
   Display Preferences:
   • Theme: Light / Dark mode toggle
   • Dashboard layout: Grid / List view
   • Complaints per page: Dropdown (10, 25, 50)
   • Date format preference
   Privacy Settings:
   • Account visibility
   • Data export request
   • Account deletion request

---

3.2 Staff Dashboard
3.2.1 Layout Structure
Header Section:
• Profile dropdown (top-right)
• Notification bell with unread count
• Department badge displaying: "[Department Name] Department"
• Welcome message: "Welcome, [Staff Name]"
• Availability toggle: "Available / Busy / On Leave" (affects auto-assignment)
Main Content Area:
Section 1: Performance Summary Cards
Four metric cards displayed horizontally:

1. Assigned to Me Card:
   o Large number showing currently assigned complaints
   o Breakdown: Open (X), In Progress (Y)
   o Icon: Clipboard with checkmark
   o Background: Light blue
   o Click to filter complaints table
2. Overdue Complaints Card:
   o Count of complaints past SLA deadline
   o Color: Red if count > 0, otherwise gray
   o Icon: Alert/warning icon
   o Background: Light red
   o Urgent indicator (pulsing animation if count > 0)
   o Click to filter overdue complaints
3. Resolved Today Card:
   o Count of complaints resolved today
   o Icon: Checkmark icon
   o Background: Light green
   o Encouragement message if count > 5: "Great work!"
4. My Rating Card:
   o Average rating received from users
   o Star rating display (e.g., 4.5 ★★★★☆)
   o Number of ratings received
   o Icon: Star icon
   o Background: Light gold
   Section 2: Workload Indicator
   Horizontal progress bar showing current workload:
   • Light Workload (1-5 complaints): Green bar
   • Moderate Workload (6-10 complaints): Yellow bar
   • Heavy Workload (11+ complaints): Red bar
   • Text: "Current Workload: [X] active complaints"
   • Percentage bar visual
   Section 3: Quick Actions Panel
   • Button: "View All Assigned Complaints"
   • Button: "Complaints Nearing Deadline" (shows count)
   • Button: "Mark Unavailable" (toggle availability status)
   Section 4: Assigned Complaints Table
   Table displaying all assigned complaints with columns:
   • Complaint ID: Clickable, format: CMP-2025-XXXX
   • User Name: Who registered the complaint
   • Title: Truncated with hover tooltip
   • Category: Badge with icon
   • Priority: Color-coded badge
   o Critical: Red, pulsing animation
   o High: Orange
   o Medium: Yellow
   o Low: Green
   • Status: Current status badge
   o Assigned: Blue
   o In Progress: Orange
   o Resolved: Green (read-only, for reference)
   • Location: Room/area information
   • SLA Deadline: Countdown timer
   o Format: "5h 30m remaining" or "OVERDUE by 2h 15m"
   o Color: Green (safe), Yellow (< 25% time left), Red (overdue)
   • Created Date: Timestamp
   • Actions: Icon buttons
   o View Details (eye icon)
   o Update Status (edit icon)
   o Add Note (document icon)
   Table Features:
   • Default Sort: Priority (Critical first), then SLA deadline (urgent first)
   • Search: Real-time filter across Complaint ID, Title, User Name, Location
   • Filter Options:
   o Status: All, Assigned, In Progress
   o Priority: All, Critical, High, Medium, Low
   o Date Range: Today, This Week, This Month, Custom
   o Overdue: Show only overdue complaints (toggle)
   • Sorting: Click column headers to sort
   • Pagination: 10, 25, 50 records per page
   • Row highlighting: Overdue complaints highlighted in light red
   • Bulk Actions (checkbox selection):
   o Bulk status update (future enhancement)
   o Export selected complaints
   3.2.2 Complaint Detail View (Staff Perspective)
   Modal or Full Page Layout:
   Header Section:
   • Complaint ID (large, bold)
   • Status badge (editable - see below)
   • Priority badge (read-only, color-coded)
   • SLA deadline countdown (prominent if nearing deadline)
   • Back button
   Tab Navigation: Tabs to organize information:
5. Details
6. Timeline
7. Resolution
   Tab 1: Details
   Complaint Information Card:
   • Title
   • Category & Subcategory
   • Priority (with reason if auto-assigned)
   • Location/Room Number
   • Detailed Description
   • Attachments: Gallery view with preview modal
   • User Contact: Name, Phone, Email
   Assignment Information Card:
   • Assigned Date: When complaint was assigned
   • Assigned By: Admin name (if manually assigned) or "Auto-Assigned"
   • Department: Department name
   • Time Since Assignment: "Assigned 3 hours ago"
   Status Update Section (Prominent):
   • Current Status: Large badge display
   • Status Change Dropdown:
   o Options based on current status:
    If Assigned: Change to "In Progress" or "Resolved"
    If In Progress: Change to "Resolved"
   o Workflow validation: Cannot skip states
   o Cannot revert to previous state
   • Status Change Button: "Update Status"
   • Modal appears on status change:
   o Confirmation: "Change status to [New Status]?"
   o Mandatory notes field: "Add notes about this update" (min 10 characters)
   o Optional attachments
   o Confirm button
   o Cancel button
   • After Status Update:
   o Success message
   o Timeline automatically updated
   o User receives notification
   o Dashboard metrics refreshed
   Comments/Communication Section:
   • Thread of comments between staff and user
   • Staff can add internal notes (visible only to other staff/admin)
   • Toggle: "Internal Note" checkbox
   • Each comment shows:
   o Commenter name, role, profile photo
   o Comment text
   o Timestamp
   o Attachments
   o Internal note indicator (if applicable)
   • Add comment text box
   • Attach file button
   • Submit button
   Tab 2: Timeline
   Chronological activity log (read-only):
   • Complaint created by [User Name] on [Date Time]
   • Assigned to [Staff Name] on [Date Time]
   • [Staff Name] viewed complaint on [Date Time]
   • Status changed to "In Progress" by [Staff Name] on [Date Time]
   • [Staff Name] added note: "[Note excerpt]" on [Date Time]
   • [User Name] added comment on [Date Time]
   • Attachment uploaded by [Staff Name] on [Date Time]
   • Status changed to "Resolved" by [Staff Name] on [Date Time]
   Each entry includes:
   • Icon representing action
   • Actor name and role
   • Action description
   • Full timestamp
   • Expandable details (for notes/comments)
   Tab 3: Resolution
   Available when status is "Resolved" or when preparing to resolve:
   Resolution Form (appears when changing status to Resolved):
   • Resolution Notes (Mandatory):
   o Textarea
   o Minimum 50 characters
   o Placeholder: "Describe what was done to resolve the issue, parts replaced, root cause identified, preventive measures taken, etc."
   o Character counter
   • Root Cause (Optional):
   o Dropdown with common causes:
    Equipment failure
    Wear and tear
    Improper usage
    External factors
    Installation defect
    Other (specify)
   • Actions Taken (Optional):
   o Checkboxes for common actions:
    Repaired existing equipment
    Replaced parts/equipment
    Cleaned/maintained
    Configuration change
    User training provided
    Referred to external vendor
    Other (specify)
   • Parts/Materials Used (Optional):
   o Text area to list materials
   o Helpful for inventory tracking
   • Resolution Attachments (Optional):
   o Upload before/after photos
   o Upload receipts or documentation
   o Max 5 files, 5 MB each
   • Time Spent (Optional):
   o Input hours and minutes spent on resolution
   o Helps calculate staff productivity
   • Follow-up Required (Optional):
   o Checkbox: "This issue requires follow-up"
   o Follow-up date picker
   o Follow-up notes
   Submit Resolution Button:
   • Validates all mandatory fields
   • Changes status to "Resolved"
   • Records resolution timestamp
   • Sends notification to user
   • Prompts user for feedback
   • Updates staff performance metrics
   After Resolution:
   • Complaint moves to resolved section
   • User can provide feedback
   • Staff performance metrics updated
   • Complaint removed from active workload
   3.2.3 Staff Performance Metrics Page
   Personal Dashboard showing:
   Summary Cards:
8. Total Resolved: Count of all resolved complaints
9. Average Resolution Time: Time from assignment to resolution
10. SLA Compliance: Percentage of complaints resolved within SLA
11. Average Rating: Star rating from user feedback
    Charts & Graphs:
12. Resolution Trend (Line Chart):
    o X-axis: Last 30 days
    o Y-axis: Number of complaints resolved
    o Visual trend of productivity
13. Category Distribution (Pie Chart):
    o Shows which categories staff resolves most
    o Helps identify expertise areas
14. Priority Handling (Bar Chart):
    o Breakdown by priority level
    o Shows how many Critical/High/Medium/Low resolved
15. Response Time Analysis:
    o Average time to first action after assignment
    o Target: Within 1 hour for Critical, 4 hours for others
    Badges/Achievements Section (Gamification):
    • Fast Resolver: Resolved 10 complaints in one day
    • High Rated: Maintained 4.5+ rating for 30 days
    • SLA Champion: 100% SLA compliance for a month
    • Problem Solver: Resolved 100 total complaints
    • Expert: Highest rating in department
    Leaderboard (Optional):
    • Department-wise ranking (anonymous or named)
    • Current position
    • Top 5 performers
    3.2.4 Staff Settings
    Profile Section:
    • Profile photo
    • Edit phone number
    • Set expertise tags (for better auto-assignment)
    Availability Settings:
    • Current status: Available / Busy / On Leave
    • Schedule unavailability:
    o From date/time
    o To date/time
    o Reason (optional)
    • Affects auto-assignment algorithm
    Notification Preferences:
    • New assignment alerts
    • Comment notifications
    • SLA deadline warnings
    • Email notification toggle

---

3.3 Admin Dashboard
3.3.1 Sidebar Navigation Structure
Sidebar Menu Items (Vertical, collapsible):

1. Dashboard (Icon: Home/Grid)
   o Link: /admin/dashboard
   o Default landing page
2. Complaint Management (Icon: Document/Clipboard)
   o Submenu:
    All Complaints
    By Department
    Overdue Complaints
    Unassigned Complaints
    Resolved Complaints
    Archived Complaints
3. User Management (Icon: Users/People)
   o Submenu:
    All Users
    Active Users
    Inactive Users
    Add New User (manual admin creation)
4. Staff Management (Icon: Badge/ID Card)
   o Submenu:
    All Staff
    By Department
    Staff Performance
    Workload Distribution
    Assign Department
5. Department Management (Icon: Building/Organization)
   o Submenu:
    View All Departments
    Add Department
    Edit Departments
    Department Settings
6. Analytics & Reports (Icon: Chart/Graph)
   o Submenu:
    Overview Dashboard
    Department Performance
    Staff Performance
    Complaint Trends
    SLA Compliance Report
    Category Analysis
    User Satisfaction Report
    Custom Reports
7. System Configuration (Icon: Settings/Gear)
   o Submenu:
    Auto-Priority Rules
    SLA Settings
    Auto-Assignment Configuration
    Category Management
    Notification Templates
    System Parameters
8. Audit Logs (Icon: File/List)
   o Link: /admin/audit-logs
   o View all system actions
9. Profile (Icon: User)
   o Link: /admin/profile
   o Admin profile settings
10. Logout (Icon: Exit/Logout)
    Sidebar Features:
    • Collapsible for more screen space
    • Active menu item highlighted
    • Tooltip on hover (when collapsed)
    • Badge showing count of unassigned complaints
    • Badge showing overdue complaints count
    3.3.2 Admin Dashboard - Overview Page
    Header Section:
    • Welcome message: "Admin Dashboard"
    • Date and time display
    • Quick action buttons:
    o "Assign Unassigned Complaints" (shows count)
    o "View Overdue" (shows count)
    o "System Health" (shows status indicator)
    Section 1: KPI Cards (4 columns)
11. Total Complaints Card:
    o Large number: Total complaints in system
    o Sub-text: "All time"
    o Trend indicator: "+5% from last month"
    o Icon: Document icon
    o Background: Blue gradient
12. Active Complaints Card:
    o Count of Open + Assigned + In Progress
    o Sub-text: "Currently active"
    o Breakdown tooltip on hover
    o Icon: Clock icon
    o Background: Orange gradient
13. Resolution Rate Card:
    o Percentage: (Resolved / Total) × 100
    Sub-text : "This month"
    • Comparison with last month
    • Icon: Checkmark icon
    • Background: Green gradient
14. Average Resolution Time Card:
    o Time in days/hours
    o Sub-text: "Across all departments"
    o Trend indicator
    o Icon: Timer icon
    o Background: Purple gradient
    Section 2: Quick Stats (3 columns)
15. Department Workload:
    o Horizontal bar chart
    o Each department with active complaint count
    o Color-coded by workload level
    o Click to view department details
16. Priority Distribution:
    o Donut chart
    o Critical, High, Medium, Low
    o Count and percentage for each
17. SLA Compliance:
    o Gauge chart or circular progress
    o Percentage of complaints resolved within SLA
    o Target line at 90%
    o Color: Green (>90%), Yellow (75-90%), Red (<75%)
    Section 3: Charts & Visualizations
    Row 1: Two Charts Side-by-Side
18. Complaint Trend Analysis (Line Chart):
    o X-axis: Last 30 days
    o Y-axis: Number of complaints
    o Multiple lines:
     Complaints registered (blue)
     Complaints resolved (green)
     Active complaints (orange)
    o Interactive tooltip on hover
    o Date range selector: 7 days, 30 days, 90 days, Custom
19. Category-wise Distribution (Bar Chart):
    o X-axis: Categories (Electricity, Plumbing, IT, etc.)
    o Y-axis: Complaint count
    o Grouped bars showing: Open, In Progress, Resolved
    o Color-coded
    o Click bar to drill down
    Row 2: Two Charts Side-by-Side
20. Staff Performance Comparison (Horizontal Bar Chart):
    o Top 10 staff by resolution count
    o Color-coded by rating (green for high, yellow for medium, red for low)
    o Shows name, department, count
    o Click to view staff details
21. Peak Hours Heatmap:
    o X-axis: Days of week (Mon-Sun)
    o Y-axis: Hours of day (0-23)
    o Cell color intensity: Number of complaints registered
    o Helps identify busy times for resource planning
    Section 4: Recent Activity Feed
    Scrollable list showing recent actions:
    • [User Name] registered complaint #CMP-XXX - 5 minutes ago
    • [Staff Name] resolved complaint #CMP-YYY - 10 minutes ago
    • [Admin Name] assigned complaint #CMP-ZZZ to [Staff Name] - 15 minutes ago
    • [User Name] provided 5-star feedback for #CMP-AAA - 20 minutes ago
    Features:
    • Real-time updates
    • Load more button
    • Filter by action type
    Section 5: Alerts & Notifications
    Panel showing system alerts:
    • X complaints are overdue
    • Y complaints unassigned for >2 hours
    • Z staff members are on leave today
    • Low performance alert: [Staff Name] has rating below 3.0
    • SLA breach: [Department] has 60% compliance this week
    Each alert clickable to navigate to relevant page.
    3.3.3 User Management Screen
    Page Layout:
    Header:
    • Title: "User Management"
    • Search bar: Search by name, email, phone
    • Filter dropdowns:
    o Role: All, User, Staff
    o Status: All, Active, Inactive
    o Department: All, [List of departments] (for staff)
    • "Add User" button (for manual admin-created accounts)
    Users Table:
    Columns:
    • Profile Photo: Thumbnail
    • Name: Full name, clickable to view details
    • Email: Email address
    • Phone: Contact number
    • Role: Badge (User / Staff / Admin)
    • Department: Department name (if Staff), otherwise "N/A"
    • Registered Date: Signup date
    • Status: Active / Inactive toggle
    • Total Complaints: Count of complaints registered
    • Actions: Dropdown menu:
    o View Details
    o Assign Department (if User role)
    o Change Department (if Staff role)
    o Remove Department (reverts Staff to User)
    o Deactivate/Activate Account
    o Reset Password
    o View Complaint History
    o Delete User (with confirmation)
    Table Features:
    • Sortable columns
    • Pagination
    • Export to CSV/Excel
    • Bulk actions (select multiple):
    o Bulk activate/deactivate
    o Bulk export
    User Detail Modal (Click on name):
    Shows detailed information:
    • Profile section:
    o Photo
    o Full name
    o Email
    o Phone
    o Address
    o Registration date
    o Last login
    • Role & Department:
    o Current role
    o Department (if staff)
    o Change role button (Opens department assignment modal)
    • Statistics:
    o Total complaints registered
    o Resolved complaints
    o Pending complaints
    o Average rating given (if staff)
    • Complaint history table:
    o List of all complaints
    o Quick filters
    o Link to view each complaint
    • Activity log:
    o Recent actions performed
    Assign Department Flow:
22. Admin clicks "Assign Department" on a User
23. Modal opens: "Assign Department to [User Name]"
24. Dropdown: Select Department
25. Optional: Set expertise tags (checkboxes)
26. Optional: Initial notes
27. Confirm button
28. System automatically:
    o Changes role from User to Staff
    o Assigns selected department
    o Creates audit log entry
    o Sends notification to user
    o Updates user record
29. Success message displayed
30. User table refreshes showing updated role
    Remove Department Flow:
31. Admin clicks "Remove Department" on Staff
32. Confirmation modal: "This will revert [Staff Name] to User role. Any active assignments will be reassigned. Continue?"
33. Confirm/Cancel buttons
34. If confirmed:
    o System changes role from Staff to User
    o Removes department assignment
    o Reassigns active complaints to other staff
    o Creates audit log entry
    o Sends notification to affected user
35. Success message
36. Table refreshes
    3.3.4 Staff Management Screen
    Page Layout:
    Header:
    • Title: "Staff Management"
    • Search bar: Search by name, department
    • Filter dropdowns:
    o Department: All, [List of departments]
    o Availability: All, Available, Busy, On Leave
    o Workload: All, Light, Moderate, Heavy
    • Sort options:
    o By Name
    o By Department
    o By Rating (High to Low)
    o By Workload
    Staff Cards/Table View (Toggle between views):
    Card View (Grid layout):
    Each card shows:
    • Profile photo
    • Name
    • Department badge
    • Current status: Available / Busy / On Leave (colored dot)
    • Workload indicator: Progress bar with count
    • Rating: Star rating display
    • Statistics:
    o Active complaints: X
    o Resolved this month: Y
    o Average resolution time: Z hours
    • Quick actions:
    o View Details
    o View Assigned Complaints
    o Change Department
    o View Performance
    Table View:
    Columns:
    • Profile Photo
    • Name
    • Department
    • Availability Status
    • Active Complaints
    • Overdue Complaints
    • Rating
    • SLA Compliance %
    • Total Resolved
    • Actions (dropdown)
    Workload Distribution Panel (Above table):
    Visual representation of staff workload:
    • Department-wise grouping
    • Each staff shown as a bar or card
    • Color-coded by workload level
    • Helps identify imbalanced distribution
    • Admin can manually reassign to balance
    Staff Detail View (Click on staff member):
    Modal or Full Page:
    Section 1: Profile & Status
    • Profile photo (large)
    • Name
    • Department badge
    • Contact information
    • Availability status with toggle
    • Expertise tags
    Section 2: Current Assignments
    • Table of currently assigned complaints
    • Filters and sorting
    • Quick status view
    • Option to reassign specific complaints
    Section 3: Performance Metrics Dashboard showing:
    • Total complaints resolved
    • Average resolution time
    • SLA compliance rate
    • Average rating received
    • Response time
    • Comparison with department average
    Section 4: Performance Charts
    • Resolution trend (last 30 days)
    • Category-wise distribution
    • Rating history
    Section 5: Recent Feedback
    • List of recent feedback from users
    • Ratings and comments
    • Helps identify improvement areas
    Actions Available:
    • Change Department
    • View Full Performance Report
    • Export Performance Data
    • Send Message (future enhancement)
    • Manage Availability Schedule
    Change Department Flow:
37. Admin clicks "Change Department"
38. Modal opens
39. Current department displayed (read-only)
40. Dropdown: Select new department
41. Checkbox: "Reassign active complaints to other staff"
42. Notes field (optional)
43. Confirm button
44. System:
    o Updates staff record
    o Reassigns complaints if checkbox selected
    o Updates auto-assignment algorithm data
    o Creates audit log
    o Notifies staff member
45. Success message
    3.3.5 Department Management Screen
    Page Layout:
    Header:
    • Title: "Department Management"
    • "Add New Department" button
    Department Cards (Grid layout):
    Each card shows:
    • Department icon/image
    • Department name
    • Total staff count
    • Active complaints count
    • Average SLA compliance
    • Average resolution time
    • Quick actions:
    o Edit Department
    o View Staff
    o View Complaints
    o Configure Settings
    Add/Edit Department Modal:
    Fields:
46. Department Name (mandatory)
47. Department Code (e.g., ELEC, PLMB) - unique
48. Description
49. Department icon (upload)
50. Department head (select from staff dropdown)
51. Contact email
52. Contact phone
53. Active status toggle
    SLA Configuration Section: For each category/subcategory linked to this department:
    • Category name
    • Default SLA time (hours)
    • Critical priority SLA (hours)
    • High priority SLA (hours)
    • Medium priority SLA (hours)
    • Low priority SLA (hours)
    Auto-Assignment Settings:
    • Enable/disable auto-assignment for this department
    • Assignment algorithm preference:
    o Round-robin
    o Least workload
    o Performance-based
    o Expertise-based
    o Weighted (custom)
    Save button
    Department Detail View:
    Full page showing:
    • Department information
    • Staff list (with filters)
    • Active complaints
    • Performance metrics
    • Charts and analytics
    • Configuration options
    3.3.6 Complaint Management Screen (Admin)
    Page Layout:
    Header:
    • Title: "All Complaints"
    • Advanced search bar
    • Multiple filter panels
    Filter Panel (Collapsible sidebar):
    Filters:
    • Status: Multi-select checkboxes (Open, Assigned, In Progress, Resolved)
    • Priority: Multi-select (Critical, High, Medium, Low)
    • Category: Multi-select dropdown
    • Department: Multi-select dropdown
    • Assigned Staff: Searchable dropdown
    • Date Range: From-To date picker
    • SLA Status: On-time / Overdue / Approaching deadline
    • Feedback Status: Feedback given / Pending feedback
    • User: Search by user name/email
    Quick Filter Chips (Above table):
    • Unassigned Complaints (X)
    • Overdue Complaints (Y)
    • Critical Priority (Z)
    • Feedback Pending (A)
    • Click chip to apply filter
    Complaints Table:
    Columns:
    • Checkbox (for bulk selection)
    • Complaint ID (clickable)
    • User Name
    • Category
    • Department
    • Priority (color-coded badge)
    • Status (color-coded badge)
    • Assigned To (staff name or "Unassigned")
    • Location
    • SLA Status: Countdown or "OVERDUE"
    • Created Date
    • Last Updated
    • Actions (dropdown):
    o View Details
    o Reassign
    o Change Priority (override)
    o Close
    o Delete (with confirmation)
    o Add Admin Note
    Table Features:
    • Sortable columns
    • Pagination with configurable page size
    • Export filtered results (CSV, Excel, PDF)
    • Column visibility toggle
    • Save filter presets
    • Real-time updates
    Bulk Actions (When complaints selected):
    • Bulk reassign
    • Bulk change priority
    • Bulk close
    • Bulk export
    • Send bulk notification
    Complaint Detail View (Admin Perspective):
    Similar to staff view, but with additional capabilities:
    Additional Admin Actions:
    • Manually reassign to any staff
    • Override priority
    • Override SLA deadline
    • Close complaint administratively
    • Add admin-only notes
    • View complete audit trail
    • Delete complaint (with reason)
    Manual Reassignment Modal:
54. Current assignment shown (if any)
55. Department dropdown (change department if needed)
56. Staff dropdown (filtered by selected department)
    o Shows each staff member with:
     Name
     Current workload
     Availability status
     Rating
     Expertise match indicator
57. Reason for reassignment (text field)
58. Notify staff checkbox (default: checked)
59. Notify user checkbox (default: unchecked)
60. Confirm Reassignment button
    System performs:
    • Updates complaint record
    • Removes from previous staff (if assigned)
    • Assigns to new staff
    • Creates timeline entry
    • Sends notifications
    • Updates workload counters
    • Logs action in audit trail
    3.3.7 Analytics & Reports Screen
    Page Layout:
    Tab Navigation:
61. Overview Dashboard
62. Department Performance
63. Staff Performance
64. Complaint Trends
65. SLA Analysis
66. User Satisfaction
67. Custom Reports
    Tab 1: Overview Dashboard
    Comprehensive view with multiple sections:
    Section 1: Summary Metrics (Cards)
    • Total complaints (all time)
    • Total users
    • Total staff
    • Total departments
    • Resolution rate
    • Average resolution time
    • SLA compliance
    • Average user rating
    Section 2: Time-based Analysis
    • Date range selector
    • Comparison with previous period
    • Trend indicators (up/down arrows with percentages)
    Section 3: Charts
68. Complaints Over Time (Line chart with multiple series)
69. Resolution Rate Trend (Line chart)
70. Category Distribution (Pie chart)
71. Department Comparison (Bar chart)
72. Priority Distribution (Donut chart)
73. Status Breakdown (Stacked bar chart)
    Export Options:
    • Export dashboard as PDF
    • Schedule automated reports (daily, weekly, monthly)
    • Email reports to stakeholders
    Tab 2: Department Performance
    Department Comparison Table:
    Columns:
    • Department Name
    • Total Complaints
    • Active Complaints
    • Resolved Complaints
    • Average Resolution Time
    • SLA Compliance %
    • Staff Count
    • Avg Complaints per Staff
    • User Rating
    • Overdue Count
    Sortable and filterable
    Visualizations:
    • Bar chart: Resolution time comparison
    • Grouped bar chart: Complaints by status per department
    • Radar chart: Multi-metric department comparison
    • Heatmap: Department activity by time of day/week
    Department Drill-down: Click any department to view:
    • Department-specific dashboard
    • Staff performance within department
    • Complaint distribution by category
    • Time-series trends
    • Top issues
    Tab 3: Staff Performance
    Staff Leaderboard Table:
    Columns:
    • Rank
    • Staff Name
    • Department
    • Complaints Resolved
    • Average Resolution Time
    • SLA Compliance %
    • Average Rating
    • Response Time
    • Overdue Count
    • Status (Active/Inactive)
    Performance Brackets:
    • Excellent: Rating 4.5+, SLA 95%+
    • Good: Rating 4.0-4.5, SLA 85-95%
    • Average: Rating 3.5-4.0, SLA 75-85%
    • Needs Improvement: Below average
    Color-coded rows based on bracket
    Filters:
    • By department
    • By performance bracket
    • By date range
    • By minimum complaints handled
    Visualizations:
    • Scatter plot: Resolution time vs Rating
    • Distribution chart: Staff by performance bracket
    • Comparison chart: Top performers vs bottom performers
    • Activity heatmap: Staff activity patterns
    Export Options:
    • Individual staff reports
    • Department-wise staff summary
    • Performance improvement recommendations
    Tab 4: Complaint Trends
    Trend Analysis Tools:
    Time-based Trends:
    • Daily complaint volume
    • Weekly patterns
    • Monthly trends
    • Year-over-year comparison
    • Seasonal analysis
    Category Trends:
    • Rising categories (trending up)
    • Declining categories (trending down)
    • Stable categories
    • Emerging issues (new categories)
    Location-based Trends:
    • Most affected locations
    • Complaints by building/area
    • Geographic distribution map (if applicable)
    Visualizations:
    • Multi-line time series chart
    • Area chart for cumulative trends
    • Bubble chart: Category vs Priority vs Volume
    • Treemap: Hierarchical category view
    • Trend prediction chart (simple forecasting)
    Insights Panel: Automatically generated insights:
    • "Electricity complaints increased 25% this month"
    • "Plumbing issues peak on Mondays"
    • "Location 'Building A' has 3x more complaints than average"
    • "Critical priority complaints decreased by 15%"
    Tab 5: SLA Analysis
    SLA Compliance Dashboard:
    Overall Metrics:
    • Total SLA compliance rate
    • On-time resolutions
    • Overdue resolutions
    • Average SLA breach time
    By Category: Table showing SLA compliance per category:
    • Category name
    • SLA target (hours)
    • Complaints handled
    • On-time count
    • Overdue count
    • Compliance %
    • Average resolution time
    • Worst case (longest resolution)
    • Best case (fastest resolution)
    By Department: Similar table grouped by department
    By Priority: Compliance rates for Critical, High, Medium, Low
    Visualizations:
    • Gauge charts: Compliance rates
    • Waterfall chart: SLA performance breakdown
    • Timeline chart: SLA breaches over time
    • Box plot: Resolution time distribution
    SLA Breach Analysis:
    • List of complaints that breached SLA
    • Reasons for breach (if recorded)
    • Patterns in breaches
    • Recommendations for improvement
    Tab 6: User Satisfaction
    Satisfaction Metrics:
    Overall Rating:
    • Average rating (star display)
    • Total feedback count
    • Rating distribution (5-star: X%, 4-star: Y%, etc.)
    • Trend over time
    Feedback Analysis:
    Table showing feedback entries:
    • Complaint ID
    • User name
    • Category
    • Staff member
    • Rating (stars)
    • Feedback text
    • Issue resolved? (Yes/No)
    • Date
    Sentiment Analysis (Optional enhancement):
    • Positive feedback count
    • Negative feedback count
    • Neutral feedback count
    • Common keywords in feedback
    Visualizations:
    • Bar chart: Rating distribution
    • Line chart: Average rating trend
    • Grouped chart: Rating by department
    • Grouped chart: Rating by staff
    • Word cloud: Common feedback terms
    Low-Rating Alerts:
    • Complaints with rating < 3 stars
    • Staff members with average rating < 3.5
    • Departments with declining ratings
    • Action items for improvement
    Tab 7: Custom Reports
    Report Builder Interface:
    Step 1: Select Report Type
    • Complaint Summary Report
    • Staff Performance Report
    • Department Analysis Report
    • SLA Compliance Report
    • User Activity Report
    • Category-wise Report
    • Time-based Report
    • Custom Query Report
    Step 2: Configure Parameters
    • Date range
    • Departments (multi-select)
    • Staff members (multi-select)
    • Categories (multi-select)
    • Priorities (multi-select)
    • Status (multi-select)
    • Additional filters
    Step 3: Select Metrics Checkboxes for metrics to include:
    • Total complaints
    • Resolution rate
    • Average resolution time
    • SLA compliance
    • Ratings
    • Response time
    • Overdue count
    • Custom calculations
    Step 4: Choose Visualizations
    • Table
    • Charts (select types)
    • Graphs
    • Summary cards
    Step 5: Output Format
    • View online
    • Export as PDF
    • Export as Excel
    • Export as CSV
    • Schedule automated report
    Save Report Template:
    • Name the report
    • Save for future use
    • Share with other admins
    Saved Reports Library:
    • List of previously created reports
    • Quick access to run again
    • Edit/delete saved reports
    3.3.8 System Configuration Screen
    Page Layout with Tabs:
    Tab 1: Auto-Priority Rules
    Current Rules Table:
    Columns:
    • Rule ID
    • Category
    • Subcategory
    • Condition
    • Auto-Priority (Critical/High/Medium/Low)
    • Status (Active/Inactive)
    • Actions (Edit/Delete)
    Add Rule Button opens modal:
    Rule Configuration:
74. Category dropdown
75. Subcategory dropdown (multi-select or "All")
76. Additional conditions (optional):
    o Keyword in description (text input)
    o Location matches (text input)
    o Time of day (time range)
77. Set Priority: Dropdown (Critical/High/Medium/Low)
78. Lock Priority: Checkbox (if checked, user cannot override)
79. Rule Name: Text input
80. Description: Why this rule exists
81. Active: Toggle (enable/disable rule)
    Save Rule button
    Rule Priority (if multiple rules match):
    • Rules evaluated in order
    • Drag-and-drop to reorder rules
    • First matching rule applies
    Tab 2: SLA Settings
    SLA Configuration by Category:
    Table showing:
    • Category
    • Subcategory
    • Critical SLA (hours)
    • High SLA (hours)
    • Medium SLA (hours)
    • Low SLA (hours)
    • Actions (Edit)
    Edit SLA Modal:
    • Input fields for each priority level
    • Warning threshold (% of SLA before alert)
    • Escalation rules (if SLA breached)
    • Save button
    Global SLA Settings:
    • Default SLA for new categories
    • Buffer time (grace period before marking overdue)
    • Weekend/holiday handling
    • Business hours configuration
    Tab 3: Auto-Assignment Configuration
    Assignment Algorithm Selection:
    • Radio buttons:
    o Round-robin
    o Least workload
    o Performance-based
    o Expertise-based
    o Weighted scoring (custom)
    Weighted Scoring Configuration (if selected):
    Sliders to adjust weights:
    • Staff rating (0-100%)
    • Number of resolved complaints (0-100%)
    • Average resolution time (0-100%)
    • Current open tickets (0-100%)
    • SLA compliance rate (0-100%)
    • Expertise match (0-100%)
    Total must equal 100%
    Additional Rules:
    • Skip staff on leave (toggle)
    • Skip staff with heavy workload (toggle)
    • Maximum complaints per staff (number input)
    • Reassignment logic if staff unavailable
    Expertise Matching:
    • Define expertise tags
    • Map categories to required expertise
    • Weight for expertise match
    Test Assignment button:
    • Simulate assignment with current settings
    • Shows which staff would be assigned for different scenarios
    Tab 4: Category Management
    Categories List:
    Table:
    • Category Name
    • Department (mapped to)
    • Subcategories (count)
    • Active Complaints
    • Icon
    • Status (Active/Inactive)
    • Actions (Edit/Delete)
    Add Category button opens modal:
    • Category name
    • Department mapping
    • Icon selection
    • Description
    • SLA defaults
    • Active status toggle
    Edit Category shows:
    • Basic info (editable)
    • Subcategories list with add/edit/delete
    • Auto-priority rules linked to this category
    • Complaints history
    Subcategory Management:
    • Add/Edit/Delete subcategories within category
    • Map subcategories to specific staff expertise
    Tab 5: Notification Templates
    Template Types:
    • Complaint Assigned (to staff)
    • Status Updated (to user)
    • Complaint Resolved (to user)
    • Feedback Request (to user)
    • SLA Warning (to staff and admin)
    • SLA Breach (to admin)
    • Assignment Changed (to old/new staff)
    • Comment Added (to user/staff)
    Each template shows:
    • Email subject line (editable)
    • Email body (rich text editor)
    • In-app notification message (editable)
    • Available placeholders:
    o {user_name}
    o {staff_name}
    o {complaint_id}
    o {category}
    o {status}
    o {priority}
    o {sla_deadline}
    o {location}
    o {resolution_notes}
    o etc.
    Preview button to see how notification looks
    Reset to Default button
    Save Template button
    Tab 6: System Parameters
    General Settings:
    • System name
    • Support email
    • Support phone
    • Working hours (from-to)
    • Working days (checkboxes: Mon-Sun)
    • Time zone
    • Date format
    • Language (future enhancement)
    Complaint Settings:
    • Auto-assignment enabled (toggle)
    • Duplicate detection enabled (toggle)
    • Duplicate detection threshold (days)
    • Max attachments per complaint (number)
    • Max attachment size (MB)
    • Allowed file types (multi-select)
    • Comment editing allowed (toggle)
    • Reopen allowed (toggle)
    • Reopen window (days)
    User Settings:
    • Self-registration enabled (toggle)
    • Email verification required (toggle)
    • Password policy (complexity rules)
    • Session timeout (minutes)
    • Max login attempts
    Notification Settings:
    • Email notifications enabled (toggle)
    • SMS notifications enabled (toggle, future)
    • Push notifications enabled (toggle, future)
    • Notification frequency (immediate, batched)
    Performance Settings:
    • Records per page (default)
    • Dashboard refresh interval (seconds)
    • Report cache duration (minutes)
    Maintenance Settings:
    • Maintenance mode (toggle)
    • Maintenance message (text)
    • Archive resolved complaints after (days)
    • Delete archived complaints after (days)
    • Backup frequency (dropdown)
    Save All Settings button
    3.3.9 Audit Logs Screen
    Page Layout:
    Header:
    • Title: "Audit Logs"
    • Description: "Complete system activity trail"
    • Export logs button
    Filter Panel:
    Filters:
    • Date range (from-to)
    • Action type: Multi-select dropdown
    o User Created
    o User Updated
    o Role Changed
    o Department Assigned
    o Complaint Created
    o Complaint Assigned
    o Status Changed
    o Priority Changed
    o Complaint Resolved
    o Feedback Submitted
    o Configuration Changed
    o Staff Added/Removed
    o Department Created/Modified
    o Rule Added/Modified
    o Login/Logout
    o Password Changed
    o System Configuration Changed
    • Actor: Searchable dropdown (user/staff/admin who performed action)
    • Target Entity: Dropdown (User, Complaint, Department, Staff, System)
    • Entity ID: Text input (specific record ID)
    Audit Log Table:
    Columns:
    • Timestamp (Date and exact time)
    • Actor (Name and role of person who performed action)
    • Action (What was done)
    • Entity Type (User, Complaint, Department, etc.)
    • Entity ID (ID of affected record)
    • Details (Brief description, expandable)
    • IP Address
    • Status (Success/Failed)
    • Actions (View Full Details)
    Table Features:
    • Sortable by timestamp
    • Pagination
    • Real-time updates (new logs appear automatically)
    • Search across all fields
    • Export filtered logs
    Log Detail Modal (Click "View Full Details"):
    Shows complete information:
    • Full timestamp
    • Actor details (name, role, email)
    • Action performed
    • Target entity information
    • Before state (JSON/formatted)
    • After state (JSON/formatted)
    • Change summary (what exactly changed)
    • IP address
    • User agent (browser/device info)
    • Session ID
    • Request details (API endpoint, method)
    • Response status
    • Additional metadata
    Close button
    Export Audit Logs:
    • Select date range
    • Select format (CSV, Excel, PDF)
    • Option to include/exclude certain fields
    • Download button

---

4. PRIORITY MANAGEMENT SYSTEM (DETAILED)
   4.1 Priority Levels Definition
   Four Priority Levels:
1. Critical:
   o Response Time: 1-2 hours
   o Resolution SLA: 4-6 hours
   o Visual: Red badge, highest prominence
   o Notifications: Immediate, repeated alerts
   o Assignment: Best available staff immediately
   o Examples:
    Electrical short circuit/fire hazard
    Major water leakage affecting multiple areas
    Complete power outage in building
    Security emergency
    Server/system down (IT)
1. High:
   o Response Time: 2-4 hours
   o Resolution SLA: 12-24 hours
   o Visual: Orange badge
   o Notifications: Immediate notification
   o Assignment: Next available skilled staff
   o Examples:
    Partial power outage (single floor/room)
    Drainage blockage
    AC/Heating failure
    Network connectivity issues
    Elevator malfunction
1. Medium:
   o Response Time: 4-8 hours
   o Resolution SLA: 24-48 hours
   o Visual: Yellow badge
   o Notifications: Standard notification
   o Assignment: Normal queue
   o Examples:
    Light fixture not working
    Minor plumbing issues (slow drain)
    Painting/cosmetic repairs
    Furniture repair
    Software installation requests
1. Low:
   o Response Time: 24 hours
   o Resolution SLA: 48-72 hours
   o Visual: Green badge
   o Notifications: Digest notifications
   o Assignment: As capacity allows
   o Examples:
    General maintenance requests
    Cleanliness concerns
    Suggestions/improvements
    Non-urgent cosmetic issues
    Information requests
   4.2 Auto-Priority Rules Engine
   4.2.1 Rule Matching Logic
   Rule Evaluation Process:
1. User submits complaint with:
   o Category (e.g., Electricity)
   o Subcategory (e.g., Power outage)
   o Description text
   o Location
1. System checks against predefined rules:
   o Queries auto_priority_rules table
   o Filters active rules only
   o Matches based on category + subcategory
   o Additional keyword matching in description (optional)
   o Location-based rules (optional)
1. Rule Matching Hierarchy:
   o Exact Match: Category + Subcategory exactly match
   o Category Match: Only category matches (subcategory = "All" in rule)
   o Keyword Match: Description contains specific keywords
   o Location Match: Specific locations flagged as critical
   o Time-based: Time of day (e.g., after-hours = higher priority)
1. Priority is Auto-Set if:
   o Rule found and active
   o Rule has lock_priority = true
   o System sets priority field automatically
   o Priority dropdown becomes disabled in UI
1. Priority is User-Selectable if:
   o No matching rule found
   o Rule exists but lock_priority = false
   o Priority dropdown remains enabled
   o Default selection: Medium
   o User can change to Low, Medium, or High
   o User cannot select Critical (admin-only override)
   4.2.2 Example Auto-Priority Rules
   Rule Configuration Table Structure:
   Rule ID Category Subcategory Keywords Location Auto Priority Lock? Active
   1 Electricity Power outage "building", "floor" Any Critical Yes Yes
   2 Electricity Short circuit "spark", "burning smell" Any Critical Yes Yes
   3 Electricity Faulty wiring Any Any High Yes Yes
   4 Plumbing Water leakage "ceiling", "floor", "wall" Any High Yes Yes
   5 Plumbing Drainage block "sewage", "overflow" Any High Yes Yes
   6 Security Emergency Any Any Critical Yes Yes
   7 IT Server down Any Server Room Critical Yes Yes
   8 IT Network issue "no internet", "wifi down" Any High Yes Yes
   9 Facility AC failure "not working" Summer months High Yes Yes
   10 Facility Elevator stuck "stuck", "trapped" Any Critical Yes Yes
   Rule Evaluation Example:
   Scenario 1:
   • User selects: Category = Electricity, Subcategory = Power outage
   Description: "Complete power outage in Building A, 3rd floor"
   • System evaluates:
   o Finds Rule ID 1: Exact match on category + subcategory
   o lock_priority = Yes
   o Sets priority = Critical automatically
   o Disables priority dropdown
   o User cannot change priority
   • Result: Auto-Priority = Critical (Locked)
   Scenario 2:
   • User selects: Category = Plumbing, Subcategory = Tap issue
   • Description: "Tap in Room 204 is leaking slightly"
   • System evaluates:
   o No exact rule match for "Tap issue" subcategory
   o No keyword matches for critical issues
   o No location-based rules triggered
   o Priority dropdown remains enabled
   • Result: User selects priority manually (defaults to Medium)
   Scenario 3:
   • User selects: Category = Plumbing, Subcategory = Water leakage
   • Description: "Water leaking from ceiling in Room 301, spreading fast"
   • System evaluates:
   o Finds Rule ID 4: Match on category + subcategory
   o Keywords "ceiling" found in description
   o lock_priority = Yes
   o Sets priority = High automatically
   • Result: Auto-Priority = High (Locked)
   Scenario 4:
   • User selects: Category = Cleaning, Subcategory = General cleaning
   • Description: "Room needs cleaning after event"
   • System evaluates:
   o No rules defined for Cleaning category
   o Priority dropdown enabled
   o User selects Low priority
   • Result: User Priority = Low
   4.2.3 Priority Override (Admin Only)
   Admin Override Capability:
   • Admin can manually change priority of any complaint
   • Override reasons:
   o User complaint severity incorrectly categorized
   o Additional information received
   o VIP user or critical location
   o Management directive
   o Resource availability considerations
   Override Process:
1. Admin views complaint details
1. Clicks "Override Priority" button
1. Modal opens:
   o Current Priority: [Display current]
   o New Priority: Dropdown (Critical/High/Medium/Low)
   o Reason for Override: Text field (mandatory)
   o Notify Assigned Staff: Checkbox
1. Confirm Override button
1. System:
   o Updates priority
   o Creates timeline entry: "Priority changed from [Old] to [New] by Admin: [Reason]"
   o Recalculates SLA deadline based on new priority
   o Sends notification to assigned staff (if checked)
   o Logs action in audit trail
   o May trigger reassignment if needed (e.g., Critical priority requires different staff)
   4.2.4 Priority and SLA Relationship
   SLA Calculation Based on Priority:
   When priority is set (auto or manual), system immediately:
1. Retrieves SLA configuration for:
   o Category
   o Priority level
1. Calculates SLA deadline:
   o Formula: Created DateTime + SLA Hours = Deadline DateTime
   o Considers business hours (if configured)
   o Excludes weekends/holidays (if configured)
1. Stores SLA deadline in complaint record
1. Starts countdown timer
1. Sets warning threshold (e.g., 75% of SLA time elapsed)
   Example Calculation:
   • Complaint created: Dec 16, 2025, 10:00 AM
   • Category: Electricity
   • Priority: High (auto-set)
   • SLA for High Priority Electricity: 12 hours
   • Business hours: 24/7 (no exclusions)
   • SLA Deadline: Dec 16, 2025, 10:00 PM
   • Warning threshold (75%): Dec 16, 2025, 7:00 PM
   SLA Monitoring:
   • Background job runs every 15 minutes
   • Checks all active complaints
   • Identifies complaints approaching deadline (within warning threshold)
   • Identifies overdue complaints (past deadline)
   • Triggers notifications:
   o Warning notification to assigned staff
   o Alert notification to admin if overdue
   o Escalation if significantly overdue
   Visual SLA Indicators:
   • Green: More than 50% time remaining
   • Yellow: 25-50% time remaining
   • Orange: Less than 25% time remaining
   • Red: Overdue
   4.2.5 Priority Display in UI
   Complaint List Views:
   • Priority column shows colored badge
   • Critical complaints appear at top (if sorted by priority)
   • Priority icon displayed prominently
   • Tooltip on hover shows SLA deadline
   Complaint Detail View:
   • Large priority badge near complaint ID
   • If auto-assigned:
   o Badge shows lock icon
   o Tooltip: "Priority automatically set based on issue type"
   • If user-selected or admin-overridden:
   o Badge shows manual icon
   o Tooltip: "Priority set by [User/Admin]"
   • SLA countdown displayed prominently
   Staff Dashboard:
   • Complaints sorted by priority by default (Critical first)
   • Visual highlighting for Critical complaints
   • Overdue complaints highlighted in red background
   • Priority filter quick access

---

5. AUTO-ASSIGNMENT ALGORITHM (COMPREHENSIVE)
   5.1 Assignment Flow Overview
   Trigger Points for Auto-Assignment:
1. New complaint registered by user (status = Open)
1. Complaint manually unassigned by admin
1. Staff member removed from department
1. Staff member marks unavailable
1. Complaint reassigned due to escalation
   Assignment Process:
   Step 1: Department Identification
   • System reads complaint category
   • Queries category_department_mapping table
   • Identifies target department
   • Example:
   o Category: Electricity → Department: Electrical Department
   o Category: Plumbing → Department: Plumbing Department
   o Category: IT → Department: IT Support
   Step 2: Eligible Staff Retrieval
   • Queries all staff assigned to identified department
   • Filters:
   o Staff status = Active
   o Staff availability != "On Leave"
   o Staff availability != "Busy" (optional, based on configuration)
   o Staff current workload < maximum threshold (if configured)
   Step 3: Staff Scoring Algorithm
   For each eligible staff member, calculate composite score:
   Formula Components:
1. Rating Score (Weight: W1, default 25%):
   o Staff average rating from feedback
   o Score = (Average Rating / 5) × 100
   o Example: Rating 4.5 → Score = 90
1. Resolution Count Score (Weight: W2, default 15%):
   o Total complaints resolved by staff
   o Normalized against department average
   o Score = (Staff Resolved / Dept Avg Resolved) × 100
   o Cap at 100
   o Example: Staff resolved 50, dept avg 40 → Score = 100 (capped)
1. Resolution Speed Score (Weight: W3, default 20%):
   o Average resolution time
   o Lower is better (inverted score)
   o Score = (Dept Avg Time / Staff Avg Time) × 100
   o Cap at 100
   o Example: Staff avg 20 hours, dept avg 24 hours → Score = 120 → 100 (capped)
1. Workload Score (Weight: W4, default 25%):
   o Current open tickets assigned to staff
   o Lower is better (inverted score)
   o Score = (1 - (Staff Open / Max Threshold)) × 100
   o Example: Staff has 3 open, max threshold 10 → Score = 70
1. SLA Compliance Score (Weight: W5, default 10%):
   o Percentage of complaints resolved within SLA
   o Score = SLA Compliance % directly
   o Example: 85% compliance → Score = 85
1. Expertise Match Score (Weight: W6, default 5%):
   o Match between complaint subcategory and staff expertise tags
   o Score = 100 if exact match, 50 if partial, 0 if no match
   o Example: Complaint subcategory "Faulty wiring", staff expertise includes "Wiring" → Score = 100
   Composite Score Calculation:
   Total Score = (Rating Score × W1) + (Resolution Count Score × W2) + (Resolution Speed Score × W3) + (Workload Score × W4) + (SLA Compliance Score × W5) + (Expertise Match Score × W6)

Where: W1 + W2 + W3 + W4 + W5 + W6 = 100%
Step 4: Priority Adjustment
If complaint priority = Critical or High:
• Increase weight for Rating Score (W1) by 10%
• Increase weight for SLA Compliance (W5) by 10%
• Decrease weight for Workload Score (W4) by 10%
• Decrease weight for Resolution Count (W2) by 10%
• Rationale: For urgent complaints, assign to highest-performing staff even if already busy
Step 5: Staff Selection
• Sort all eligible staff by Total Score (descending)
• Select staff member with highest score
• Handle ties:
o If two staff have same score (within 1% difference):
 Choose staff with lower current workload
 If still tied, choose staff who was assigned least recently
 If still tied, random selection
Step 6: Assignment Execution
Once staff selected:

1. Update complaint record:
   o Set staff_id = selected staff ID
   o Set status = "Assigned"
   o Set assigned_at = current timestamp
   o Calculate and set SLA deadline
2. Create timeline entry:
   o "Complaint assigned to [Staff Name] by Auto-Assignment"
3. Create notification for staff:
   o "New complaint assigned: #CMP-XXXX - [Title]"
4. Update staff workload counter:
   o Increment active_complaint_count
5. Log action in audit trail
6. Return success
   Step 7: Fallback Handling
   If no eligible staff found (all on leave, all at max capacity):
   • Option A: Assign to department head (if configured)
   • Option B: Leave unassigned, create alert for admin
   • Option C: Queue complaint for next available staff
   • Option D: Escalate to different department (if cross-trained staff available)
   Admin receives notification:
   • "Complaint #CMP-XXXX could not be auto-assigned. Manual assignment required."
   5.2 Assignment Algorithm Example Calculation
   Scenario:
   • New complaint: Electricity - Faulty wiring - High Priority
   • Department: Electrical Department
   • Eligible Staff: 3 members
   Staff Data:
   Staff A:
   • Average Rating: 4.6/5
   • Total Resolved: 45
   • Avg Resolution Time: 18 hours
   • Current Open Tickets: 5
   • SLA Compliance: 92%
   • Expertise: Wiring, Circuits
   Staff B:
   • Average Rating: 4.2/5
   • Total Resolved: 60
   • Avg Resolution Time: 22 hours
   • Current Open Tickets: 2
   • SLA Compliance: 88%
   • Expertise: Installation, Maintenance
   Staff C:
   • Average Rating: 4.8/5
   • Total Resolved: 38
   • Avg Resolution Time: 16 hours
   • Current Open Tickets: 7
   • SLA Compliance: 95%
   • Expertise: Wiring, Troubleshooting
   Department Averages:
   • Avg Resolved: 48
   • Avg Resolution Time: 20 hours
   • Max Workload Threshold: 10 complaints
   Weights (High Priority adjustment applied):
   • W1 (Rating): 35% (increased from 25%)
   • W2 (Resolution Count): 5% (decreased from 15%)
   • W3 (Resolution Speed): 20%
   • W4 (Workload): 15% (decreased from 25%)
   • W5 (SLA Compliance): 20% (increased from 10%)
   • W6 (Expertise): 5%
   Scoring Calculation:
   Staff A:
7. Rating: (4.6/5) × 100 = 92
8. Resolution Count: (45/48) × 100 = 93.75
9. Resolution Speed: (20/18) × 100 = 111.11 → 100 (capped)
10. Workload: (1 - 5/10) × 100 = 50
11. SLA Compliance: 92
12. Expertise: 100 (exact match: "Wiring")
    Total = (92×0.35) + (93.75×0.05) + (100×0.20) + (50×0.15) + (92×0.20) + (100×0.05) Total = 32.2 + 4.69 + 20 + 7.5 + 18.4 + 5 = 87.79
    Staff B:
13. Rating: (4.2/5) × 100 = 84
14. Resolution Count: (60/48) × 100 = 125 → 100 (capped)
15. Resolution Speed: (20/22) × 100 = 90.91
16. Workload: (1 - 2/10) × 100 = 80
17. SLA Compliance: 88
18. Expertise: 0 (no match)
    Total = (84×0.35) + (100×0.05) + (90.91×0.20) + (80×0.15) + (88×0.20) + (0×0.05) Total = 29.4 + 5 + 18.18 + 12 + 17.6 + 0 = 82.18
    Staff C:
19. Rating: (4.8/5) × 100 = 96
20. Resolution Count: (38/48) × 100 = 79.17
21. Resolution Speed: (20/16) × 100 = 125 → 100 (capped)
22. Workload: (1 - 7/10) × 100 = 30
23. SLA Compliance: 95
24. Expertise: 100 (exact match: "Wiring")
    Total = (96×0.35) + (79.17×0.05) + (100×0.20) + (30×0.15) + (95×0.20) + (100×0.05) Total = 33.6 + 3.96 + 20 + 4.5 + 19 + 5 = 86.06
    Final Ranking:
25. Staff A: 87.79 ← Selected
26. Staff C: 86.06
27. Staff B: 82.18
    Assignment Result: Complaint assigned to Staff A
    Rationale:
    • Staff A has excellent rating, good SLA compliance, expertise match
    • Despite having 5 open tickets, overall performance justifies assignment
    • High priority weighting favored experienced, high-rated staff
    5.3 Manual Override and Reassignment
    Admin Manual Assignment:
    • Admin can bypass auto-assignment
    • Select any staff from any department
    • Useful for:
    o Special circumstances
    o VIP complaints
    o Cross-department issues
    o Staff training
    o Load balancing
    Reassignment Scenarios:
28. Staff Requests Reassignment:
    o Staff views complaint
    o Clicks "Request Reassignment"
    o Modal: Select reason (dropdown):
     Outside my expertise
     Too busy with urgent tasks
     Equipment/access not available
     Other (specify)
    o Submit request
    o Admin receives notification
    o Admin approves/denies:
     If approved: Triggers auto-assignment excluding original staff
     If denied: Notification sent to staff with explanation
29. Admin Reassigns:
    o Manual selection of new staff
    o Original staff relieved
    o New staff notified
    o Timeline updated
30. Automatic Reassignment Triggers:
    o Staff marked as "On Leave"
    o Staff removed from department
    o Staff deactivated
    o Staff reaches max workload threshold
    o System automatically:
     Unassigns all active complaints
     Triggers auto-assignment for each
     Notifies admin of bulk reassignment
    5.4 Assignment Algorithm Configuration
    Admin can configure:
31. Enable/Disable Auto-Assignment:
    o Toggle in system settings
    o If disabled, all complaints remain unassigned until manual assignment
32. Algorithm Type:
    o Weighted scoring (described above)
    o Round-robin (sequential assignment, ignores performance)
    o Least workload (assigns to staff with fewest active complaints)
    o Performance-only (ignores workload, always assigns to highest-rated available)
33. Weight Adjustments:
    o Admin can adjust W1-W6 percentages
    o Must total 100%
    o Separate weights for different priority levels
    o Preview scoring with current data
34. Workload Thresholds:
    o Set maximum complaints per staff
    o Different thresholds for different priorities:
     Critical: Staff can have max 3 Critical complaints
     High: Max 5 active of any priority
     Medium/Low: Max 10 total active
35. Expertise Matching:
    o Enable/disable expertise consideration
    o Define expertise tags
    o Map subcategories to required expertise
36. Business Rules:
    o Consider business hours for assignment
    o Skip staff outside working hours (if after-hours complaint)
    o Rotate assignments to ensure fair distribution
    o Prevent same staff from getting consecutive similar complaints
    5.5 Assignment Performance Metrics
    System tracks:
    • Auto-assignment success rate
    • Average time to assignment
    • Reassignment rate (% of complaints reassigned)
    • Load distribution (standard deviation of staff workloads)
    • Expertise match rate
    Admin dashboard shows:
    • Assignment algorithm effectiveness
    • Recommendations for weight adjustments
    • Identification of bottlenecks (if certain categories have no suitable staff)

---

6. COMPLAINT LIFECYCLE (STATE MACHINE)
   6.1 State Definitions
   Five Primary States:
1. Open:
   o Initial state when complaint created
   o Awaiting assignment
   o User can still edit some fields (add attachments, add comments)
   o Visible to: User, Admin
   o Next valid states: Assigned, Closed (if canceled/invalid)
1. Assigned:
   o Complaint assigned to specific staff member
   o Staff has not yet started work
   o SLA countdown active
   o Visible to: User, Assigned Staff, Admin
   o Next valid states: In Progress, Open (if reassigned), Closed
1. In Progress:
   o Staff actively working on complaint
   o Updates and notes being added
   o Highest engagement state
   o Visible to: User, Assigned Staff, Admin
   o Next valid states: Resolved, Assigned (if need to reassign), Closed (if duplicate)
1. Resolved:
   o Staff completed work and marked resolved
   o Resolution notes added
   o Awaiting user feedback
   o SLA timer stops
   o Visible to: User, Staff, Admin
   o Next valid states: Closed (after feedback), Open (if reopened by user within 7 days)
1. Closed:
   o Final state
   o Feedback submitted or feedback window expired
   o Cannot be modified (except admin override)
   o Archived after configured period
   o Visible to: User, Staff, Admin (read-only)
   o Next valid states: Open (if admin reopens)
   Additional Sub-states (Optional):
   • Pending User Info: Staff needs more information from user
   • Pending Parts: Waiting for parts/materials
   • Escalated: Beyond staff capability, escalated to supervisor/admin
   • Duplicate: Marked as duplicate of another complaint
   6.2 State Transition Rules
   Valid Transitions:
   From State To State Who Can Perform Conditions Mandatory Fields
   Open Assigned System (auto) / Admin Staff available staff_id, assigned_at
   Assigned In Progress Staff Staff acknowledges status_notes (optional)
   In Progress Resolved Staff Work completed resolution_notes, resolved_at
   Resolved Closed System (auto) / User Feedback submitted OR 7 days elapsed feedback_id (if submitted)
   Resolved Open User Issue not actually resolved reopen_reason
   Any Closed Admin Administrative closure closure_reason
   Closed Open Admin Valid reason to reopen reopen_reason
   Assigned Open Admin Unassignment unassignment_reason
   In Progress Assigned Staff/Admin Reassignment needed reassignment_reason
   Invalid Transitions (System prevents):
   • Open → In Progress (must go through Assigned first)
   • Assigned → Resolved (must go through In Progress first)
   • Resolved → In Progress (cannot revert, must reopen to Open)
   • Closed → Resolved (closed is final unless admin reopens to Open)
   6.3 State Change Workflow
   Example: Assigned → In Progress
   User Action:
1. Staff logs into dashboard
1. Clicks on assigned complaint
1. Views complaint details
1. Clicks "Change Status" button
1. Modal appears showing current status: "Assigned"
1. Dropdown shows available next statuses: "In Progress" or "Request Reassignment"
1. Staff selects "In Progress"
1. Optional notes field: "Started troubleshooting"
1. Clicks "Update Status"
   System Processing:
1. Validates:
   o Staff is the assigned staff member
   o Current status is "Assigned"
   o "In Progress" is valid next state
1. Updates complaint record:
   o status = "In Progress"
   o updated_at = current timestamp
   o in_progress_at = current timestamp (for metrics)
1. Creates status_history entry:
   o complaint_id
   o previous_status = "Assigned"
   o new_status = "In Progress"
   o updated_by = staff_id
   o notes = "Started troubleshooting"
   o timestamp = current timestamp
1. Creates timeline entry:
   o "Status changed to In Progress by [Staff Name]"
1. Creates notification for user:
   o "Your complaint #CMP-XXXX is now being worked on"
1. Updates dashboard metrics (real-time)
1. Logs action in audit trail
   User Experience:
   • Success message: "Status updated successfully"
   • Page refreshes showing new status
   • Timeline shows new entry
   • User receives in-app notification (and email if enabled)
   6.4 Reopen Mechanism
   User-Initiated Reopen (Within 7 Days of Resolution):
   Trigger:
   • Complaint status = Resolved
   • Current date within 7 days of resolved_at timestamp
   • User accesses complaint details
   • "Request Reopen" button visible
   Process:
1. User clicks "Request Reopen"
1. Modal appears:
   o Title: "Reopen Complaint #CMP-XXXX"
   o Message: "Please explain why this complaint needs to be reopened"
   o Text area: "Reason for reopening" (mandatory, min 20 characters)
   o Optional: Upload new attachments
   o Checkbox: "Issue was never resolved" / "Issue has recurred"
   o Confirm button
1. User submits reopen request
1. System:
   o Changes status from Resolved to Open
   o Clears staff assignment (optional, or keeps same staff)
   o Resets SLA timer
   o Creates timeline entry: "Complaint reopened by user: [Reason]"
   o Notifies previously assigned staff and admin
   o Triggers auto-assignment (or keeps previous staff based on config)
   o Increments reopen_count field
   o Affects staff performance metrics negatively (reopened complaints tracked)
1. Complaint re-enters workflow as if new complaint
   Automatic Reopen Window Expiry:
   • After 7 days from resolution, reopen button disappears
   • User can only request reopen through admin
   Admin-Initiated Reopen (Anytime):
   • Admin can reopen any closed complaint
   • Similar workflow but accessible anytime
   • Admin provides reason
   • Can manually reassign to different staff
   6.5 Notifications Per State Change
   State Change Notification Matrix:
   From → To User Notified Staff Notified Admin Notified Notification Content
   Open → Assigned Yes Yes (assignee) No User: "Complaint assigned to [Staff]"<br>Staff: "New complaint assigned to you"
   Assigned → In Progress Yes No No "Your complaint is being worked on"
   In Progress → Resolved Yes No No "Your complaint has been resolved. Please provide feedback."
   Resolved → Closed Yes No No "Thank you for your feedback. Complaint is now closed."
   Resolved → Open Yes Yes (original staff) Yes User: "Your complaint has been reopened"<br>Staff: "Complaint reopened"<br>Admin: Alert for follow-up
   Any → Closed (Admin) Yes Yes No "Complaint closed by administrator: [Reason]"
   In Progress → Assigned Yes Yes (both old & new) No "Complaint has been reassigned to [New Staff]"

---

7. DATA FLOW & SYSTEM INTERLINKING
   7.1 Entity Relationships
   Core Entities:
1. Users
1. Departments
1. Complaints
1. Status_History
1. Feedback
1. Notifications
1. Audit_Logs
   Relationships:
   Users ↔ Complaints:
   • One-to-Many: One user can register multiple complaints
   • Foreign Key: complaints.user_id → users.id
   • Usage: Retrieve all complaints by a specific user
   Users (Staff) ↔ Complaints:
   • One-to-Many: One staff can be assigned multiple complaints
   • Foreign Key: complaints.staff_id → users.id (where role = 'Staff')
   • Usage: Retrieve all complaints assigned to a specific staff member
   Departments ↔ Users (Staff):
   • One-to-Many: One department has multiple staff members
   • Foreign Key: users.department_id → departments.id
   • Usage: Retrieve all staff in a specific department
   Departments ↔ Complaints:
   • Indirect relationship through category mapping and staff assignment
   • No direct foreign key
   • Derived: complaints → staff → department
   Complaints ↔ Status_History:
   • One-to-Many: One complaint has multiple status history entries
   • Foreign Key: status_history.complaint_id → complaints.id
   • Usage: Retrieve complete timeline of status changes for a complaint
   Complaints ↔ Feedback:
   • One-to-One: One complaint has one feedback entry (after resolution)
   • Foreign Key: feedback.complaint_id → complaints.id (unique constraint)
   • Usage: Retrieve feedback for a specific complaint
   Users/Complaints ↔ Notifications:
   • Many-to-Many-like: Users receive notifications about various complaints
   • Foreign Keys:
   o notifications.user_id → users.id
   o notifications.complaint_id → complaints.id
   • Usage: Retrieve all notifications for a user, or all notifications related to a complaint
   All Entities ↔ Audit_Logs:
   • Audit logs reference any entity through entity_type + entity_id
   • No formal foreign key (polymorphic)
   • Usage: Track all actions performed on any record
   7.2 Data Flow Diagrams
   7.2.1 Complaint Registration Flow
   Actors: User, Frontend, Backend, Database, Notification Service
   Flow:
1. User fills complaint form → Frontend
1. Frontend validates fields → User (errors if invalid)
1. User submits → Frontend
1. Frontend uploads attachments → Backend (file storage)
1. Backend receives complaint data
1. Backend validates data
1. Backend checks for duplicates → Database query
1. If duplicate found:
   o Backend returns warning to Frontend
   o User decides to proceed or cancel
1. Backend creates complaint record → Database INSERT
1. Database returns complaint ID
1. Backend triggers auto-assignment algorithm:
   o Query departments table for category mapping
   o Query users table for eligible staff
   o Calculate scores
   o Select best staff
   o Update complaint.staff_id
   o Update status to "Assigned"
1. Backend creates status_history entry → Database INSERT
1. Backend creates timeline entry → Database INSERT
1. Backend creates notifications:
   o For user: "Complaint registered successfully"
   o For staff: "New complaint assigned"
1. Backend sends notifications → Notification Service
1. Notification Service:
   o Creates in-app notifications → Database INSERT
   o Sends email (if enabled)
1. Backend returns success response → Frontend
1. Frontend displays success message → User
1. Frontend redirects to complaint details or dashboard
   7.2.2 Status Update Flow
   Actors: Staff, Frontend, Backend, Database, Notification Service
   Flow:
1. Staff views assigned complaint → Frontend
1. Staff clicks "Update Status" → Frontend shows modal
1. Staff selects new status, adds notes → Frontend
1. Frontend validates selection
1. Staff submits → Frontend
1. Backend receives status update request
1. Backend validates:
   o User is assigned staff
   o Current status allows transition to new status
   o Required fields provided (notes)
1. Backend updates complaint record:
   o status = new status
   o updated_at = now
   o If resolved: resolved_at = now
1. Backend creates status_history entry → Database INSERT
1. Backend creates timeline entry
1. Backend updates staff metrics:
   o If resolved: increment resolved_count, update avg_resolution_time
   o If overdue: mark in metrics
1. Backend creates notification for user
1. Backend sends notification → Notification Service
1. If status = Resolved:
   o Backend triggers feedback request notification
   o Backend may schedule auto-close (after 7 days if no feedback)
1. Backend returns success → Frontend
1. Frontend updates UI → Staff sees success message
1. User receives notification
   7.2.3 Dashboard Data Retrieval Flow
   For User Dashboard:
1. User logs in, navigates to dashboard
1. Frontend requests dashboard data → Backend API
1. Backend authenticates user (JWT validation)
1. Backend queries database:
   o Query 1: Count complaints by status for user
   o SELECT status, COUNT(_) FROM complaints WHERE user_id = [user_id] GROUP BY status
   o Query 2: Calculate average resolution time
   o SELECT AVG(TIMESTAMPDIFF(HOUR, created_at, resolved_at)) FROM complaints WHERE user_id = [user_id] AND status = 'Resolved'
   o Query 3: Retrieve recent complaints
   o SELECT _ FROM complaints WHERE user_id = [user_id] ORDER BY created_at DESC LIMIT 20
   o Query 4: Retrieve unread notifications
   o SELECT \* FROM notifications WHERE user_id = [user_id] AND is_read = false ORDER BY created_at DESC LIMIT 10
1. Backend aggregates data into response object:
1. { "summary": { "total": 25, "open": 2, "in_progress": 1, "resolved": 22, "avg_resolution_time": "36 hours" }, "recent_complaints": [ ... ], "notifications": [ ... ]}
1. Backend returns response → Frontend
1. Frontend renders dashboard components with data
1. User views dashboard
   For Staff Dashboard:
1. Staff logs in, navigates to dashboard
1. Frontend requests dashboard data → Backend API
1. Backend authenticates staff
1. Backend queries database:
   o Query 1: Retrieve assigned complaints
   o SELECT _ FROM complaints WHERE staff_id = [staff_id] AND status IN ('Assigned', 'In Progress') ORDER BY priority DESC, sla_deadline ASC
   o Query 2: Count overdue complaints
   o SELECT COUNT(_) FROM complaints WHERE staff_id = [staff_id] AND sla_deadline < NOW() AND status != 'Resolved'
   o Query 3: Count resolved today
   o SELECT COUNT(_) FROM complaints WHERE staff_id = [staff_id] AND DATE(resolved_at) = CURDATE()
   o Query 4: Calculate average rating
   o SELECT AVG(feedback.rating) FROM feedback JOIN complaints ON feedback.complaint_id = complaints.id WHERE complaints.staff_id = [staff_id]
   o Query 5: Calculate workload
   o SELECT COUNT(_) FROM complaints WHERE staff_id = [staff_id] AND status IN ('Assigned', 'In Progress')
1. Backend aggregates data
1. Backend returns response → Frontend
1. Frontend renders dashboard
1. Staff views dashboard
   For Admin Dashboard:
1. Admin logs in, navigates to dashboard
1. Frontend requests comprehensive dashboard data → Backend API
1. Backend authenticates admin
1. Backend performs multiple complex queries
   System-wide complaint counts by status
   • Department-wise statistics
   • Staff performance metrics
   • SLA compliance rates
   • Trend data for charts
   • Recent activity log
   • Alert conditions (unassigned, overdue, etc.)
1. Backend may use caching for performance:
   o Cache key: "admin*dashboard*[date]"
   o TTL: 5 minutes
   o Refresh on significant events
1. Backend returns comprehensive dataset
1. Frontend renders multiple dashboard sections
1. Charts library (ApexCharts) renders visualizations
1. Admin views dashboard
   7.3 Feedback Impact on Staff Performance
   Feedback Collection:
1. Complaint status = Resolved
1. User receives notification: "Please provide feedback"
1. User accesses complaint details
1. Feedback form displayed:
   o Star rating (1-5)
   o Text review
   o "Was issue fully resolved?" checkbox
1. User submits feedback
1. Backend creates feedback record → Database INSERT
1. Backend updates complaint status to Closed
   Performance Metric Updates:
   Backend triggers staff performance recalculation:
1. Average Rating Update:
   o Query all feedback for complaints assigned to this staff
1. SELECT AVG(feedback.rating) FROM feedback
1. JOIN complaints ON feedback.complaint_id = complaints.id
1. WHERE complaints.staff_id = [staff_id]
   o Update staff record: avg_rating = calculated average
   o Update staff_performance table with new rating
1. Resolution Rate Update:
   o If feedback indicates "Not fully resolved":
    Flag complaint as potentially requiring follow-up
    May trigger automatic reopen (based on config)
    Decrement "successful resolution" count
1. Feedback Count Update:
   o Increment feedback_received_count for staff
1. Performance Score Recalculation:
   o Recalculate composite performance score for auto-assignment algorithm
   o Update cached scores
1. Notification to Staff:
   o If rating ≥ 4: "Great job! User rated you [X] stars"
   o If rating < 3: "User rated you [X] stars. Review: [Text]" - Alert to improve
1. Admin Dashboard Updates:
   o Staff performance metrics refreshed
   o Leaderboard positions may change
   o Low-performance alerts generated if rating drops below threshold
   Impact on Future Assignments:
   • Staff with higher average ratings receive higher scores in auto-assignment algorithm
   • Staff with low ratings may be temporarily deprioritized
   • Admin can use performance data for training and improvement plans

---

8. DATABASE SCHEMA (CONCEPTUAL)
   8.1 Table Definitions
   8.1.1 users
   Purpose: Store all user accounts (Users, Staff, Admins)
   Fields:
   • id (Primary Key, Auto-increment, INT)
   • name (VARCHAR 100, NOT NULL)
   • email (VARCHAR 100, UNIQUE, NOT NULL)
   • password_hash (VARCHAR 255, NOT NULL) - bcrypt hashed
   • role (ENUM: 'User', 'Staff', 'Admin', DEFAULT 'User')
   • department_id (Foreign Key → departments.id, NULL for Users)
   • phone (VARCHAR 15, NOT NULL)
   • address (TEXT, NULL)
   • profile_photo_url (VARCHAR 255, NULL)
   • expertise_tags (TEXT, NULL) - JSON array of expertise areas for Staff
   • is_active (BOOLEAN, DEFAULT TRUE)
   • availability_status (ENUM: 'Available', 'Busy', 'On Leave', DEFAULT 'Available')
   • avg_rating (DECIMAL(3,2), NULL) - Calculated from feedback
   • total_resolved (INT, DEFAULT 0) - Count of resolved complaints
   • avg_resolution_time_hours (DECIMAL(6,2), NULL) - Average time to resolve
   • sla_compliance_rate (DECIMAL(5,2), NULL) - Percentage
   • last_login_at (TIMESTAMP, NULL)
   • created_at (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)
   • updated_at (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)
   Indexes:
   • Primary key on id
   • Unique index on email
   • Index on role
   • Index on department_id
   • Index on availability_status
   8.1.2 departments
   Purpose: Store department information
   Fields:
   • id (Primary Key, Auto-increment, INT)
   • name (VARCHAR 100, UNIQUE, NOT NULL) - e.g., "Electrical Department"
   • code (VARCHAR 10, UNIQUE, NOT NULL) - e.g., "ELEC"
   • description (TEXT, NULL)
   • department_head_id (Foreign Key → users.id, NULL)
   • contact_email (VARCHAR 100, NULL)
   • contact_phone (VARCHAR 15, NULL)
   • icon_url (VARCHAR 255, NULL)
   • is_active (BOOLEAN, DEFAULT TRUE)
   • created_at (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)
   • updated_at (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)
   Indexes:
   • Primary key on id
   • Unique index on name
   • Unique index on code
   8.1.3 complaints
   Purpose: Store all complaint records
   Fields:
   • id (Primary Key, Auto-increment, INT)
   • complaint_number (VARCHAR 20, UNIQUE, NOT NULL) - e.g., "CMP-2025-0001"
   • user_id (Foreign Key → users.id, NOT NULL) - Who registered
   • staff_id (Foreign Key → users.id, NULL) - Who is assigned
   • title (VARCHAR 200, NOT NULL)
   • description (TEXT, NOT NULL)
   • category (VARCHAR 50, NOT NULL) - e.g., "Electricity", "Plumbing"
   • subcategory (VARCHAR 50, NULL)
   • location (VARCHAR 200, NOT NULL)
   • priority (ENUM: 'Low', 'Medium', 'High', 'Critical', NOT NULL)
   • priority_locked (BOOLEAN, DEFAULT FALSE) - If true, priority was auto-set and locked
   • status (ENUM: 'Open', 'Assigned', 'In Progress', 'Resolved', 'Closed', DEFAULT 'Open')
   • attachments (TEXT, NULL) - JSON array of file paths
   • sla_deadline (TIMESTAMP, NULL) - Calculated based on priority
   • is_overdue (BOOLEAN, DEFAULT FALSE) - Calculated flag
   • resolution_notes (TEXT, NULL) - Added by staff when resolved
   • resolution_attachments (TEXT, NULL) - JSON array of resolution photos
   • root_cause (VARCHAR 100, NULL)
   • actions_taken (TEXT, NULL)
   • time_spent_hours (DECIMAL(5,2), NULL)
   • reopen_count (INT, DEFAULT 0)
   • created_at (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)
   • assigned_at (TIMESTAMP, NULL)
   • in_progress_at (TIMESTAMP, NULL)
   • resolved_at (TIMESTAMP, NULL)
   • closed_at (TIMESTAMP, NULL)
   • updated_at (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)
   Indexes:
   • Primary key on id
   • Unique index on complaint_number
   • Index on user_id
   • Index on staff_id
   • Index on status
   • Index on priority
   • Index on category
   • Composite index on (status, priority, sla_deadline) - For efficient querying of active complaints
   • Index on created_at
   8.1.4 status_history
   Purpose: Track all status changes for complaints
   Fields:
   • id (Primary Key, Auto-increment, INT)
   • complaint_id (Foreign Key → complaints.id, NOT NULL)
   • previous_status (ENUM: 'Open', 'Assigned', 'In Progress', 'Resolved', 'Closed')
   • new_status (ENUM: 'Open', 'Assigned', 'In Progress', 'Resolved', 'Closed', NOT NULL)
   • updated_by (Foreign Key → users.id, NOT NULL) - Who made the change
   • notes (TEXT, NULL) - Notes added during status change
   • timestamp (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)
   Indexes:
   • Primary key on id
   • Index on complaint_id
   • Index on timestamp
   8.1.5 feedback
   Purpose: Store user feedback after complaint resolution
   Fields:
   • id (Primary Key, Auto-increment, INT)
   • complaint_id (Foreign Key → complaints.id, UNIQUE, NOT NULL) - One feedback per complaint
   • rating (INT, NOT NULL) - 1 to 5
   • review (TEXT, NULL)
   • is_resolved (BOOLEAN, NOT NULL) - Was issue fully resolved?
   • submitted_at (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)
   Indexes:
   • Primary key on id
   • Unique index on complaint_id
   • Index on rating
   8.1.6 notifications
   Purpose: Store in-app notifications
   Fields:
   • id (Primary Key, Auto-increment, INT)
   • user_id (Foreign Key → users.id, NOT NULL) - Recipient
   • complaint_id (Foreign Key → complaints.id, NULL) - Related complaint if applicable
   • type (ENUM: 'Assigned', 'StatusUpdate', 'Resolved', 'Comment', 'Reminder', 'Alert')
   • title (VARCHAR 200, NOT NULL)
   • message (TEXT, NOT NULL)
   • is_read (BOOLEAN, DEFAULT FALSE)
   • created_at (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)
   Indexes:
   • Primary key on id
   • Index on user_id
   • Composite index on (user_id, is_read) - For efficient unread queries
   • Index on created_at
   8.1.7 audit_logs
   Purpose: Track all significant system actions
   Fields:
   • id (Primary Key, Auto-increment, INT)
   • user_id (Foreign Key → users.id, NULL) - Who performed action (NULL for system actions)
   • action (VARCHAR 100, NOT NULL) - e.g., "COMPLAINT_CREATED", "USER_ROLE_CHANGED"
   • entity_type (VARCHAR 50, NOT NULL) - e.g., "Complaint", "User", "Department"
   • entity_id (INT, NOT NULL) - ID of the affected entity
   • details (TEXT, NULL) - JSON with before/after states
   • ip_address (VARCHAR 45, NULL) - IPv4 or IPv6
   • user_agent (VARCHAR 255, NULL)
   • timestamp (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)
   Indexes:
   • Primary key on id
   • Index on user_id
   • Index on action
   • Composite index on (entity_type, entity_id)
   • Index on timestamp
   8.1.8 auto_priority_rules
   Purpose: Store rules for automatic priority assignment
   Fields:
   • id (Primary Key, Auto-increment, INT)
   • rule_name (VARCHAR 100, NOT NULL)
   • category (VARCHAR 50, NOT NULL)
   • subcategory (VARCHAR 50, NULL) - NULL means applies to all subcategories
   • keywords (TEXT, NULL) - JSON array of keywords to match in description
   • location_pattern (VARCHAR 100, NULL) - Pattern match for locations
   • auto_priority (ENUM: 'Low', 'Medium', 'High', 'Critical', NOT NULL)
   • lock_priority (BOOLEAN, DEFAULT TRUE) - If true, user cannot override
   • priority_order (INT, DEFAULT 0) - Rule evaluation order
   • description (TEXT, NULL)
   • is_active (BOOLEAN, DEFAULT TRUE)
   • created_at (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)
   • updated_at (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)
   Indexes:
   • Primary key on id
   • Index on category
   • Index on is_active
   • Index on priority_order
   8.1.9 sla_settings
   Purpose: Store SLA configurations per category and priority
   Fields:
   • id (Primary Key, Auto-increment, INT)
   • category (VARCHAR 50, NOT NULL)
   • subcategory (VARCHAR 50, NULL)
   • critical_sla_hours (INT, NOT NULL)
   • high_sla_hours (INT, NOT NULL)
   • medium_sla_hours (INT, NOT NULL)
   • low_sla_hours (INT, NOT NULL)
   • warning_threshold_percent (INT, DEFAULT 75) - Alert when X% of SLA time elapsed
   • created_at (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)
   • updated_at (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)
   Indexes:
   • Primary key on id
   • Unique composite index on (category, subcategory)
   8.1.10 category_department_mapping
   Purpose: Map complaint categories to departments
   Fields:
   • id (Primary Key, Auto-increment, INT)
   • category (VARCHAR 50, UNIQUE, NOT NULL)
   • department_id (Foreign Key → departments.id, NOT NULL)
   • created_at (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)
   Indexes:
   • Primary key on id
   • Unique index on category
   • Index on department_id
   8.1.11 comments (Optional)
   Purpose: Store comments/communication thread on complaints
   Fields:
   • id (Primary Key, Auto-increment, INT)
   • complaint_id (Foreign Key → complaints.id, NOT NULL)
   • user_id (Foreign Key → users.id, NOT NULL) - Who wrote the comment
   • comment_text (TEXT, NOT NULL)
   • attachments (TEXT, NULL) - JSON array
   • is_internal (BOOLEAN, DEFAULT FALSE) - Internal notes visible only to staff/admin
   • created_at (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)
   Indexes:
   • Primary key on id
   • Index on complaint_id
   • Index on created_at
   8.2 Relationships Summary
   One-to-Many Relationships:
   • users (User) → complaints (user_id)
   • users (Staff) → complaints (staff_id)
   • departments → users (Staff)
   • complaints → status_history
   • complaints → comments
   • users → notifications
   One-to-One Relationships:
   • complaints → feedback
   Many-to-One Relationships:
   • complaints → users (user_id)
   • complaints → users (staff_id)
   • users (Staff) → departments
   Lookup/Configuration Tables:
   • auto_priority_rules (standalone configuration)
   • sla_settings (standalone configuration)
   • category_department_mapping (mapping table)
   8.3 Data Integrity Rules
   Constraints:
1. complaints.user_id must exist in users table
1. complaints.staff_id (if not NULL) must exist in users where role = 'Staff'
1. users.department_id (if not NULL) must exist in departments
1. feedback.complaint_id must exist and be unique
1. Email addresses must be unique across all users
1. Complaint numbers must be unique and auto-generated
1. Status transitions must follow valid state machine rules (enforced in application logic)
1. Ratings must be between 1 and 5
1. Priority cannot be null
1. SLA deadlines recalculated if priority changes
   Cascade Rules:
   • If user (who registered complaint) is deleted → Set complaints.user_id to NULL or prevent deletion
   • If staff is deleted → Set complaints.staff_id to NULL and trigger reassignment
   • If department is deleted → Remove department_id from all staff, trigger reassignment of active complaints
   • If complaint is deleted → Cascade delete status_history, feedback, comments, notifications related to it
   Audit Requirements:
   • All DELETE operations logged in audit_logs
   • All UPDATE operations on critical fields logged
   • All role changes logged
   • All status changes logged (in status_history)

---

9. ACCESS CONTROL & SECURITY
   9.1 Role-Based Access Control (RBAC)
   9.1.1 Route Protection
   Frontend (Angular Guards):
   AuthGuard - Protects all authenticated routes:
   • Checks if user is logged in (valid JWT token exists)
   • If not, redirects to /login
   • Applied to all routes except /login and /register
   RoleGuard - Protects role-specific routes:
   • Checks user role from decoded JWT
   • Validates if user has required role for route
   • If not, redirects to /unauthorized or appropriate dashboard
   Route Protection Matrix:
   Route Pattern Allowed Roles Guard Redirect if Unauthorized
   /login, /register All (unauthenticated) None N/A
   /dashboard User, Staff, Admin AuthGuard /login
   /complaints User, Admin AuthGuard + RoleGuard /unauthorized
   /complaints/new User AuthGuard + RoleGuard /unauthorized
   /staff/dashboard Staff AuthGuard + RoleGuard /unauthorized
   /staff/** Staff AuthGuard + RoleGuard /unauthorized
   /admin/** Admin AuthGuard + RoleGuard /unauthorized
   Implementation:
   • Guards check role on every navigation
   • Guards can read role from JWT payload
   • Failed guard checks log attempt in audit trail
   • User sees appropriate error message
   9.1.2 API Endpoint Protection
   Backend (Middleware):
   Authentication Middleware:
   • Validates JWT token on every API request
   • Extracts user ID and role from token
   • Attaches user info to request object
   • Returns 401 Unauthorized if token invalid/expired
   • Applied to all routes except /auth/login and /auth/register
   Role-Based Authorization Middleware:
   • Checks if authenticated user has required role
   • Returns 403 Forbidden if role insufficient
   • Different middleware functions for each role level
   API Protection Matrix:
   Endpoint Pattern HTTP Method Allowed Roles Response if Unauthorized
   /api/auth/login POST None (public) N/A
   /api/auth/register POST None (public) N/A
   /api/complaints GET User, Staff, Admin 403
   /api/complaints POST User 403
   /api/complaints/:id GET Owner User, Assigned Staff, Admin 403
   /api/complaints/:id PUT Assigned Staff, Admin 403
   /api/complaints/:id/status PATCH Assigned Staff, Admin 403
   /api/staff/dashboard GET Staff 403
   /api/admin/\*_ ALL Admin 403
   /api/users GET Admin 403
   /api/users/:id/assign-department POST Admin 403
   Additional Access Rules:
   • Users can only view/edit their own complaints
   • Staff can only view/edit complaints assigned to them
   • Admin can view/edit all complaints
   • Validation logic in API endpoints checks ownership
   9.1.3 Data Visibility Restrictions
   Complaint Visibility:
   • User: Can see only complaints they registered
   o Query: SELECT _ FROM complaints WHERE user_id = [current_user_id]
   • Staff: Can see only complaints assigned to them
   o Query: SELECT _ FROM complaints WHERE staff_id = [current_user_id]
   • Admin: Can see all complaints
   o Query: SELECT _ FROM complaints
   User Data Visibility:
   • User: Can see only their own profile
   • Staff: Can see their own profile + basic info of users whose complaints they handle
   • Admin: Can see all user profiles and full details
   Staff Performance Data:
   • User: Cannot see staff performance metrics
   • Staff: Can see only their own performance metrics
   • Admin: Can see all staff performance metrics
   Department Data:
   • User: Can see department names only (in complaint details)
   • Staff: Can see own department details + staff count
   • Admin: Can see all department details, staff assignments, configurations
   9.2 Security Best Practices
   9.2.1 Authentication Security
   Password Security:
   • Minimum 8 characters required
   • Must include: uppercase, lowercase, number
   • Hashed using bcrypt with salt rounds = 10
   • Password never stored in plain text
   • Password never returned in API responses
   JWT Token Security:
   • Access Token:
   o Expiry: 30 minutes
   o Contains: user_id, email, role
   o Signed with secret key
   o Stored in memory (not localStorage for XSS protection)
   • Refresh Token:
   o Expiry: 7 days
   o Stored in httpOnly cookie (XSS-safe)
   o Used to obtain new access token
   o Rotation on use (old token invalidated)
   o Stored in database for validation
   Session Management:
   • Tokens invalidated on logout
   • Refresh tokens revoked on password change
   • Multiple concurrent sessions allowed but tracked
   • Suspicious activity detection (IP change, unusual location)
   9.2.2 Input Validation
   Frontend Validation:
   • All form fields validated before submission
   • Character limits enforced
   • Email format validation
   • Phone number format validation
   • File type and size validation
   • XSS prevention: Sanitize user inputs
   Backend Validation:
   • Never trust frontend data
   • Re-validate all inputs
   • SQL injection prevention: Use parameterized queries (ORM)
   • Command injection prevention: Sanitize file names
   • Path traversal prevention: Validate file paths
   • Rate limiting on sensitive endpoints
   9.2.3 File Upload Security
   Validation:
   • Allowed file types: JPG, PNG, PDF, MP4 only
   • File type verified by MIME type, not just extension
   • File size limit: 5 MB per file
   • Max files per upload: 5
   • File name sanitized: Remove special characters
   • Malware scanning (optional, using ClamAV or similar)
   Storage:
   • Files stored outside web root
   • Files accessed via API endpoint with authentication
   • File paths never exposed directly to users
   • Unique file names generated (UUID) to prevent conflicts/overwrites
   • Original file names stored in database metadata
   9.2.4 API Security
   Rate Limiting:
   • Login endpoint: 5 attempts per 15 minutes per IP
   • Complaint submission: 10 per hour per user
   • General API: 100 requests per minute per user
   • Admin APIs: 200 requests per minute
   • Implement using express-rate-limit
   CORS Configuration:
   • Allow only specific frontend origin
   • Credentials allowed (for cookies)
   • Preflight requests handled
   HTTPS Only:
   • All communication over HTTPS
   • Redirect HTTP to HTTPS
   • HSTS header enabled
   SQL Injection Prevention:
   • Use ORM (Sequelize or TypeORM) with parameterized queries
   • Never concatenate user input into SQL strings
   • Validate and sanitize all inputs
   XSS Prevention:
   • Sanitize all user-generated content before displaying
   • Content Security Policy (CSP) headers
   • HttpOnly cookies for sensitive data
   CSRF Prevention:
   • CSRF tokens for state-changing operations
   • SameSite cookie attribute
   • Double-submit cookie pattern
   9.2.5 Error Handling Security
   Error Messages:
   • Never expose stack traces to users in production
   • Generic error messages for authentication failures
   o Don't say "Invalid password" vs "User not found" (reveals user existence)
   o Say "Invalid credentials" for both
   • Log detailed errors server-side
   • Return appropriate HTTP status codes
   Logging:
   • Log all authentication attempts (success/failure)
   • Log all authorization failures
   • Log all admin actions
   • Log all API errors
   • Do NOT log sensitive data (passwords, tokens)
   • Rotate logs regularly
   • Secure log files from unauthorized access
   9.3 Authorization Scenarios
   Scenario 1: User tries to access another user's complaint:
1. User sends GET request to /api/complaints/123
1. Backend authenticates user (JWT valid)
1. Backend queries complaint ID 123
1. Backend checks: complaint.user_id == current_user.id?
1. If NO: Return 403 Forbidden: "You don't have permission to access this complaint"
1. If YES: Return complaint data
   Scenario 2: User tries to access staff dashboard:
1. User navigates to /staff/dashboard in browser
1. Angular RoleGuard activates
1. Guard reads user role from JWT: role = "User"
1. Required role: "Staff"
1. Guard denies access
1. User redirected to /unauthorized
1. Message displayed: "You don't have permission to access this page"
   Scenario 3: Staff tries to update complaint status for unassigned complaint:
1. Staff sends PATCH request to /api/complaints/456/status
1. Backend authenticates (JWT valid)
1. Backend queries complaint ID 456
1. Backend checks: complaint.staff_id == current_user.id?
1. If NO: Return 403 Forbidden: "This complaint is not assigned to you"
1. If YES: Proceed with status update
   Scenario 4: Admin assigns department to user:
1. Admin sends POST request to /api/users/789/assign-department
1. Backend authenticates (JWT valid)
1. Backend checks role: current_user.role == 'Admin'?
1. If NO: Return 403 Forbidden
1. If YES: Proceed with department assignment
1. Update user role to "Staff"
1. Log action in audit_logs

---

10. VALIDATION & ERROR HANDLING
    10.1 Field-Level Validation
    10.1.1 User Registration Validation
    Name:
    • Required: Yes
    • Min length: 2 characters
    • Max length: 100 characters
    • Pattern: Letters, spaces, hyphens, apostrophes only
    • Error messages:
    o Empty: "Name is required"
    o Too short: "Name must be at least 2 characters"
    o Invalid characters: "Name can only contain letters, spaces, hyphens, and apostrophes"
    Email:
    • Required: Yes
    • Pattern: Valid email format (RFC 5322)
    • Uniqueness: Must not exist in database
    • Max length: 100 characters
    • Error messages:
    o Empty: "Email is required"
    o Invalid format: "Please enter a valid email address"
    o Duplicate: "This email is already registered"
    Password:
    • Required: Yes
    • Min length: 8 characters
    • Max length: 50 characters
    • Must contain:
    o At least one uppercase letter
    o At least one lowercase letter
    o At least one number
    o Optionally: Special character
    • Error messages:
    o Empty: "Password is required"
    o Too short: "Password must be at least 8 characters"
    o Weak: "Password must contain uppercase, lowercase, and number"
    Confirm Password:
    • Required: Yes
    • Must match Password field
    • Error message: "Passwords do not match"
    Phone:
    • Required: Yes
    • Pattern: 10 digits (or country-specific format)
    • Error messages:
    o Empty: "Phone number is required"
    o Invalid format: "Please enter a valid 10-digit phone number"
    10.1.2 Complaint Registration Validation
    Title:
    • Required: Yes
    • Min length: 5 characters
    • Max length: 100 characters
    • Pattern: Alphanumeric, spaces, basic punctuation
    • Error messages:
    o Empty: "Complaint title is required"
    o Too short: "Title must be at least 5 characters"
    o Too long: "Title cannot exceed 100 characters"
    Category:
    • Required: Yes
    • Must be from predefined list
    • Error message: "Please select a category"
    Subcategory:
    • Optional: Can be empty
    • If provided, must be valid for selected category
    • Error message: "Invalid subcategory for selected category"
    Location:
    • Required: Yes
    • Min length: 3 characters
    • Max length: 200 characters
    • Error messages:
    o Empty: "Location is required"
    o Too short: "Please provide a more specific location"
    Description:
    • Required: Yes
    • Min length: 20 characters
    • Max length: 1000 characters
    • Error messages:
    o Empty: "Description is required"
    o Too short: "Please provide at least 20 characters describing the issue"
    o Too long: "Description cannot exceed 1000 characters"
    Priority (if user-selectable):
    • Required: Yes (or default to Medium)
    • Must be: Low, Medium, or High (Critical only for admin)
    • Error message: "Please select a priority level"
    Attachments:
    • Optional: Can be empty
    • Max files: 5
    • Max size per file: 5 MB
    • Allowed types: JPG, PNG, PDF, MP4
    • Error messages:
    o Too many files: "You can upload maximum 5 files"
    o File too large: "[Filename] is too large. Maximum size is 5 MB"
    o Invalid type: "[Filename] is not a supported file type. Allowed: JPG, PNG, PDF, MP4"
    10.1.3 Status Update Validation
    New Status:
    • Required: Yes
    • Must be valid next state from current state
    • Error messages:
    o Empty: "Please select a status"
    o Invalid transition: "Cannot change from [Current Status] to [New Status]"
    Status Notes (when changing status):
    • Required: Depends on status change
    o Assigned → In Progress: Optional
    o In Progress → Resolved: Mandatory (min 10 characters)
    • Max length: 1000 characters
    • Error messages:
    o Empty (when required): "Please provide notes about this status change"
    o Too short: "Please provide at least 10 characters explaining the resolution"
    Resolution Notes (when resolving):
    • Required: Yes
    • Min length: 50 characters
    • Max length: 2000 characters
    • Error messages:
    o Empty: "Resolution notes are required"
    o Too short: "Please provide detailed resolution notes (at least 50 characters)"
    10.1.4 Feedback Validation
    Rating:
    • Required: Yes
    • Must be integer between 1 and 5
    • Error message: "Please provide a rating"
    Review:
    • Optional: Can be empty
    • If provided, max length: 500 characters
    • Error message: "Review cannot exceed 500 characters"
    Issue Resolved Checkbox:
    • Required: Yes (must be explicitly checked or unchecked)
    • Boolean value
    • Error message: "Please indicate if the issue was fully resolved"
    10.2 Workflow Validation
    10.2.1 Status Transition Validation
    Validation Logic:
    Current Status → Allowed Next Statuses

Open → [Assigned, Closed(Admin only)]
Assigned → [In Progress, Open(Reassign), Closed(Admin)]
In Progress → [Resolved, Assigned(Reassign), Closed(Admin)]
Resolved → [Closed, Open(Reopen within 7 days)]
Closed → [Open(Admin reopen only)]
Error Handling:
• If user attempts invalid transition:
o Frontend: Dropdown shows only valid next statuses
o Backend: Validates transition, returns 400 Bad Request with message:
 "Invalid status transition from [Current] to [New Status]"
10.2.2 Assignment Validation
Complaint Assignment:
• Staff must belong to correct department for category
• Staff must be active (is_active = true)
• Staff must not be on leave
• Staff workload must be below maximum threshold (if configured)
• Error messages
:
• "Selected staff does not belong to the required department"
• "Selected staff is currently inactive"
• "Selected staff is on leave"
• "Selected staff has reached maximum workload capacity"
Reassignment Validation:
• Cannot reassign to same staff
• Reason must be provided
• Error messages:
o "Complaint is already assigned to this staff member"
o "Reassignment reason is required"
10.2.3 Reopen Validation
User Reopen:
• Complaint must be in Resolved status
• Current date must be within 7 days of resolved_at
• Reason must be provided (min 20 characters)
• Error messages:
o "Only resolved complaints can be reopened"
o "Reopen window has expired (must be within 7 days of resolution)"
o "Please provide a detailed reason for reopening (at least 20 characters)"
Admin Reopen:
• Can reopen any closed complaint anytime
• Reason must be provided
• Error message: "Reason for reopening is required"
10.3 Error Response Format
Successful Response (200/201):
{
"success": true,
"message": "Operation completed successfully",
"data": { ... }
}
Validation Error (400 Bad Request):
{
"success": false,
"message": "Validation failed",
"errors": [
{
"field": "email",
"message": "Email is required"
},
{
"field": "password",
"message": "Password must be at least 8 characters"
}
]
}
Authentication Error (401 Unauthorized):
{
"success": false,
"message": "Authentication failed",
"error": "Invalid credentials"
}
Authorization Error (403 Forbidden):
{
"success": false,
"message": "Access denied",
"error": "You don't have permission to perform this action"
}
Not Found Error (404):
{
"success": false,
"message": "Resource not found",
"error": "Complaint with ID 12345 does not exist"
}
Server Error (500 Internal Server Error):
{
"success": false,
"message": "An unexpected error occurred",
"error": "Please try again later or contact support"
}
10.4 Frontend Error Handling
User-Friendly Messages:
• Display errors using Angular Material Snackbar (toast notifications)
• Field-level errors displayed below input fields in real-time
• Form-level errors displayed at top of form
• Critical errors shown in modal dialogs
Error Display Strategy:

1. Field Validation Errors:
   o Show immediately as user types or on blur
   o Red border around invalid field
   o Error text in red below field
   o Icon indicating error
2. Form Submission Errors:
   o Show at top of form
   o List all errors
   o Scroll to first error
   o Highlight invalid fields
   o Disable submit button until errors resolved
3. API Errors:
   o Show toast notification for general errors
   o Display specific message from backend
   o Provide action button if applicable (e.g., "Retry")
4. Network Errors:
   o Detect offline status
   o Show persistent banner: "You are currently offline"
   o Queue actions for when connection restored (optional)
   o Auto-retry failed requests
   10.5 Backend Error Handling
   Global Error Handler:
   • Catches all unhandled errors
   • Logs error with stack trace
   • Returns appropriate error response
   • Never exposes sensitive information
   Specific Error Handlers:
   • Database errors: "Database operation failed"
   • File upload errors: "File upload failed: [reason]"
   • Email sending errors: "Notification could not be sent"
   • External API errors: "External service unavailable"
   Error Logging:
   • Log level: ERROR for exceptions
   • Include:
   o Timestamp
   o User ID (if authenticated)
   o Request endpoint
   o Error message
   o Stack trace
   o Request payload (sanitized)
   • Store in log files or logging service (e.g., Winston, LogStash)
   Graceful Degradation:
   • If email service fails, log error but don't fail request
   • If notification creation fails, log but don't fail main operation
   • If analytics update fails, continue with primary operation

---

11. NON-FUNCTIONAL REQUIREMENTS
    11.1 Performance Requirements
    Response Time:
    • API endpoints: Average response < 200ms, 95th percentile < 500ms
    • Dashboard loading: < 2 seconds
    • Complaint list rendering: < 1 second for 100 records
    • Search results: < 500ms
    • File upload: Progress indicator, chunked upload for large files
    Throughput:
    • Support 100 concurrent users
    • Handle 50 complaint registrations per minute
    • Process 200 status updates per minute
    Database Performance:
    • Proper indexing on frequently queried columns
    • Query optimization for complex reports
    • Connection pooling (min: 5, max: 20 connections)
    • Query timeout: 30 seconds
    Caching Strategy:
    • Cache dashboard summary data (TTL: 5 minutes)
    • Cache department and category lists (TTL: 1 hour)
    • Cache user session data in memory
    • Invalidate cache on data updates
    Pagination:
    • Default page size: 20 records
    • Max page size: 100 records
    • Use offset/limit pagination for small datasets
    • Consider cursor-based pagination for large datasets
    11.2 Scalability Considerations
    Horizontal Scaling:
    • Stateless backend design (JWT-based auth, no server sessions)
    • Load balancer for multiple backend instances
    • Database read replicas for reporting queries
    • File storage on separate server/cloud (S3, Cloudinary)
    Database Scaling:
    • Archive old complaints (resolved > 6 months)
    • Partitioning large tables (complaints, audit_logs) by date
    • Separate database for analytics (data warehouse)
    Frontend Optimization:
    • Lazy loading of modules
    • Virtual scrolling for large lists
    • Image optimization and lazy loading
    • Code splitting
    • Tree shaking
    • AOT compilation
    Future Considerations:
    • Microservices architecture (separate services for complaints, users, notifications)
    • Message queue for async operations (RabbitMQ, Kafka)
    • Caching layer (Redis)
    • CDN for static assets
    11.3 Maintainability
    Code Organization:
    • Clear separation of concerns
    • Modular architecture
    • Consistent naming conventions
    • Code comments for complex logic
    • README files for each module
    Backend Structure:
    /src
    /controllers - Handle HTTP requests/responses
    /services - Business logic
    /repositories - Database operations
    /middlewares - Authentication, validation, logging
    /utils - Helper functions
    /routes - API route definitions
    /models - Database models (if using ORM)
    /config - Configuration files
    Frontend Structure:
    /src/app
    /core - Singleton services, guards, interceptors
    /shared - Reusable components, pipes, directives
    /features
    /auth - Login, registration
    /user - User dashboard and components
    /staff - Staff dashboard and components
    /admin - Admin dashboard and components
    /models - TypeScript interfaces/classes
    /services - API services
    Documentation:
    • API documentation (Swagger/OpenAPI)
    • Code documentation (JSDoc/TSDoc)
    • Database schema documentation
    • User manuals for each role
    • Admin configuration guide
    • Deployment guide
    Version Control:
    • Git with clear commit messages
    • Feature branching strategy
    • Pull request reviews
    • Semantic versioning for releases
    11.4 Auditability
    Audit Log Requirements:
    • All login attempts logged
    • All complaint CRUD operations logged
    • All status changes logged
    • All role changes logged
    • All admin actions logged
    • All configuration changes logged
    Audit Log Retention:
    • Retain logs for minimum 1 year
    • Archive after 1 year
    • Compliance with data protection regulations
    Audit Trail Accessibility:
    • Admin can view all audit logs
    • Search and filter capabilities
    • Export audit logs for compliance
    Compliance:
    • GDPR compliance (if applicable):
    o Right to data export
    o Right to data deletion
    o User consent for data processing
    • Data encryption at rest and in transit
    11.5 Reliability & Availability
    Uptime Target:
    • 99.5% uptime (approx. 3.6 hours downtime per month)
    • Scheduled maintenance windows communicated in advance
    Backup Strategy:
    • Daily automated database backups
    • Backup retention: 30 days
    • Backup testing quarterly
    • File storage backups
    Disaster Recovery:
    • Recovery Time Objective (RTO): 4 hours
    • Recovery Point Objective (RPO): 24 hours
    • Documented recovery procedures
    • Regular DR drills
    Error Recovery:
    • Automatic retry for transient failures
    • Graceful degradation when services unavailable
    • User-friendly error messages with guidance
    11.6 Usability
    User Experience:
    • Intuitive navigation
    • Consistent UI patterns
    • Responsive design (desktop, tablet, mobile)
    • Accessibility (WCAG 2.1 Level AA):
    o Keyboard navigation
    o Screen reader compatibility
    o Sufficient color contrast
    o Alt text for images
    o ARIA labels
    Help & Guidance:
    • Inline help text
    • Tooltips for complex features
    • FAQ section
    • User guide per role
    • Contact support option
    Performance Feedback:
    • Loading indicators for all async operations
    • Progress bars for uploads
    • Success/error messages for all actions
    • Confirmation dialogs for destructive actions
    11.7 Extensibility (Future Enhancements)
    Designed for Future Additions:
    • Mobile App: Backend API ready for mobile consumption
    • Advanced Analytics: Data structure supports complex reporting
    • AI/ML Integration: Complaint text analysis for auto-categorization/priority
    • IoT Integration: Automated complaint generation from sensors
    • Multi-tenancy: Support multiple organizations in single deployment
    • Multi-language: i18n support in frontend
    • Voice Commands: Integration with voice assistants
    • Chatbot: AI-powered assistant for complaint submission
    • External Integrations: Webhooks for third-party systems
    • Advanced Notifications: SMS, Push notifications, Slack/Teams integration
    API Versioning:
    • Version API endpoints (/api/v1/)
    • Maintain backward compatibility
    • Deprecation notices for old versions

---

12. SYSTEM WORKFLOWS (STEP-BY-STEP)
    12.1 Complete Complaint Lifecycle Workflow
    End-to-End Scenario:
    Step 1: User Registration
1. User navigates to registration page
1. Enters: Name, Email, Password, Phone
1. System validates inputs
1. System creates user with role = "User"
1. System sends welcome email
1. User redirected to login page
   Step 2: User Login
1. User enters email and password
1. System validates credentials
1. System generates JWT access and refresh tokens
1. System returns tokens and user data
1. Frontend stores tokens securely
1. User redirected to User Dashboard
   Step 3: Complaint Registration
1. User clicks "Register New Complaint"
1. User fills form:
   o Title: "Ceiling fan not working"
   o Category: Electricity
   o Subcategory: Fan issue
   o Location: "Room 305, Building A"
   o Description: "Ceiling fan in Room 305 stopped working since yesterday. Makes strange noise when switched on but doesn't rotate."
   o Priority: Auto-set to Medium (no critical rule matched)
   o Attachments: Uploads photo of fan
1. User submits complaint
1. System validates inputs
1. System checks for duplicates (none found)
1. System creates complaint record:
   o complaint_number: "CMP-2025-0042"
   o status: "Open"
   o created_at: Current timestamp
1. System triggers auto-assignment:
   o Identifies department: Electrical Department
   o Retrieves eligible staff: 3 staff members
   o Calculates scores (see section 5.2)
   o Selects Staff A (highest score)
1. System updates complaint:
   o staff_id: Staff A's ID
   o status: "Assigned"
   o assigned_at: Current timestamp
   o Calculates SLA: 24 hours (Medium priority)
   o sla_deadline: Tomorrow same time
1. System creates status_history entry
1. System creates timeline entry
1. System creates notifications:
   o For user: "Complaint registered. ID: CMP-2025-0042"
   o For Staff A: "New complaint assigned: CMP-2025-0042"
1. System sends email notifications
1. System returns success to frontend
1. User sees success message with complaint ID
1. User redirected to complaint details page
   Step 4: Staff Views Assignment
1. Staff A logs in
1. Dashboard shows 1 new assigned complaint
1. Notification bell shows unread notification
1. Staff clicks on complaint CMP-2025-0042
1. Staff views all details:
   o Title, description, location
   o User contact info
   o Attached photo
   o SLA deadline: 23 hours remaining
1. Staff understands the issue
   Step 5: Staff Updates Status to In Progress
1. Staff clicks "Update Status"
1. Selects "In Progress" from dropdown
1. Adds note: "Inspected the fan. Capacitor seems to be faulty. Will replace it."
1. Clicks "Confirm"
1. System validates transition (Assigned → In Progress is valid)
1. System updates complaint:
   o status: "In Progress"
   o in_progress_at: Current timestamp
1. System creates status_history entry
1. System creates notification for user
1. System returns success
1. Staff dashboard refreshes
1. User receives notification: "Your complaint is being worked on"
   Step 6: Staff Resolves Complaint
1. Staff completes work (replaces capacitor, tests fan)
1. Staff clicks "Update Status"
1. Selects "Resolved"
1. Resolution form appears (mandatory fields):
   o Resolution notes: "Replaced faulty capacitor. Fan is now working properly. Tested for 10 minutes. User confirmed functioning."
   o Root cause: "Equipment failure"
   o Actions taken: [x] Replaced parts/equipment
   o Parts used: "Capacitor 2.5µF"
   o Time spent: 1.5 hours
   o Uploads after-photo of working fan
1. Staff submits resolution
1. System validates (all required fields filled)
1. System updates complaint:
   o status: "Resolved"
   o resolved_at: Current timestamp
   o resolution_notes: [Staff's notes]
   o resolution_attachments: [Photo URL]
1. System calculates resolution time: 4 hours (within 24-hour SLA ✓)
1. System creates status_history entry
1. System updates staff metrics:
   o total_resolved: +1
   o Recalculates avg_resolution_time
   o SLA compliance: Still 100% (resolved within SLA)
1. System creates notification for user: "Your complaint has been resolved. Please provide feedback."
1. System sends email to user
1. System schedules auto-close job: If no feedback in 7 days, auto-close
1. Staff sees success message
1. Complaint moved to "Resolved" section in staff dashboard
   Step 7: User Provides Feedback
1. User receives notification
1. User navigates to complaint details
1. Sees "Resolved" status with resolution notes
1. Sees "Please rate our service" prompt
1. User clicks feedback button
1. Feedback form appears:
   o Star rating: Selects 5 stars
   o Review: "Quick and efficient service! Staff was professional and the fan works perfectly now. Very satisfied."
   o Issue fully resolved: [x] Yes
1. User submits feedback
1. System creates feedback record
1. System updates complaint:
   o status: "Closed"
   o closed_at: Current timestamp
1. System updates staff metrics:
   o Updates Staff A's avg_rating (considering new 5-star rating)
1. System creates notification for Staff A: "User rated you 5 stars! Great job!"
1. System returns success
1. User sees thank you message
1. Complaint now in "Closed" state
   Complete Timeline View:
   • Dec 16, 10:00 AM - Complaint registered by John Doe
   • Dec 16, 10:00 AM - Assigned to Staff A (Electrical Dept)
   • Dec 16, 11:30 AM - Status changed to "In Progress" by Staff A: "Inspected the fan..."
   • Dec 16, 02:00 PM - Status changed to "Resolved" by Staff A
   • Dec 16, 03:30 PM - Feedback submitted by John Doe: 5 stars
   • Dec 16, 03:30 PM - Complaint closed
   Metrics Updated:
   • User: 1 resolved complaint, avg resolution time: 4 hours
   • Staff A: 1 more resolved, improved avg rating, maintained 100% SLA compliance
   • Department: 1 more resolved, avg time improved
   • System: Overall resolution rate improved
   12.2 Reopen Workflow
   Scenario: Issue Recurs Within 7 Days
   Step 1: User Discovers Issue Recurred
1. User notices fan stopped working again after 3 days
1. User logs in, navigates to complaint CMP-2025-0042
1. Complaint status shows "Closed"
1. "Request Reopen" button visible (within 7-day window)
   Step 2: User Requests Reopen
1. User clicks "Request Reopen"
1. Modal appears with form:
   o Reason: "The fan stopped working again after 3 days. Same issue - not rotating."
   o Checkbox options:
    [x] Issue was never fully resolved
    [ ] Issue has recurred
1. User submits reopen request
   Step 3: System Processes Reopen
1. System validates:
   o Complaint is in Resolved/Closed status ✓
   o Within 7-day reopen window ✓
   o Reason provided ✓
1. System updates complaint:
   o status: "Open"
   o reopen_count: +1
   o updated_at: Current timestamp
1. System creates status_history entry: "Reopened by user"
1. System creates timeline entry with reopen reason
1. System triggers auto-assignment:
   o Option A: Assign to same staff (Staff A) - preferred for continuity
   o Option B: Assign to different staff - if configured
   o In this case: Assigns back to Staff A
1. System updates:
   o status: "Assigned"
   o staff_id: Staff A
   o assigned_at: New timestamp
   o Recalculates SLA
1. System creates notifications:
   o For Staff A: "Complaint CMP-2025-0042 has been reopened. User reports: [Reason]"
   o For Admin: "Alert: Complaint reopened. May require attention."
1. System updates staff metrics:
   o Flags as reopened complaint (affects performance metrics negatively)
1. System sends email notifications
   Step 4: Staff Addresses Reopened Complaint
1. Staff A receives notification
1. Reviews reopen reason
1. Investigates further (maybe needs different repair approach)
1. Updates status to "In Progress"
1. Resolves issue properly this time
1. Provides more detailed resolution notes
   Step 5: Complaint Resolved Again
1. Standard resolution workflow
1. User provides feedback
1. If user rates low due to recurrence, affects staff rating
1. Complaint closed
   12.3 Admin Manual Reassignment Workflow
   Scenario: Complaint Needs Specialized Expertise
   Step 1: Admin Identifies Need for Reassignment
1. Admin reviews complaint dashboard
1. Notices complaint CMP-2025-0055 is taking too long
1. Clicks on complaint to view details
1. Sees current assignment: Staff B (general electrician)
1. Issue is complex: "Industrial equipment electrical fault"
1. Decides specialized staff needed
   Step 2: Admin Initiates Reassignment
1. Admin clicks "Reassign" button
1. Reassignment modal opens showing:
   o Current assignment: Staff B, Electrical Dept
   o Complaint details summary
1. Admin selects:
   o Department: Electrical (same) or could change if cross-department
   o Staff: Staff C (has expertise tag "Industrial Equipment")
   o Staff C's info displayed:
    Current workload: 4 active complaints (Light)
    Rating: 4.7 stars
    Expertise: Industrial Equipment, High Voltage
1. Admin enters reason: "Requires specialized industrial equipment knowledge"
1. Admin checks:
   o [x] Notify new staff (Staff C)
   o [x] Notify old staff (Staff B)
   o [x] Notify user
1. Admin clicks "Confirm Reassignment"
   Step 3: System Processes Reassignment
1. System validates:
   o Admin has permission ✓
   o New staff exists and is active ✓
   o Reason provided ✓
1. System updates complaint:
   o staff_id: Staff C's ID (was Staff B's ID)
   o updated_at: Current timestamp
   o May keep status as-is or reset to "Assigned" (configurable)
1. System creates status_history entry (if status changed)
1. System creates timeline entry: "Reassigned from Staff B to Staff C by Admin: [Reason]"
1. System updates workload counters:
   o Staff B: active_complaints -1
   o Staff C: active_complaints +1
1. System creates notifications:
   o Staff B: "Complaint CMP-2025-0055 has been reassigned to Staff C. Reason: [...]"
   o Staff C: "New complaint assigned via reassignment: CMP-2025-0055"
   o User: "Your complaint has been reassigned to a specialist for better resolution"
1. System logs action in audit_logs
1. System returns success
   Step 4: Staff C Takes Over
1. Staff C receives notification
1. Reviews complaint history and previous notes from Staff B
1. Continues work with specialized knowledge
1. Resolves complaint successfully

---

13. FINAL IMPLEMENTATION NOTES
    13.1 Development Phases
    Phase 1: Core Authentication & User Management (Week 1-2)
    • User registration and login
    • JWT authentication
    • Role-based guards
    • User profile management
    • Admin user management
    Phase 2: Complaint Management Basics (Week 3-4)
    • Complaint registration form
    • Complaint listing and filtering
    • Complaint details view
    • Status management
    • File upload functionality
    Phase 3: Auto-Assignment & SLA (Week 5-6)
    • Department and category mapping
    • Auto-priority rules engine
    • Auto-assignment algorithm implementation
    • SLA calculation and tracking
    • Scheduled jobs for SLA monitoring
    Phase 4: Dashboards & Analytics (Week 7-8)
    • User dashboard
    • Staff dashboard with metrics
    • Admin dashboard with charts
    • Analytics and reporting
    • Performance metrics
    Phase 5: Notifications & Communication (Week 9)
    • Notification system
    • Email integration
    • Comments/communication feature
    • Real-time updates (polling or WebSocket)
    Phase 6: Feedback & Refinement (Week 10)
    • Feedback and rating system
    • Reopen mechanism
    • Audit logging
    • Testing and bug fixes
    Phase 7: Polish & Deployment (Week 11-12)
    • UI/UX refinements
    • Performance optimization
    • Security hardening
    • Documentation
    • Deployment setup
    13.2 Testing Strategy
    Unit Testing:
    • Backend: Jest for services and utilities
    • Frontend: Jasmine/Karma for components and services
    • Target coverage: 70%+
    Integration Testing:
    • API endpoint testing (Postman/Newman or Jest)
    • Database integration tests
    • Authentication flow tests
    End-to-End Testing:
    • Cypress or Protractor for critical user journeys
    • Test scenarios:
    o Complete complaint lifecycle
    o User registration and role upgrade
    o Auto-assignment logic
    o Status transitions
    o Feedback submission
    Performance Testing:
    • Load testing with Apache JMeter or k6
    • Test concurrent user scenarios
    • Database query performance
    Security Testing:
    • OWASP Top 10 vulnerabilities
    • Penetration testing
    • SQL injection tests
    • XSS prevention verification
    13.3 Deployment Considerations
    Environment Setup:
    • Development
    • Staging (mirrors production)
    • Production
    Infrastructure:
    • Frontend: Nginx or Apache web server, or deploy on Netlify/Vercel
    • Backend: Node.js application server with PM2 for process management
    • Database: MySQL server with regular backups
    • File Storage: Local server initially, S3/Cloudinary for production
    • SSL Certificate: Let's Encrypt for HTTPS
    CI/CD Pipeline:
    • Git repository (GitHub/GitLab)
    • Automated testing on pull requests
    • Automated deployment to staging on merge to develop branch
    • Manual approval for production deployment
    • Rollback capability
    Monitoring & Logging:
    • Application logs: Winston or Bunyan
    • Error tracking: Sentry or similar
    • Performance monitoring: New Relic or Application Insights
    • Uptime monitoring: Pingdom or UptimeRobot
    13.4 Success Metrics
    System Health Metrics:
    • API response time < 200ms (avg)
    • Database query time < 100ms (avg)
    • 99.5% uptime
    • Zero data loss
    Usage Metrics:
    • Number of complaints registered
    • Average resolution time
    • SLA compliance rate
    • User satisfaction (average rating)
    • Staff performance scores
    Business Metrics:
    • Complaint resolution rate
    • Repeat complaint rate (reopens)
    • User engagement (logins, active users)
    • Department efficiency comparison

---

14. CONCLUSION
    This comprehensive document provides a complete blueprint for the Digital Complaint Management & Grievance Portal. It covers:
    ✅ Clear Role Definitions - User, Staff, Admin with specific capabilities ✅ Detailed Dashboard Specifications - Every component, card, table, and chart ✅ Intelligent Auto-Assignment - Sophisticated weighted scoring algorithm ✅ Priority Management - Auto-priority rules with manual overrides ✅ Complete Data Flow - From registration to resolution to feedback ✅ Database Schema - All tables, relationships, and constraints ✅ Security & Access Control - RBAC, authentication, authorization ✅ Validation Rules - Field-level and workflow validation ✅ Non-Functional Requirements - Performance, scalability, reliability ✅ Implementation Workflows - Step-by-step processes for all scenarios
    This document is ready for:
    • Frontend Developers: To design and build Angular components
    • Backend Developers: To implement APIs and business logic
    • Database Engineers: To create schema and optimize queries
    • UI/UX Designers: To create wireframes and visual designs
    • QA Engineers: To develop test plans and test cases
    • Project Managers: To estimate timeline and track progress
    The system is designed to be professional, scalable, maintainable, and user-friendly - suitable for real-world deployment in educational institutions, corporate offices, residential complexes, or any organization requiring complaint management.
