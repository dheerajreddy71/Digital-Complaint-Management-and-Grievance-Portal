# System Architecture Documentation

## Overview

The Digital Complaint Management & Grievance Portal is a full-stack web application designed to handle citizen complaints efficiently. The system follows a modern microservices-ready architecture with clear separation of concerns.

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              PRESENTATION LAYER                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                     Angular 16 Frontend                              │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │   │
│  │  │   Auth   │ │Dashboard │ │Complaints│ │  Admin   │ │ Profile  │  │   │
│  │  │  Module  │ │  Module  │ │  Module  │ │  Module  │ │  Module  │  │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘  │   │
│  │  ┌─────────────────────────────────────────────────────────────┐   │   │
│  │  │                     Core Module                              │   │   │
│  │  │   Services • Guards • Interceptors • Models                  │   │   │
│  │  └─────────────────────────────────────────────────────────────┘   │   │
│  │  ┌─────────────────────────────────────────────────────────────┐   │   │
│  │  │                    Shared Module                             │   │   │
│  │  │   Components • Pipes • Directives                            │   │   │
│  │  └─────────────────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│                                    ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         Nginx Reverse Proxy                          │   │
│  │                    (Load Balancing, SSL, Caching)                    │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              APPLICATION LAYER                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                   Node.js / Express Backend                          │   │
│  │                                                                       │   │
│  │  ┌─────────────────────────────────────────────────────────────┐    │   │
│  │  │                      Controllers                             │    │   │
│  │  │  Auth │ Complaint │ Comment │ User │ Analytics │ Notification│    │   │
│  │  └─────────────────────────────────────────────────────────────┘    │   │
│  │                              │                                       │   │
│  │  ┌─────────────────────────────────────────────────────────────┐    │   │
│  │  │                       Services                               │    │   │
│  │  │  Business Logic • Validation • SLA Calculation • Email       │    │   │
│  │  └─────────────────────────────────────────────────────────────┘    │   │
│  │                              │                                       │   │
│  │  ┌─────────────────────────────────────────────────────────────┐    │   │
│  │  │                      Repositories                            │    │   │
│  │  │         Data Access • Query Building • Transactions          │    │   │
│  │  └─────────────────────────────────────────────────────────────┘    │   │
│  │                                                                       │   │
│  │  ┌───────────────┐ ┌───────────────┐ ┌───────────────────────────┐  │   │
│  │  │  Middlewares  │ │    Utils      │ │     Scheduled Jobs        │  │   │
│  │  │ Auth•RateLimit│ │ Logger•Helper │ │ SLA Monitor•Notifications │  │   │
│  │  └───────────────┘ └───────────────┘ └───────────────────────────┘  │   │
│  │                                                                       │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                                DATA LAYER                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌────────────────────────────┐    ┌────────────────────────────────────┐  │
│  │       MySQL 8.0            │    │           Redis Cache              │  │
│  │                            │    │                                    │  │
│  │  ┌──────────────────────┐  │    │  • Session Storage                 │  │
│  │  │       Tables         │  │    │  • Rate Limiting                   │  │
│  │  │  • Users             │  │    │  • API Response Caching            │  │
│  │  │  • Complaints        │  │    │  • Real-time Notifications         │  │
│  │  │  • Status_History    │  │    │                                    │  │
│  │  │  • Comments          │  │    └────────────────────────────────────┘  │
│  │  │  • Feedback          │  │                                            │
│  │  │  • Notifications     │  │    ┌────────────────────────────────────┐  │
│  │  │  • Audit_Logs        │  │    │        File Storage               │  │
│  │  │  • Refresh_Tokens    │  │    │                                    │  │
│  │  └──────────────────────┘  │    │  • Complaint Attachments          │  │
│  │                            │    │  • User Avatars                    │  │
│  └────────────────────────────┘    │  • System Assets                   │  │
│                                    └────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

### Frontend

| Technology       | Version | Purpose                |
| ---------------- | ------- | ---------------------- |
| Angular          | 16.2.0  | SPA Framework          |
| Angular Material | 16.2.0  | UI Component Library   |
| RxJS             | 7.8.0   | Reactive Programming   |
| TypeScript       | 5.1.3   | Type Safety            |
| SCSS             | -       | Styling with variables |

