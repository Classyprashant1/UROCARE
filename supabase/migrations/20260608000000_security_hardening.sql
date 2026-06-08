-- =========================================================================================
-- UROCARE APOLO HOSPITAL - SECURITY HARDENING (REVISION)
-- =========================================================================================

-- Note: We no longer rely on auth.users user_metadata for role authorization,
-- so we do not attempt to modify the restricted auth schema here.
-- Middleware and actions now query the secure 'admins' and 'doctors' tables directly.

-- 1. APPOINTMENTS RLS ENFORCEMENT AT COLUMN LEVEL
-- RLS allows Patients to UPDATE their own appointments. 
-- Without column-level restriction, a patient could change their appointment status 
-- to 'confirmed' or hijack an appointment by changing doctor_id.
CREATE OR REPLACE FUNCTION public.enforce_appointments_update_security()
RETURNS TRIGGER AS $$
BEGIN
  -- If it's an admin (via our custom is_admin check), let them do anything
  IF public.is_admin() THEN
    RETURN NEW;
  END IF;

  -- For everyone else (patients & doctors), these columns are strictly IMMUTABLE:
  IF NEW.patient_id IS DISTINCT FROM OLD.patient_id OR
     NEW.department_id IS DISTINCT FROM OLD.department_id OR
     NEW.doctor_id IS DISTINCT FROM OLD.doctor_id 
  THEN
    RAISE EXCEPTION 'Unauthorized attempt to modify immutable appointment fields.';
  END IF;

  -- Check Patient restrictions
  IF OLD.patient_id = auth.uid() THEN
    -- Patients can only change status to 'cancelled'
    -- If they try to change the status to anything else, or if they change the date/time (maybe we want to allow rescheduling? Let's just allow what's strictly necessary)
    IF NEW.status IS DISTINCT FROM OLD.status AND NEW.status != 'cancelled'::appointment_status THEN
      RAISE EXCEPTION 'Patients can only cancel appointments.';
    END IF;
  END IF;

  -- Check Doctor restrictions
  IF OLD.doctor_id::uuid = auth.uid() THEN
    -- Doctors are permitted to update 'status' and 'notes'
    -- Prevent doctors from modifying patient details
    IF NEW.patient_name IS DISTINCT FROM OLD.patient_name OR
       NEW.patient_phone IS DISTINCT FROM OLD.patient_phone OR
       NEW.appointment_date IS DISTINCT FROM OLD.appointment_date OR
       NEW.appointment_time IS DISTINCT FROM OLD.appointment_time OR
       NEW.reason IS DISTINCT FROM OLD.reason
    THEN
      RAISE EXCEPTION 'Doctors cannot modify core appointment details.';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS enforce_appointments_update_security ON public.appointments;
CREATE TRIGGER enforce_appointments_update_security
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW
  EXECUTE PROCEDURE public.enforce_appointments_update_security();
