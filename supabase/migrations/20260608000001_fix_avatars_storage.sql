-- =========================================================================================
-- UROCARE APOLO HOSPITAL - MIGRATION: STORAGE (AVATARS) DOCTOR UPLOAD
-- =========================================================================================

-- Doctors can upload their own avatars
CREATE POLICY "Doctors can manage own avatars." 
ON storage.objects FOR ALL 
USING (
    bucket_id = 'avatars' AND 
    EXISTS (SELECT 1 FROM public.doctors WHERE id = auth.uid()) AND
    owner = auth.uid()
) WITH CHECK (
    bucket_id = 'avatars' AND 
    EXISTS (SELECT 1 FROM public.doctors WHERE id = auth.uid()) AND
    owner = auth.uid()
);