### Backend

| Technology | Version  | Purpose             |
| ---------- | -------- | ------------------- |
| Node.js    | 18.x LTS | Runtime Environment |
| Express.js | 4.18.x   | Web Framework       |
| TypeScript | 5.3.x    | Type Safety         |
| mysql2     | 3.x      | MySQL Driver        |
| JWT        | -        | Authentication      |
| bcrypt     | -        | Password Hashing    |
| multer     | -        | File Uploads        |
| node-cron  | -        | Scheduled Jobs      |

### Database

| Technology | Version | Purpose            |
| ---------- | ------- | ------------------ |
| MySQL      | 8.0     | Primary Database   |
| Redis      | 7.x     | Caching & Sessions |

### DevOps

| Technology     | Purpose                       |
| -------------- | ----------------------------- |
| Docker         | Containerization              |
| Docker Compose | Multi-container orchestration |
| Nginx          | Reverse Proxy & Static Files  |
| GitHub Actions | CI/CD Pipeline                |

---

## Database Schema

### Entity Relationship Diagram

```
┌──────────────────┐       ┌──────────────────┐       ┌──────────────────┐
│      Users       │       │    Complaints    │       │   Status_History │
├──────────────────┤       ├──────────────────┤       ├──────────────────┤
│ PK id            │◄──────┤ FK citizen_id    │───────►│ FK complaint_id  │
│    name          │       │ FK assigned_to   │       │ FK changed_by    │
│    email (UQ)    │       │ PK id            │       │ PK id            │
│    password_hash │       │    tracking_id   │       │    from_status   │
│    role          │       │    title         │       │    to_status     │
│    phone         │       │    description   │       │    notes         │
│    is_active     │       │    category      │       │    created_at    │
│    last_login    │       │    status        │       └──────────────────┘
│    created_at    │       │    priority      │
│    updated_at    │       │    location      │       ┌──────────────────┐
└──────────────────┘       │    attachments   │       │     Comments     │
         │                 │    sla_deadline  │       ├──────────────────┤
         │                 │    resolution    │       │ FK complaint_id  │
         │                 │    created_at    │       │ FK author_id     │
         │                 │    updated_at    │       │ PK id            │
         │                 └──────────────────┘       │    content       │
         │                          │                 │    is_internal   │
         │                          │                 │    created_at    │
         │                          ▼                 └──────────────────┘
         │                 ┌──────────────────┐
         │                 │     Feedback     │       ┌──────────────────┐
         │                 ├──────────────────┤       │   Notifications  │
         │                 │ FK complaint_id  │       ├──────────────────┤
         │                 │ FK citizen_id    │       │ FK user_id       │
         │                 │ PK id            │       │ PK id            │
         │                 │    rating        │       │    type          │
         │                 │    comments      │       │    title         │
         │                 │    created_at    │       │    message       │
         │                 └──────────────────┘       │    complaint_id  │
         │                                            │    is_read       │
         │                 ┌──────────────────┐       │    created_at    │
         │                 │    Audit_Logs    │       └──────────────────┘
         │                 ├──────────────────┤
         └────────────────►│ FK user_id       │       ┌──────────────────┐
                           │ PK id            │       │  Refresh_Tokens  │
                           │    action        │       ├──────────────────┤
                           │    entity_type   │       │ FK user_id       │
                           │    entity_id     │       │ PK id            │
                           │    old_values    │       │    token         │
                           │    new_values    │       │    expires_at    │
                           │    ip_address    │       │    created_at    │
                           │    user_agent    │       └──────────────────┘
                           │    created_at    │
                           └──────────────────┘
```

---

## Application Layers

### 1. Presentation Layer (Frontend)

**Module Structure:**

