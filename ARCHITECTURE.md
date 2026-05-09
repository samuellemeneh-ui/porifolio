# TanaCare Architecture

## System Overview

TanaCare is a modern, scalable telemedicine platform built with Next.js 16 and Supabase.

\`\`\`
┌─────────────┐
│   Clients   │ (Web Browser, Mobile)
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────┐
│    Next.js Application (SSR/SSG)    │
│  - App Router                       │
│  - Server Components                │
│  - Server Actions                   │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│      Supabase Platform              │
│  - PostgreSQL Database              │
│  - Row-Level Security (RLS)         │
│  - Authentication                   │
│  - Real-time Subscriptions          │
└─────────────────────────────────────┘
\`\`\`

## Authentication Flow

1. User visits landing page
2. Clicks "Sign Up" or "Login"
3. Submits credentials
4. Supabase creates auth user
5. Trigger auto-creates user profile
6. JWT token stored in cookie
7. Middleware validates session
8. Redirected to dashboard

## Data Flow

### Appointment Booking
1. Patient views doctor profile
2. Selects date and time
3. System checks availability
4. Finds available slots
5. Patient books appointment
6. Appointment created in database
7. Doctor notified
8. Both receive confirmation

### Doctor Availability
1. Doctor logs in
2. Navigates to availability page
3. Sets weekly working hours
4. System generates time slots
5. Data stored with RLS protection
6. Used for appointment booking

## Database Design

### Entities
- **Users**: Core user profiles
- **Doctors**: Extended doctor data
- **Patients**: Patient-specific data (implicit via user_type)
- **Appointments**: Booking records
- **Medical History**: Patient health records
- **Reviews**: Doctor ratings
- **Articles**: Health education content

### Relationships
\`\`\`
users ──┬─── doctors
        ├─── appointments (patient_id)
        ├─── appointments (doctor_id)
        ├─── medical_history
        ├─── prescriptions
        ├─── reviews
        └─── health_articles

doctor_availability ─── doctors
\`\`\`

## Security Architecture

### Authentication
- Email/password via Supabase Auth
- JWT tokens in httpOnly cookies
- Token refresh via middleware
- Session management

### Authorization (RLS)
- Row-level security on all tables
- User isolation policies
- Role-based access (patient/doctor/admin)
- Admin override policies

### Data Protection
- HTTPS only
- Encrypted at rest
- Secrets in environment variables
- No sensitive data in logs

## API Architecture

### Server Actions
- `lib/api/doctors.ts` - Doctor operations
- `lib/api/appointments.ts` - Appointment operations
- Direct database access with RLS
- Type-safe with TypeScript

### Route Handlers (Future)
- `/api/webhooks/` - External integrations
- `/api/health/` - Health checks
- `/api/metrics/` - Analytics

## Performance Optimization

### Frontend
- Image optimization
- Code splitting
- Lazy component loading
- Tailwind CSS purging
- Bundle analysis

### Backend
- Database indexes on common queries
- RLS policy optimization
- Query caching where appropriate
- Connection pooling

### Caching Strategy
- Static pages: ISR (60s)
- User data: SWR client-side
- Doctor availability: Revalidated on change
- Articles: ISR (3600s)

## Scalability Considerations

### Horizontal Scaling
- Vercel auto-scaling
- Supabase connection pooling
- Database replicas for reads
- CDN for static assets

### Vertical Scaling
- Upgrade Supabase plan
- Increase database resources
- Optimize slow queries
- Archive old data

## Monitoring & Observability

### Metrics
- Page load times
- API response times
- Database query performance
- Error rates
- User sessions

### Logging
- Vercel server logs
- Supabase query logs
- Client-side errors
- Performance metrics

### Alerts
- High error rate
- Slow database queries
- Failed deployments
- Security events

## Disaster Recovery

### Backup Strategy
- Daily automated backups (Supabase)
- Manual backups before releases
- Point-in-time recovery capability
- Tested restoration procedures

### Failover Plan
- Identify critical systems
- Maintain documentation
- Practice recovery procedures
- Keep security keys secure
\`\`\`
