-- =========================================================================================
-- UROCARE APOLO HOSPITAL - MIGRATION 4: MEDICAL RECORDS
-- =========================================================================================

-- 1. Prescriptions Table
CREATE TABLE public.prescriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES public.doctors(id) ON DELETE SET NULL,
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
  medications JSONB NOT NULL, -- Array of objects: { name, dosage, frequency, duration }
  instructions TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Medical History Table
CREATE TABLE public.medical_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES public.doctors(id) ON DELETE SET NULL,
  condition_type TEXT NOT NULL, -- e.g., 'Chronic', 'Surgery', 'Allergy'
  description TEXT NOT NULL,
  date_recorded DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. RLS Policies

ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_history ENABLE ROW LEVEL SECURITY;

-- Prescriptions RLS
CREATE POLICY "Patients can view own prescriptions" ON public.prescriptions FOR SELECT USING (patient_id = auth.uid());
CREATE POLICY "Doctors can view assigned prescriptions" ON public.prescriptions FOR SELECT USING (doctor_id = auth.uid());
CREATE POLICY "Doctors can insert prescriptions" ON public.prescriptions FOR INSERT WITH CHECK (doctor_id = auth.uid());
CREATE POLICY "Admins have full access to prescriptions" ON public.prescriptions FOR ALL USING (EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid()));

-- Medical History RLS
CREATE POLICY "Patients can view own history" ON public.medical_history FOR SELECT USING (patient_id = auth.uid());
CREATE POLICY "Doctors can view assigned patient history" ON public.medical_history FOR SELECT USING (EXISTS (SELECT 1 FROM public.doctors WHERE id = auth.uid())); -- Doctors can view all history (typical EMR behavior)
CREATE POLICY "Doctors can insert history" ON public.medical_history FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.doctors WHERE id = auth.uid()));
CREATE POLICY "Admins have full access to history" ON public.medical_history FOR ALL USING (EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid()));
