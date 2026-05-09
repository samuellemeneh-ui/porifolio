# Testing Strategy for TanaCare

## Test Types

### Unit Tests
Testing individual functions and components:
\`\`\`bash
npm run test:unit
\`\`\`

**Test Coverage Areas:**
- API utilities (doctors, appointments, etc.)
- Form validation
- Date/time calculations
- Authentication logic

### Integration Tests
Testing feature workflows:
\`\`\`bash
npm run test:integration
\`\`\`

**Test Scenarios:**
- User signup and email verification
- Doctor profile creation
- Appointment booking workflow
- Doctor search and filtering
- Review submission

### End-to-End Tests
Full user journey testing:
\`\`\`bash
npm run test:e2e
\`\`\`

**Test Flows:**
- Patient: Sign up → Search doctors → Book appointment
- Doctor: Sign up → Create profile → Manage availability
- Admin: Verify doctors → View stats

## Manual Testing Checklist

### Authentication
- [ ] Patient sign up
- [ ] Doctor sign up
- [ ] Email confirmation
- [ ] Login with valid credentials
- [ ] Login with invalid credentials
- [ ] Password reset
- [ ] Logout

### Doctor Management
- [ ] Create doctor profile
- [ ] Edit doctor profile
- [ ] Upload profile picture
- [ ] Set specialization
- [ ] Set consultation fee
- [ ] Add qualifications

### Availability
- [ ] Set weekly hours
- [ ] Set time slot duration
- [ ] Set max slots per day
- [ ] Disable specific days
- [ ] Update availability

### Appointments
- [ ] Search doctors
- [ ] Filter by specialization
- [ ] View doctor profile
- [ ] Select appointment date
- [ ] Select time slot
- [ ] Choose consultation type
- [ ] Submit appointment
- [ ] Cancel appointment
- [ ] View appointment history

### Health Articles
- [ ] View article list
- [ ] Search articles
- [ ] Filter by category
- [ ] Read article
- [ ] Share article

### Reviews
- [ ] Leave review after appointment
- [ ] Submit anonymous review
- [ ] Rate doctor
- [ ] View doctor reviews
- [ ] See rating updates

## Performance Testing

### Metrics to Track
- Page load time < 3 seconds
- API response time < 500ms
- Search results < 1 second
- Database queries optimized

### Load Testing
- Simulate 100+ concurrent users
- Test peak hours
- Monitor server performance
- Identify bottlenecks

## Security Testing

### Areas to Test
- SQL injection attempts
- XSS vulnerability checks
- CSRF protection
- RLS policy enforcement
- Authentication bypass attempts
- Rate limiting

### Tools
- OWASP ZAP
- Burp Suite
- Manual penetration testing
