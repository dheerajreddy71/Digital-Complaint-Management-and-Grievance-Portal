# 🔐 Complete User Credentials - Digital Complaint Portal

## Quick Reference Table

| Name                              | Email                       | Password  | Role  | Department     |
| --------------------------------- | --------------------------- | --------- | ----- | -------------- |
| **System Administrator**          | admin@portal.com            | Admin123! | Admin | Administration |
| **Robert Martinez (Plumber)**     | robert.plumber@portal.com   | Staff123! | Staff | Plumbing       |
| **Sarah Johnson (Plumber)**       | sarah.plumber@portal.com    | Staff123! | Staff | Plumbing       |
| **Michael Chen (Electrician)**    | michael.electric@portal.com | Staff123! | Staff | Electrical     |
| **Emily Davis (Electrician)**     | emily.electric@portal.com   | Staff123! | Staff | Electrical     |
| **James Wilson (Electrician)**    | james.electric@portal.com   | Staff123! | Staff | Electrical     |
| **David Brown (Facility Tech)**   | david.facility@portal.com   | Staff123! | Staff | Facility       |
| **Lisa Anderson (Facility Tech)** | lisa.facility@portal.com    | Staff123! | Staff | Facility       |
| **Kevin Lee (IT Support)**        | kevin.it@portal.com         | Staff123! | Staff | IT             |
| **Anna Taylor (IT Support)**      | anna.it@portal.com          | Staff123! | Staff | IT             |
| **John Smith (Resident)**         | john.smith@example.com      | User123!  | User  | Residents      |
| **Emma Watson (Resident)**        | emma.watson@example.com     | User123!  | User  | Residents      |
| **Oliver Robinson (Resident)**    | oliver.robinson@example.com | User123!  | User  | Residents      |
| **Sophia Garcia (Student)**       | sophia.garcia@example.com   | User123!  | User  | Students       |
| **William Thomas (Student)**      | william.thomas@example.com  | User123!  | User  | Students       |

---

## 👨‍💼 Admin Account

**Email:** `admin@portal.com`  
**Password:** `Admin123!`  
**Role:** Administrator  
**Permissions:**

- Full system access
- User management
- Complaint reassignment
- Analytics and reports
- System configuration

---

## 👷 Staff Accounts by Department

### 🔧 Plumbing Department (2 Staff)

#### Robert Martinez

- **Email:** `robert.plumber@portal.com`
- **Password:** `Staff123!`
- **Expertise:** Plumbing
- **Handles:** Water leaks, pipe issues, drainage, plumbing repairs

#### Sarah Johnson

- **Email:** `sarah.plumber@portal.com`
- **Password:** `Staff123!`
- **Expertise:** Plumbing
- **Handles:** Water leaks, pipe issues, drainage, plumbing repairs

---

### ⚡ Electrical Department (3 Staff)

#### Michael Chen

- **Email:** `michael.electric@portal.com`
- **Password:** `Staff123!`
- **Expertise:** Electrical
- **Handles:** Power outages, wiring, lighting, electrical repairs

#### Emily Davis

- **Email:** `emily.electric@portal.com`
- **Password:** `Staff123!`
- **Expertise:** Electrical
- **Handles:** Power outages, wiring, lighting, electrical repairs

#### James Wilson

- **Email:** `james.electric@portal.com`
- **Password:** `Staff123!`
- **Expertise:** Electrical
- **Handles:** Power outages, wiring, lighting, electrical repairs

---

### 🏢 Facility Department (2 Staff)

#### David Brown

- **Email:** `david.facility@portal.com`
- **Password:** `Staff123!`
- **Expertise:** Facility Management
- **Handles:** AC/heating, building maintenance, facility repairs

#### Lisa Anderson

- **Email:** `lisa.facility@portal.com`
- **Password:** `Staff123!`
- **Expertise:** Facility Management
- **Handles:** AC/heating, building maintenance, facility repairs

---

### 💻 IT Department (2 Staff)

#### Kevin Lee

- **Email:** `kevin.it@portal.com`
- **Password:** `Staff123!`
- **Expertise:** IT Support
- **Handles:** Network issues, computers, printers, software support

#### Anna Taylor

- **Email:** `anna.it@portal.com`
- **Password:** `Staff123!`
- **Expertise:** IT Support
- **Handles:** Network issues, computers, printers, software support

---

## 👥 Regular User Accounts (5 Users)

### Residents

#### John Smith

- **Email:** `john.smith@example.com`
- **Password:** `User123!`
- **Type:** Resident
- **Pre-loaded Complaints:** 4 complaints with various priorities

#### Emma Watson

- **Email:** `emma.watson@example.com`
- **Password:** `User123!`
- **Type:** Resident
- **Pre-loaded Complaints:** 3 complaints

#### Oliver Robinson

- **Email:** `oliver.robinson@example.com`
- **Password:** `User123!`
- **Type:** Resident
- **Pre-loaded Complaints:** 3 complaints

### Students

#### Sophia Garcia

- **Email:** `sophia.garcia@example.com`
- **Password:** `User123!`
- **Type:** Student
- **Pre-loaded Complaints:** 3 complaints

#### William Thomas

- **Email:** `william.thomas@example.com`
- **Password:** `User123!`
- **Type:** Student
- **Pre-loaded Complaints:** 3 complaints

---

## 🎯 Auto-Assignment Logic

### Department Routing

