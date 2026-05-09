-- TanaCare Telemedicine Platform - Database Schema
-- This script creates all core tables with RLS policies

-- Users Profile (extends auth.users)
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  user_type text not null check (user_type in ('patient', 'doctor', 'admin')),
  first_name text,
  last_name text,
  phone_number text,
  profile_picture_url text,
  bio text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Doctors Table
create table if not exists public.doctors (
  id uuid primary key references auth.users(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  license_number text unique not null,
  specialization text not null,
  experience_years integer,
  qualification text,
  consultation_fee_birr numeric(10, 2),
  is_verified boolean default false,
  is_active boolean default true,
  rating numeric(3, 2) default 0.00,
  total_consultations integer default 0,
  response_time_minutes integer,
  languages text array,
  certifications text array,
  bio_extended text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Doctor Availability
create table if not exists public.doctor_availability (
  id uuid primary key default gen_random_uuid(),
  doctor_id uuid not null references public.doctors(id) on delete cascade,
  day_of_week text not null check (day_of_week in ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')),
  start_time time not null,
  end_time time not null,
  slot_duration_minutes integer default 30,
  max_slots_per_day integer default 8,
  is_available boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Appointments Table
create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.users(id) on delete cascade,
  doctor_id uuid not null references public.doctors(id) on delete cascade,
  appointment_date date not null,
  start_time time not null,
  end_time time not null,
  status text not null default 'scheduled' check (status in ('scheduled', 'ongoing', 'completed', 'cancelled', 'no-show')),
  appointment_type text not null check (appointment_type in ('video', 'audio', 'chat')),
  reason_for_visit text,
  notes text,
  cost_birr numeric(10, 2),
  payment_status text default 'pending' check (payment_status in ('pending', 'completed', 'refunded')),
  consultation_notes text,
  prescriptions jsonb,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Medical History
create table if not exists public.medical_history (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.users(id) on delete cascade,
  condition_name text not null,
  diagnosis_date date,
  status text check (status in ('active', 'inactive', 'resolved')),
  notes text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Prescriptions
create table if not exists public.prescriptions (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid not null references public.appointments(id) on delete cascade,
  patient_id uuid not null references public.users(id) on delete cascade,
  doctor_id uuid not null references public.doctors(id) on delete cascade,
  medication_name text not null,
  dosage text not null,
  frequency text not null,
  duration_days integer,
  instructions text,
  is_refillable boolean default false,
  created_at timestamp with time zone default now(),
  expires_at timestamp with time zone
);

-- Health Articles/Blog Posts
create table if not exists public.health_articles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  content text not null,
  excerpt text,
  category text not null,
  featured_image_url text,
  author_id uuid references public.users(id) on delete set null,
  is_published boolean default false,
  published_at timestamp with time zone,
  view_count integer default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Reviews and Ratings
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid not null references public.appointments(id) on delete cascade,
  patient_id uuid not null references public.users(id) on delete cascade,
  doctor_id uuid not null references public.doctors(id) on delete cascade,
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text,
  is_anonymous boolean default false,
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.users enable row level security;
alter table public.doctors enable row level security;
alter table public.doctor_availability enable row level security;
alter table public.appointments enable row level security;
alter table public.medical_history enable row level security;
alter table public.prescriptions enable row level security;
alter table public.health_articles enable row level security;
alter table public.reviews enable row level security;

-- RLS Policies - Users Table
create policy "users_select_own"
  on public.users for select
  using (auth.uid() = id);

create policy "users_insert_own"
  on public.users for insert
  with check (auth.uid() = id);

create policy "users_update_own"
  on public.users for update
  using (auth.uid() = id);

-- RLS Policies - Doctors Table (read-only for patients, full for doctors)
create policy "doctors_select_all"
  on public.doctors for select
  using (true);

create policy "doctors_insert_own"
  on public.doctors for insert
  with check (auth.uid() = id);

create policy "doctors_update_own"
  on public.doctors for update
  using (auth.uid() = id);

-- RLS Policies - Doctor Availability (public read)
create policy "doctor_availability_select_all"
  on public.doctor_availability for select
  using (true);

create policy "doctor_availability_manage_own"
  on public.doctor_availability for insert
  with check (
    exists (
      select 1 from public.doctors
      where doctors.id = doctor_availability.doctor_id
      and doctors.id = auth.uid()
    )
  );

-- RLS Policies - Appointments
create policy "appointments_select_own"
  on public.appointments for select
  using (
    auth.uid() = patient_id or
    auth.uid() = doctor_id or
    exists (select 1 from public.users where id = auth.uid() and user_type = 'admin')
  );

create policy "appointments_insert_own"
  on public.appointments for insert
  with check (auth.uid() = patient_id);

create policy "appointments_update_own"
  on public.appointments for update
  using (auth.uid() = patient_id or auth.uid() = doctor_id);

-- RLS Policies - Medical History
create policy "medical_history_select_own"
  on public.medical_history for select
  using (auth.uid() = patient_id);

create policy "medical_history_insert_own"
  on public.medical_history for insert
  with check (auth.uid() = patient_id);

-- RLS Policies - Prescriptions
create policy "prescriptions_select_own"
  on public.prescriptions for select
  using (
    auth.uid() = patient_id or
    auth.uid() = doctor_id or
    exists (
      select 1 from public.appointments
      where appointments.id = appointment_id
      and (appointments.patient_id = auth.uid() or appointments.doctor_id = auth.uid())
    )
  );

-- RLS Policies - Health Articles
create policy "articles_select_published"
  on public.health_articles for select
  using (is_published = true or auth.uid() = author_id);

create policy "articles_manage_own"
  on public.health_articles for insert
  with check (auth.uid() = author_id);

-- RLS Policies - Reviews
create policy "reviews_select_all"
  on public.reviews for select
  using (true);

create policy "reviews_insert_own"
  on public.reviews for insert
  with check (auth.uid() = patient_id);

-- Indexes for performance
create index if not exists idx_doctors_specialization on public.doctors(specialization);
create index if not exists idx_doctors_verified on public.doctors(is_verified);
create index if not exists idx_appointments_patient_id on public.appointments(patient_id);
create index if not exists idx_appointments_doctor_id on public.appointments(doctor_id);
create index if not exists idx_appointments_date on public.appointments(appointment_date);
create index if not exists idx_appointments_status on public.appointments(status);
create index if not exists idx_health_articles_slug on public.health_articles(slug);
create index if not exists idx_health_articles_published on public.health_articles(is_published);
create index if not exists idx_prescriptions_patient_id on public.prescriptions(patient_id);
create index if not exists idx_reviews_doctor_id on public.reviews(doctor_id);
create index if not exists idx_users_email on public.users(email);