```
src/app/
├── core/                 # Singleton services, guards, interceptors
│   ├── services/        # HTTP services for API calls
│   ├── guards/          # Route protection (auth, role-based)
│   ├── interceptors/    # HTTP interceptors (auth token, errors)
│   └── models/          # TypeScript interfaces
│
├── shared/              # Reusable components and utilities
│   ├── components/      # Common UI components
│   └── pipes/          # Custom pipes
│
├── features/            # Feature modules (lazy-loaded)
│   ├── auth/           # Login, Register
│   ├── dashboard/      # Role-based dashboards
│   ├── complaints/     # CRUD operations
│   ├── admin/          # Admin management
│   ├── staff/          # Staff workqueue
│   ├── notifications/  # Notification center
│   └── profile/        # User profile
│
└── environments/        # Environment configurations
```

**Key Design Patterns:**

- **Lazy Loading**: Feature modules loaded on demand
- **Smart/Dumb Components**: Container components handle logic, presentational components are pure
- **Reactive Forms**: Type-safe form handling
- **RxJS Operators**: Efficient data transformation and caching
- **Interceptors**: Centralized HTTP handling

### 2. Application Layer (Backend)

**Structure:**

```
src/
├── controllers/         # Route handlers, request/response
├── services/           # Business logic, orchestration
├── repositories/       # Data access, query building
├── models/            # TypeScript types and interfaces
├── middlewares/       # Express middleware (auth, validation)
├── jobs/              # Scheduled tasks (SLA monitoring)
├── config/            # Configuration management
└── utils/             # Helper functions, logger
```

**Key Design Patterns:**

- **Repository Pattern**: Abstract database operations
- **Service Layer**: Encapsulate business logic
- **Dependency Injection**: Services receive dependencies
- **Middleware Chain**: Request processing pipeline
- **Error Handling**: Centralized error responses

### 3. Data Layer

**Database Design Principles:**

- **Normalization**: 3NF to reduce redundancy
- **Indexing**: Optimized for common queries
- **Constraints**: Foreign keys, unique constraints
- **Soft Deletes**: is_active flag for users
- **Audit Trail**: Comprehensive logging

---

## Security Architecture

### Authentication Flow

```
┌─────────┐     POST /auth/login     ┌─────────┐
│ Client  │─────────────────────────►│  API    │
│         │◄─────────────────────────│ Server  │
└─────────┘  { accessToken,          └─────────┘
              refreshToken }              │
     │                                    │
     │  Authorization: Bearer <token>     ▼
     │                              ┌─────────┐
     └─────────────────────────────►│  Auth   │
                                    │Middleware│
                                    └─────────┘
                                         │
                          ┌──────────────┼──────────────┐
                          ▼              ▼              ▼
                    ┌─────────┐    ┌─────────┐    ┌─────────┐
                    │ Valid   │    │ Expired │    │ Invalid │
                    │ Token   │    │ Token   │    │ Token   │
                    └─────────┘    └─────────┘    └─────────┘
                         │              │              │
                         ▼              ▼              ▼
                    Continue       Refresh         401 Error
                    Request        Token
```

### Security Measures

| Layer          | Measure       | Implementation          |
| -------------- | ------------- | ----------------------- |
| Transport      | TLS/HTTPS     | Nginx SSL termination   |
| Authentication | JWT           | Access + Refresh tokens |
| Authorization  | RBAC          | Role-based guards       |
| Input          | Validation    | Express-validator       |
| Rate Limiting  | Throttling    | Express rate limiter    |
| Passwords      | Hashing       | bcrypt (12 rounds)      |
| XSS            | Sanitization  | Input sanitization      |
| CSRF           | Tokens        | SameSite cookies        |
| SQL Injection  | Parameterized | Prepared statements     |

---

## Data Flow

