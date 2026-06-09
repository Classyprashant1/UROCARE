-- =========================================================================================
-- UROCARE APOLO HOSPITAL - MIGRATION: DOCTOR SLOTS & DOUBLE BOOKING PREVENTION
-- =========================================================================================

ALTER TABLE public.doctors
ADD COLUMN morning_start_time TIME,
ADD COLUMN morning_end_time TIME,
ADD COLUMN evening_start_time TIME,
ADD COLUMN evening_end_time TIME,
ADD COLUMN slot_duration INTEGER DEFAULT 15;

ALTER TABLE public.appointments
ADD COLUMN appointment_slot TEXT;

-- UNIQUE CONSTRAINT for double booking prevention
ALTER TABLE public.appointments
ADD CONSTRAINT unique_doctor_appointment_time UNIQUE (doctor_id, appointment_date, appointment_time);
