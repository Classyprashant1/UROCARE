-- Update the handle_new_user trigger function to gracefully handle Google OAuth metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_first_name TEXT;
  v_last_name TEXT;
  v_full_name TEXT;
BEGIN
  -- 1. Try explicit first_name / last_name from email signups
  v_first_name := NEW.raw_user_meta_data->>'first_name';
  v_last_name := NEW.raw_user_meta_data->>'last_name';
  
  -- 2. If not provided, try to extract from Google's name or full_name
  IF v_first_name IS NULL THEN
    v_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'Patient');
    v_first_name := split_part(v_full_name, ' ', 1);
    v_last_name := right(v_full_name, length(v_full_name) - length(v_first_name) - 1);
    IF v_last_name IS NULL OR v_last_name = '' THEN
      v_last_name := '';
    END IF;
  END IF;

  INSERT INTO public.patients (id, first_name, last_name, email)
  VALUES (
    NEW.id,
    COALESCE(v_first_name, 'Patient'),
    COALESCE(v_last_name, ''),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