### Complaint Submission Flow

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│ Citizen  │───►│ Frontend │───►│ Backend  │───►│ Database │───►│  Staff   │
│          │    │          │    │          │    │          │    │          │
└──────────┘    └──────────┘    └──────────┘    └──────────┘    └──────────┘
     │               │               │               │               │
     │  1. Fill      │               │               │               │
     │     Form      │               │               │               │
     │───────────────►               │               │               │
     │               │  2. POST      │               │               │
     │               │     /api/     │               │               │
     │               │  complaints   │               │               │
     │               │───────────────►               │               │
     │               │               │  3. Validate  │               │
     │               │               │     & Save    │               │
     │               │               │───────────────►               │
     │               │               │               │               │
     │               │               │  4. Calculate │               │
     │               │               │     SLA       │               │
     │               │               │◄──────────────│               │
     │               │               │               │               │
     │               │               │  5. Create    │               │
     │               │               │     Notif.    │               │
     │               │               │───────────────►               │
     │               │               │               │  6. Notify    │
     │               │               │               │───────────────►
     │               │  7. Return    │               │               │
     │               │     Tracking  │               │               │
     │               │◄──────────────│               │               │
     │  8. Display   │               │               │               │
     │     Success   │               │               │               │
     │◄──────────────│               │               │               │
```

---

## Scalability Considerations

### Horizontal Scaling

```
                    ┌─────────────────┐
                    │  Load Balancer  │
                    │     (Nginx)     │
                    └────────┬────────┘
                             │
          ┌──────────────────┼──────────────────┐
          │                  │                  │
          ▼                  ▼                  ▼
    ┌──────────┐       ┌──────────┐       ┌──────────┐
    │ API-1    │       │ API-2    │       │ API-N    │
    │ Node.js  │       │ Node.js  │       │ Node.js  │
    └────┬─────┘       └────┬─────┘       └────┬─────┘
         │                  │                  │
         └──────────────────┼──────────────────┘
                            │
                    ┌───────┴───────┐
                    │               │
              ┌─────▼─────┐   ┌─────▼─────┐
              │   MySQL   │   │   Redis   │
              │  Primary  │   │  Cluster  │
              └─────┬─────┘   └───────────┘
                    │
              ┌─────▼─────┐
              │   MySQL   │
              │  Replica  │
              └───────────┘
```

### Performance Optimizations

1. **Database**

   - Connection pooling
   - Read replicas for queries
   - Indexed frequently queried columns
   - Query optimization

2. **Caching**

   - Redis for session storage
   - Response caching for static data
   - Browser caching for assets

3. **Frontend**

   - Lazy loading modules
   - AOT compilation
   - Tree shaking
   - Image optimization

4. **API**
   - Compression (gzip)
   - Pagination for lists
   - Field selection
   - Request batching

---

## Monitoring & Observability

### Logging Strategy

| Level | Usage               | Example                       |
| ----- | ------------------- | ----------------------------- |
| ERROR | Unexpected failures | Database connection failure   |
| WARN  | Potential issues    | SLA deadline approaching      |
| INFO  | Important events    | User login, complaint created |
| DEBUG | Detailed tracing    | Query execution time          |

### Health Checks

```
GET /api/health
{
  "status": "healthy",
  "checks": {
    "database": "connected",
    "redis": "connected",
    "uptime": 86400
  }
}
```

### Metrics to Track

- Request latency (p50, p95, p99)
- Error rate
- Active connections
- Database query time
- Cache hit rate
- SLA compliance rate

---

## Deployment Architecture

### Docker Compose Stack

```yaml
services:
  frontend: # Angular + Nginx (Port 80)
  api: # Node.js Express (Port 3000)
  mysql: # MySQL 8.0 (Port 3306)
  redis: # Redis 7 (Port 6379)
```

### Production Recommendations

1. **Infrastructure**

   - Container orchestration (Kubernetes)
   - Auto-scaling policies
   - Multi-zone deployment

2. **Security**

   - WAF (Web Application Firewall)
   - DDoS protection
   - Secrets management (Vault)

3. **Reliability**
   - Database backups
   - Disaster recovery plan
   - Incident response runbook

---

## Future Considerations

1. **Microservices Migration**

   - Separate notification service
   - Dedicated file storage service
   - Analytics microservice

2. **Real-time Features**

   - WebSocket for live updates
   - Push notifications

3. **AI/ML Integration**

   - Auto-categorization
   - Priority prediction
   - Duplicate detection

4. **Multi-tenancy**
   - Department isolation
   - Custom workflows per agency
