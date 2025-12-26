# 🔐 User Credentials - Digital Complaint Management Portal

## All Test Accounts

### 👨‍💼 Admin Account

- **Email:** `admin@portal.com`
- **Password:** `Admin123!`
- **Role:** Admin
- **Permissions:** Full system access, user management, analytics, export

---

### 👷 Staff Accounts

#### 1. Plumbing Staff

- **Email:** `staff@portal.com`
- **Password:** `Staff123!`
- **Role:** Staff
- **Expertise:** Plumbing
- **Handles:** Water leaks, pipe issues, drainage problems

#### 2. Electrical Staff

- **Email:** `electrician@portal.com`
- **Password:** `Staff123!`
- **Role:** Staff
- **Expertise:** Electrical
- **Handles:** Power outages, wiring issues, lighting problems

#### 3. IT Support Staff

- **Email:** `itsupport@portal.com`
- **Password:** `Staff123!`
- **Role:** Staff
- **Expertise:** IT
- **Handles:** Network issues, computer problems, software support

---

### 👤 Regular User Accounts

#### 1. Primary Test User

- **Email:** `user@portal.com`
- **Password:** `User123!`
- **Role:** User
- **Purpose:** Main test account for complaint submission

#### 2. Secondary Test User

- **Email:** `john@example.com`
- **Password:** `User123!`
- **Role:** User
- **Purpose:** Additional test user for multi-user scenarios

---

## Quick Login Guide

### Testing User Flow

1. Login with: `user@portal.com` / `User123!`
2. Submit complaint → Gets auto-assigned based on category
3. Track status and view timeline
4. Add comments and provide feedback

### Testing Staff Flow

1. Login with appropriate staff account (based on expertise needed)
2. View "My Queue" with assigned complaints
3. Update status, add resolution notes
4. View performance analytics

### Testing Admin Flow

1. Login with: `admin@portal.com` / `Admin123!`
2. Manage all users and complaints
3. View system-wide analytics
4. Export reports

---

## Auto-Assignment Logic

When a user submits a complaint, the system automatically assigns it to staff based on:

| Complaint Category | Assigned To           | Staff Email            |
| ------------------ | --------------------- | ---------------------- |
| **Plumbing**       | Staff Plumber         | staff@portal.com       |
| **Electrical**     | Staff Electrician     | electrician@portal.com |
| **IT**             | Staff IT Support      | itsupport@portal.com   |
| **Facility**       | Lowest workload staff | (any available)        |
| **Other**          | Lowest workload staff | (any available)        |

**Priority Ordering:** Critical → High → Medium → Low

---

## Security Notes

⚠️ **Important:** These are test credentials. In production:

- Change all default passwords
- Implement strong password policies (min 12 chars, complexity)
- Enable MFA for admin and staff accounts
- Use environment-specific credentials
- Rotate passwords regularly
- Never commit credentials to version control

---

## Password Requirements

Current system enforces:

- ✅ Minimum 8 characters
- ✅ At least 1 uppercase letter
- ✅ At least 1 lowercase letter
- ✅ At least 1 number
- ✅ At least 1 special character (!@#$%^&\*)

All test passwords follow pattern: `RolePrefix123!`

---

## Need Help?

If you forget any credentials or need to reset:

```bash
# Run the database seed script to reset all test users
cd backend
pnpm run db:seed
```

This will recreate all test accounts with default passwords.
