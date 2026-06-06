-- 1. Create the new join table
CREATE TABLE IF NOT EXISTS public.doctor_departments (
  doctor_id UUID REFERENCES public.doctors(id) ON DELETE CASCADE,
  department_id UUID REFERENCES public.departments(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY (doctor_id, department_id)
);

-- 2. Migrate existing data (Insert current department for each doctor into the join table)
INSERT INTO public.doctor_departments (doctor_id, department_id)
SELECT id, department_id 
FROM public.doctors 
WHERE department_id IS NOT NULL
ON CONFLICT DO NOTHING;

-- 3. Drop the old column from doctors table
ALTER TABLE public.doctors DROP COLUMN department_id;
