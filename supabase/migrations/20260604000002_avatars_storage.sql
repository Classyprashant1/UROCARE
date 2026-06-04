-- =========================================================================================
-- UROCARE APOLO HOSPITAL - MIGRATION 3: STORAGE (AVATARS)
-- =========================================================================================

-- Create a public storage bucket for avatars
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS Policies

-- Anyone can view avatars
CREATE POLICY "Avatar images are publicly accessible." 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'avatars' );

-- Only admins can upload avatars (Note: Auth is required to determine admin status, 
-- but since Supabase Storage RLS connects to the auth schema, we can check it).
CREATE POLICY "Admins can upload avatars." 
ON storage.objects FOR INSERT 
WITH CHECK (
    bucket_id = 'avatars' AND 
    EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid())
);

CREATE POLICY "Admins can update avatars." 
ON storage.objects FOR UPDATE 
USING (
    bucket_id = 'avatars' AND 
    EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid())
);

CREATE POLICY "Admins can delete avatars." 
ON storage.objects FOR DELETE 
USING (
    bucket_id = 'avatars' AND 
    EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid())
);
