-- =========================================================================================
-- UROCARE APOLO HOSPITAL - SUPABASE POSTGRESQL SCHEMA MIGRATION
-- =========================================================================================

-- 1. Custom Types / Enums
CREATE TYPE appointment_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled');
CREATE TYPE contact_status AS ENUM ('unread', 'read', 'resolved');
CREATE TYPE gender_enum AS ENUM ('male', 'female', 'other');

-- 2. Departments Table
CREATE TABLE public.departments (
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
CREATE TABLE public.patients (
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
CREATE TABLE public.doctors (
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
CREATE TABLE public.admins (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  access_level TEXT DEFAULT 'super_admin',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Appointments Table
CREATE TABLE public.appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES public.doctors(id) ON DELETE SET NULL,
  department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  status appointment_status DEFAULT 'pending'::appointment_status NOT NULL,
  reason TEXT,
  notes TEXT, 
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Contact Messages Table
CREATE TABLE public.contact_messages (
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

-- Enable RLS on all tables
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Departments: Anyone can read, only admins can write
CREATE POLICY "Departments are publicly viewable" ON public.departments FOR SELECT USING (true);
CREATE POLICY "Admins can modify departments" ON public.departments FOR ALL USING (EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid()));

-- Patients: Patients can view/update their own data, Admins and Doctors can view all
CREATE POLICY "Patients can view own data" ON public.patients FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Patients can update own data" ON public.patients FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Doctors and Admins can view all patients" ON public.patients FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.doctors WHERE id = auth.uid()) OR 
  EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid())
);

-- Doctors: Anyone can read doctor profiles, only admins or the doctor themselves can update
CREATE POLICY "Doctors are publicly viewable" ON public.doctors FOR SELECT USING (true);
CREATE POLICY "Doctors can update own profile" ON public.doctors FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can modify doctors" ON public.doctors FOR ALL USING (EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid()));

-- Admins: Only admins can view/modify admins
CREATE POLICY "Admins can view and modify admins" ON public.admins FOR ALL USING (EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid()));

-- Appointments: 
-- Patients can view/create their own, Doctors view their own, Admins view/modify all
CREATE POLICY "Patients can view own appointments" ON public.appointments FOR SELECT USING (patient_id = auth.uid());
CREATE POLICY "Patients can insert own appointments" ON public.appointments FOR INSERT WITH CHECK (patient_id = auth.uid());
CREATE POLICY "Doctors can view assigned appointments" ON public.appointments FOR SELECT USING (doctor_id = auth.uid());
CREATE POLICY "Doctors can update assigned appointments" ON public.appointments FOR UPDATE USING (doctor_id = auth.uid());
CREATE POLICY "Admins have full access to appointments" ON public.appointments FOR ALL USING (EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid()));

-- Contact Messages: Anyone can insert, only admins can view/update
CREATE POLICY "Anyone can insert contact messages" ON public.contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Only admins can view contact messages" ON public.contact_messages FOR SELECT USING (EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid()));
CREATE POLICY "Only admins can update contact messages" ON public.contact_messages FOR UPDATE USING (EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid()));
