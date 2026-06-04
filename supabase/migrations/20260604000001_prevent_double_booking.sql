-- =========================================================================================
-- UROCARE APOLO HOSPITAL - MIGRATION 2: PREVENT DOUBLE BOOKING
-- =========================================================================================

-- We want to prevent two appointments from having the exact same doctor, date, and time, 
-- UNLESS one of them is already cancelled (cancelled appointments shouldn't block new ones).

-- Since PostgreSQL allows partial unique indexes, we create a unique index for active appointments.
CREATE UNIQUE INDEX idx_unique_active_appointment 
ON public.appointments (doctor_id, appointment_date, appointment_time)
WHERE status != 'cancelled';
