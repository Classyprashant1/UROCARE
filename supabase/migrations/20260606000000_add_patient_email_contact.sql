-- Add email and emergency_contact fields to patients table
ALTER TABLE public.patients
ADD COLUMN email TEXT,
ADD COLUMN emergency_contact TEXT;

-- Backfill email from auth.users
UPDATE public.patients p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id;

-- Update the handle_new_user trigger function to insert email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.patients (id, first_name, last_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', 'Patient'),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