| Complaint Category | Assigned Department | Available Staff                         |
| ------------------ | ------------------- | --------------------------------------- |
| **Plumbing**       | Plumbing Dept       | Robert Martinez, Sarah Johnson          |
| **Electrical**     | Electrical Dept     | Michael Chen, Emily Davis, James Wilson |
| **Facility**       | Facility Dept       | David Brown, Lisa Anderson              |
| **IT**             | IT Dept             | Kevin Lee, Anna Taylor                  |
| **Other**          | Lowest Workload     | Any available staff                     |

### Staff Selection Criteria

Complaints are auto-assigned using intelligent algorithm:

1. **Department Match**: Route to correct department based on category
2. **Workload Calculation**:
   - Critical priority = 5 points
   - High priority = 3 points
   - Medium priority = 2 points
   - Low priority = 1 point
3. **Selection**: Assign to staff with **lowest total workload**
4. **Tiebreaker**: If equal workload, assign to oldest last-assigned time

### SLA Deadlines

| Priority     | SLA Time | Color Code |
| ------------ | -------- | ---------- |
| **Critical** | 4 hours  | 🔴 Red     |
| **High**     | 24 hours | 🟠 Orange  |
| **Medium**   | 48 hours | 🟡 Yellow  |
| **Low**      | 72 hours | 🟢 Green   |

---

## 📊 Pre-loaded Data

The database has been seeded with:

- ✅ **15 Total Complaints** across all departments
- ✅ **Multiple Status Types**: Open, Assigned, In-progress, Resolved
- ✅ **Priority Distribution**: Critical, High, Medium, Low
- ✅ **Realistic Scenarios**: Water leaks, power outages, IT issues, facility problems
- ✅ **Status History**: Complete timeline for each complaint
- ✅ **Feedback**: Ratings and comments for resolved complaints
- ✅ **Comments**: Sample internal and public comments
- ✅ **Notifications**: Auto-generated for assignments and updates

---

## 🔄 Status Workflow

Each complaint follows this lifecycle:

```
Open (User creates)
  ↓
Assigned (to Department)
  ↓
Assigned (to specific Staff)
  ↓
In-progress (Staff working)
  ↓
Resolved (Issue fixed)
  ↓
Feedback (User rates service)
```

---

## 🧪 Testing Scenarios

### Test User Flow

1. Login: `john.smith@example.com` / `User123!`
2. View existing complaints
3. Create new complaint
4. Track status updates
5. Add comments
6. Submit feedback after resolution

### Test Staff Flow

1. Login: `robert.plumber@portal.com` / `Staff123!`
2. View "My Queue" with assigned complaints
3. Sort by priority and date
4. Update status to In-progress
5. Add resolution notes
6. Mark as Resolved
7. View performance stats

### Test Admin Flow

1. Login: `admin@portal.com` / `Admin123!`
2. View all complaints system-wide
3. Monitor department workloads
4. Reassign complaints manually
5. View analytics dashboard
6. Export reports
7. Manage user accounts

---

## 🔒 Security Notes

⚠️ **IMPORTANT - PRODUCTION DEPLOYMENT:**

These are **test credentials only**. Before production:

1. ✅ Change ALL default passwords
2. ✅ Implement strong password policy (min 12 chars)
3. ✅ Enable Multi-Factor Authentication (MFA)
4. ✅ Use environment-specific credentials
5. ✅ Rotate passwords every 90 days
6. ✅ Never commit credentials to Git
7. ✅ Use secrets management (AWS Secrets Manager, Azure Key Vault)
8. ✅ Enable audit logging for all actions
9. ✅ Implement role-based access control (RBAC)
10. ✅ Add CAPTCHA for login after 3 failed attempts

---

## 📱 Role-Based Features

### Users Can:

- ✅ Submit new complaints
- ✅ Track complaint status
- ✅ View status timeline
- ✅ Add comments
- ✅ Upload attachments (max 5MB)
- ✅ Provide feedback on resolved complaints
- ✅ View own complaints only

### Staff Can:

- ✅ View assigned complaints in "My Queue"
- ✅ Update complaint status
- ✅ Add resolution notes
- ✅ Add internal comments (hidden from users)
- ✅ Add public comments
- ✅ View attachments
- ✅ View department workload
- ✅ Update availability status

### Admin Can:

- ✅ All Staff permissions PLUS:
- ✅ View ALL complaints
- ✅ Manually reassign complaints
- ✅ Manage user accounts
- ✅ View system-wide analytics
- ✅ Export reports (CSV, Excel, PDF)
- ✅ Monitor SLA compliance
- ✅ View staff performance metrics

---

## 🔄 Database Reset

To reset database to clean state with all test data:

```bash
cd backend
pnpm exec ts-node src/scripts/reset-and-seed.ts
```

This will:

1. Clear all existing data
2. Create all 15 users (1 admin, 9 staff, 5 users)
3. Generate 15 realistic complaints
4. Auto-assign based on department and workload
5. Create status history
6. Add sample comments
7. Generate notifications
8. Submit feedback for resolved complaints

---

## 💡 Password Pattern

All test passwords follow consistent pattern for easy testing:

- **Admin**: `Admin123!`
- **Staff**: `Staff123!`
- **Users**: `User123!`

**Requirements Met:**

- ✅ Minimum 8 characters
- ✅ At least 1 uppercase letter
- ✅ At least 1 lowercase letter
- ✅ At least 1 number
- ✅ At least 1 special character (!@#$%^&\*)

---

## 📞 Support

For any credential issues or account lockouts during testing, reset the database using the script above or contact system administrator.

**Last Updated:** December 25, 2025
