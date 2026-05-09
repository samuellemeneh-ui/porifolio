# TanaCare - Telemedicine Platform

A comprehensive web-based telemedicine platform designed to bridge healthcare access gaps in Ethiopia by enabling patients to consult with qualified doctors via video, audio, or chat from anywhere.

## Features

### For Patients
- **Find Doctors**: Browse verified healthcare professionals by specialization
- **Book Appointments**: Real-time appointment scheduling with available time slots
- **Multiple Consultation Modes**: Video calls, audio calls, or text chat
- **Medical Records**: Maintain and track personal medical history
- **Health Resources**: Access educational articles and health tips
- **Leave Reviews**: Rate doctors and share consultation feedback

### For Doctors
- **Profile Management**: Set qualifications, specialization, and consultation fees
- **Availability Management**: Define working hours and time slots
- **Appointment Management**: View and manage patient consultations
- **Professional Stats**: Track ratings, consultations, and patient feedback

### For Admins
- **Dashboard**: Monitor platform activity
- **Doctor Verification**: Verify and manage doctor profiles
- **User Management**: Manage patients and providers
- **Content Moderation**: Moderate health articles and reviews

## Technology Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS v4** - Utility-first styling
- **shadcn/ui** - Pre-built UI components
- **SWR** - Data fetching and caching

### Backend
- **Supabase** - PostgreSQL database with authentication
- **Row-Level Security (RLS)** - Data access control
- **Server Actions** - Secure server-side operations
- **Vercel** - Deployment platform

### Real-time Communication
- **WebRTC** - For video/audio calls (stub implementation)
- **Socket.io** - For real-time chat (stub implementation)

## Project Structure

\`\`\`
/
├── app/
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Landing page
│   ├── globals.css             # Global styles
│   ├── auth/                   # Authentication pages
│   │   ├── login/
│   │   ├── sign-up/
│   │   └── sign-up-success/
│   ├── dashboard/              # User dashboards
│   │   ├── page.tsx
│   │   ├── doctor/
│   │   ├── appointments/
│   │   └── medical-history/
│   ├── doctors/                # Doctor browsing & booking
│   ├── health-articles/        # Health education hub
│   └── appointments/           # Consultation rooms
├── lib/
│   ├── supabase/               # Supabase client setup
│   ├── api/                    # API utilities
│   ├── types/                  # TypeScript types
│   └── constants.ts            # App constants
├── components/
│   └── ui/                     # shadcn components
├── scripts/
│   ├── 001_create_tables.sql   # Database schema
│   └── 002_create_profile_trigger.sql
└── middleware.ts               # Auth middleware
\`\`\`

## Database Schema

### Core Tables
- **users** - User profiles (extends Supabase auth.users)
- **doctors** - Doctor profiles with specialization and ratings
- **doctor_availability** - Working hours and time slots
- **appointments** - Consultation bookings
- **medical_history** - Patient health records
- **prescriptions** - Digital prescriptions
- **health_articles** - Blog posts and health tips
- **reviews** - Doctor ratings and feedback

All tables have Row-Level Security (RLS) enabled for data protection.

## Installation & Setup

### Prerequisites
- Node.js 18+
- Supabase project
- Vercel account (for deployment)

### Local Development

1. **Clone the repository**
\`\`\`bash
git clone <repository-url>
cd tanaca-re
\`\`\`

2. **Install dependencies**
\`\`\`bash
npm install
\`\`\`

3. **Setup Supabase**
- Create a Supabase project
- Run database migration scripts in order:
  - `001_create_tables.sql`
  - `002_create_profile_trigger.sql`

4. **Configure environment variables**
Create a `.env.local` file:
\`\`\`
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000
\`\`\`

5. **Run the development server**
\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Migration

The database schema is version-controlled in the `scripts/` folder:

1. **001_create_tables.sql**
   - Creates all core tables
   - Enables Row-Level Security (RLS)
   - Creates security policies
   - Creates performance indexes

2. **002_create_profile_trigger.sql**
   - Auto-creates user profiles on signup
   - Captures user metadata

To run migrations, execute the SQL files in order using the Supabase SQL editor or programmatically.

## API Routes & Server Actions

### Doctors API
- `GET /api/doctors` - List all verified doctors
- `GET /api/doctors/:id` - Get doctor details
- `POST /api/doctors` - Create doctor profile
- `PUT /api/doctors/:id` - Update doctor profile

### Appointments API
- `GET /api/appointments` - List user appointments
- `POST /api/appointments` - Create appointment
- `GET /api/appointments/:id` - Get appointment details
- `PUT /api/appointments/:id` - Update appointment

### Health Articles API
- `GET /api/health-articles` - List published articles
- `GET /api/health-articles/:slug` - Get article content

## Authentication Flow

1. **Sign Up**: User creates account with email/password
2. **Email Verification**: Supabase sends confirmation link
3. **Profile Creation**: Trigger auto-creates user profile
4. **Role Assignment**: User type (patient/doctor) set at signup
5. **Access Control**: RLS policies enforce user access

## Security Features

### Row-Level Security (RLS)
All tables use PostgreSQL RLS to ensure:
- Users can only access their own data
- Doctors can manage their profiles
- Admins have elevated permissions
- Patients cannot access other users' medical records

### Authentication
- Email/password authentication via Supabase Auth
- JWT tokens for session management
- Middleware protects authenticated routes
- Secure server-side operations via Server Actions

### Data Encryption
- All data transmitted via HTTPS
- Passwords hashed by Supabase
- Sensitive data protected by RLS

## Deployment

### Deploy to Vercel

1. **Push to GitHub**
\`\`\`bash
git push origin main
\`\`\`

2. **Import to Vercel**
- Go to vercel.com
- Import your GitHub repository
- Add environment variables
- Deploy

### Environment Variables for Production
\`\`\`
NEXT_PUBLIC_SUPABASE_URL=production_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=production_key
\`\`\`

## Future Enhancements

### Phase 2
- WebRTC video call implementation
- Real-time chat system
- Payment integration
- SMS notifications
- Mobile app (React Native)

### Phase 3
- AI-powered symptom checker
- Prescription fulfillment integration
- Insurance claims management
- Advanced analytics dashboard
- Multi-language support

## Testing

### Unit Tests (to be added)
\`\`\`bash
npm run test
\`\`\`

### E2E Tests (to be added)
\`\`\`bash
npm run test:e2e
\`\`\`

### Manual Testing Checklist
- [ ] Sign up flow for patients
- [ ] Sign up flow for doctors
- [ ] Doctor profile creation
- [ ] Availability scheduling
- [ ] Doctor search and filtering
- [ ] Appointment booking
- [ ] Appointment management
- [ ] Health article browsing
- [ ] Review submission

## CI/CD Pipeline (GitHub Actions)

Create `.github/workflows/deploy.yml`:
\`\`\`yaml
name: Deploy to Vercel
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: vercel/action@main
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
\`\`\`

## Monitoring & Analytics

- **Error Tracking**: Vercel Error Reports
- **Performance**: Vercel Analytics
- **Database Logs**: Supabase Logs
- **User Analytics**: Implement using Vercel Analytics

## Support & Contribution

For issues or contributions:
1. Create an issue with detailed description
2. Submit pull requests to the develop branch
3. Follow code style guidelines
4. Write tests for new features

## License

MIT License - See LICENSE file for details

## Contact

For questions or support, contact: support@tanacare.com

---

**TanaCare**: Bringing Healthcare to Ethiopia, One Consultation at a Time
