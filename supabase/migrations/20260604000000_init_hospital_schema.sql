-- =========================================================================================
-- UROCARE APOLO HOSPITAL - SUPABASE POSTGRESQL SCHEMA MIGRATION
-- =========================================================================================

-- 0. Drop existing tables and types to allow re-running the script safely
DROP TABLE IF EXISTS public.contact_messages CASCADE;
DROP TABLE IF EXISTS public.appointments CASCADE;
DROP TABLE IF EXISTS public.admins CASCADE;
DROP TABLE IF EXISTS public.doctors CASCADE;
DROP TABLE IF EXISTS public.patients CASCADE;
DROP TABLE IF EXISTS public.departments CASCADE;
DROP TYPE IF EXISTS appointment_status CASCADE;
DROP TYPE IF EXISTS contact_status CASCADE;
DROP TYPE IF EXISTS gender_enum CASCADE;

-- 1. Custom Types / Enums
CREATE TYPE appointment_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled');
CREATE TYPE contact_status AS ENUM ('unread', 'read', 'resolved');
CREATE TYPE gender_enum AS ENUM ('male', 'female', 'other');

-- 2. Departments Table
CREATE TABLE IF NOT EXISTS public.departments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  is_coe BOOLEAN DEFAULT false,
  services TEXT[], 
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Patients Table (Linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS public.patients (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  dob DATE,
  gender gender_enum,
  blood_group TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Doctors Table (Linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS public.doctors (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  designation TEXT NOT NULL,
  qualifications TEXT NOT NULL,
  experience TEXT NOT NULL,
  consultation_fee DECIMAL(10,2) NOT NULL,
  languages TEXT[],
  bio TEXT,
  available_days TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Admins Table (Linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS public.admins (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  access_level TEXT DEFAULT 'super_admin',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Appointments Table
CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  patient_name TEXT NOT NULL,
  patient_phone TEXT NOT NULL,
  doctor_id TEXT,
  department_id TEXT,
  appointment_date DATE NOT NULL,
  appointment_time TEXT NOT NULL,
  status appointment_status DEFAULT 'pending'::appointment_status NOT NULL,
  reason TEXT,
  notes TEXT, 
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Contact Messages Table
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status contact_status DEFAULT 'unread'::contact_status NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. Doctor Leaves Table
CREATE TABLE IF NOT EXISTS public.doctor_leaves (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  doctor_id TEXT NOT NULL,
  leave_date DATE NOT NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =========================================================================================
-- UPDATED_AT TRIGGERS
-- =========================================================================================
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_departments_modtime BEFORE UPDATE ON public.departments FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_patients_modtime BEFORE UPDATE ON public.patients FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_doctors_modtime BEFORE UPDATE ON public.doctors FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_admins_modtime BEFORE UPDATE ON public.admins FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_appointments_modtime BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_contact_messages_modtime BEFORE UPDATE ON public.contact_messages FOR EACH ROW EXECUTE PROCEDURE update_modified_column();


-- =========================================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================================

-- Create a security definer function to check admin status without causing infinite recursion
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admins WHERE id = auth.uid()
  );
$$;

-- Enable RLS on all tables
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctor_leaves ENABLE ROW LEVEL SECURITY;

-- Departments: Anyone can read, only admins can write
CREATE POLICY "Departments are publicly viewable" ON public.departments FOR SELECT USING (true);
CREATE POLICY "Admins can modify departments" ON public.departments FOR ALL USING (public.is_admin());

-- Patients: Patients can view/update their own data, Admins and Doctors can view all
CREATE POLICY "Patients can view own data" ON public.patients FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Patients can update own data" ON public.patients FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Doctors and Admins can view all patients" ON public.patients FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.doctors WHERE id = auth.uid()) OR 
  public.is_admin()
);

-- Doctors: Anyone can read doctor profiles, only admins or the doctor themselves can update
CREATE POLICY "Doctors are publicly viewable" ON public.doctors FOR SELECT USING (true);
CREATE POLICY "Doctors can update own profile" ON public.doctors FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can modify doctors" ON public.doctors FOR ALL USING (public.is_admin());

-- Doctor Leaves: Doctors can manage their own, admins can view/manage all
CREATE POLICY "Doctors can manage own leaves" ON public.doctor_leaves FOR ALL USING (doctor_id = auth.uid()::text);
CREATE POLICY "Admins can manage all leaves" ON public.doctor_leaves FOR ALL USING (public.is_admin());

-- Admins: Only admins can view/modify admins
CREATE POLICY "Admins can view and modify admins" ON public.admins FOR ALL USING (public.is_admin());

-- Appointments: 
-- Patients can view/create/update their own, Doctors view their own, Admins view/modify all
CREATE POLICY "Patients can view own appointments" ON public.appointments FOR SELECT USING (patient_id = auth.uid());
CREATE POLICY "Patients can insert own appointments" ON public.appointments FOR INSERT WITH CHECK (patient_id = auth.uid());
CREATE POLICY "Patients can update own appointments" ON public.appointments FOR UPDATE USING (patient_id = auth.uid());
CREATE POLICY "Doctors can view assigned appointments" ON public.appointments FOR SELECT USING (doctor_id = auth.uid()::text);
CREATE POLICY "Doctors can update assigned appointments" ON public.appointments FOR UPDATE USING (doctor_id = auth.uid()::text);
CREATE POLICY "Admins have full access to appointments" ON public.appointments FOR ALL USING (public.is_admin());

-- Contact Messages: Anyone can insert, only admins can view/update
CREATE POLICY "Anyone can insert contact messages" ON public.contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Only admins can view contact messages" ON public.contact_messages FOR SELECT USING (public.is_admin());
CREATE POLICY "Only admins can update contact messages" ON public.contact_messages FOR UPDATE USING (public.is_admin());

-- =========================================================================================
-- AUTH TRIGGERS & BACKFILL
-- =========================================================================================

-- Function to automatically create a patient profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.patients (id, first_name, last_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', 'Patient'),
    COALESCE(NEW.raw_user_meta_data->>'last_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new signups
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Backfill existing auth users who don't have a patient profile yet
INSERT INTO public.patients (id, first_name, last_name)
SELECT id, 
       COALESCE(raw_user_meta_data->>'first_name', 'Patient'), 
       COALESCE(raw_user_meta_data->>'last_name', '')
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.patients);
