# TanaCare API Documentation

## Base URL
\`https://tanacare.com/api\`

## Authentication
All requests require Supabase authentication token in Authorization header:
\`\`\`
Authorization: Bearer <jwt-token>
\`\`\`

## Doctors Endpoints

### List Doctors
\`\`\`
GET /doctors
Query Parameters:
  - specialization (optional)
  - isVerified (optional)

Response:
{
  "data": [
    {
      "id": "uuid",
      "specialization": "Cardiology",
      "consultation_fee_birr": 500,
      "rating": 4.5,
      "users": {
        "first_name": "John",
        "last_name": "Doe"
      }
    }
  ]
}
\`\`\`

### Get Doctor Details
\`\`\`
GET /doctors/:doctorId

Response:
{
  "id": "uuid",
  "specialization": "Cardiology",
  "experience_years": 10,
  "consultation_fee_birr": 500,
  "rating": 4.5,
  "total_consultations": 150,
  "users": {...}
}
\`\`\`

## Appointments Endpoints

### List Appointments
\`\`\`
GET /appointments

Response:
{
  "data": [
    {
      "id": "uuid",
      "appointment_date": "2025-01-15",
      "start_time": "10:00",
      "status": "scheduled",
      "doctor_id": "uuid"
    }
  ]
}
\`\`\`

### Create Appointment
\`\`\`
POST /appointments

Body:
{
  "doctor_id": "uuid",
  "appointment_date": "2025-01-15",
  "start_time": "10:00",
  "appointment_type": "video",
  "reason_for_visit": "Consultation"
}

Response:
{
  "id": "uuid",
  "status": "scheduled"
}
\`\`\`

### Get Available Slots
\`\`\`
GET /appointments/slots/:doctorId
Query Parameters:
  - date (required): YYYY-MM-DD

Response:
{
  "slots": [
    {"start_time": "09:00", "end_time": "09:30"},
    {"start_time": "09:30", "end_time": "10:00"}
  ]
}
\`\`\`

## Health Articles Endpoints

### List Articles
\`\`\`
GET /health-articles
Query Parameters:
  - category (optional)
  - search (optional)

Response:
{
  "data": [
    {
      "id": "uuid",
      "title": "5 Tips...",
      "slug": "5-tips",
      "excerpt": "...",
      "category": "Wellness"
    }
  ]
}
\`\`\`

## Error Responses

### 401 Unauthorized
\`\`\`json
{
  "error": "Unauthorized",
  "message": "JWT token expired"
}
\`\`\`

### 404 Not Found
\`\`\`json
{
  "error": "Not Found",
  "message": "Resource not found"
}
\`\`\`

### 500 Server Error
\`\`\`json
{
  "error": "Internal Server Error",
  "message": "Something went wrong"
}
\`\`\`
\`\`\`
