'use server'

import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { DoctorSchema } from '@/lib/schema'
import { handleZodError, handleSupabaseError, DbResult } from '@/utils/db'
import { logger } from '@/utils/logger'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

export async function addDoctor(
  formData: FormData
): Promise<DbResult<null>> {
  try {
    const supabase = await createClient();
    
    // 1. Check if caller is Admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Unauthorized." }
    
    const { data: adminCheck } = await supabase.from('admins').select('id').eq('id', user.id).single();
    if (!adminCheck) return { success: false, error: "Admin access required." }

    // 2. Parse and Validate Form Data
    const rawData = {
      department_ids: formData.getAll('department_ids'),
      first_name: formData.get('first_name'),
      last_name: formData.get('last_name'),
      phone: formData.get('phone') || undefined,
      designation: formData.get('designation'),
      qualifications: formData.get('qualifications'),
      experience: formData.get('experience'),
      consultation_fee: formData.get('consultation_fee'),
      languages: formData.get('languages'),
      bio: formData.get('bio') || undefined,
      email: formData.get('email'),
      password: formData.get('password'),
      available_days: formData.getAll('available_days'),
    }

    const validatedData = DoctorSchema.parse(rawData);

    // 3. Create Auth User using Admin Client
    const adminAuth = createAdminClient();
    const { data: authData, error: authError } = await adminAuth.auth.admin.createUser({
      email: validatedData.email,
      password: validatedData.password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        role: 'doctor',
        first_name: validatedData.first_name,
        last_name: validatedData.last_name,
      }
    });

    if (authError || !authData.user) {
      return { success: false, error: authError?.message || "Failed to create authentication credentials." };
    }

    const newDoctorId = authData.user.id;


    // 5. Insert into public.doctors
    const languagesArray = validatedData.languages.split(',').map(s => s.trim());

    const { error: insertError } = await adminAuth.from('doctors').insert({
      id: newDoctorId,
      first_name: validatedData.first_name,
      last_name: validatedData.last_name,
      phone: validatedData.phone,
      designation: validatedData.designation,
      qualifications: validatedData.qualifications,
      experience: validatedData.experience,
      consultation_fee: validatedData.consultation_fee,
      languages: languagesArray,
      bio: validatedData.bio,
      available_days: validatedData.available_days,
      // If schema had an avatar_url field, we'd add it here.
    });

    if (insertError) {
      // Rollback Auth user creation if DB insert fails
      await adminAuth.auth.admin.deleteUser(newDoctorId);
      return handleSupabaseError(insertError);
    }

    // 6. Insert into doctor_departments
    const departmentInserts = validatedData.department_ids.map((depId: string) => ({
      doctor_id: newDoctorId,
      department_id: depId
    }));
    
    const { error: deptError } = await adminAuth.from('doctor_departments').insert(departmentInserts);
    if (deptError) {
      console.error("Failed to insert doctor departments:", deptError);
      // We don't rollback the whole doctor here, but we could.
    }

    revalidatePath('/admin/doctors');
    revalidatePath('/doctors');
    logger.info('Doctor added successfully', { adminId: user.id, newDoctorId });
    return { success: true };
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Doctor Validation Error:", error.flatten().fieldErrors);
      return handleZodError(error)
    }
    console.error("Unexpected server error:", error);
    return { success: false, error: "An unexpected server error occurred." }
  }
}

export async function deleteDoctor(id: string): Promise<DbResult<null>> {
  try {
    const supabase = await createClient();
    
    // Check Admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Unauthorized." }
    const { data: adminCheck } = await supabase.from('admins').select('id').eq('id', user.id).single();
    if (!adminCheck) return { success: false, error: "Admin access required." }

    const adminAuth = createAdminClient();
    
    // Delete from auth.users (this cascades to public.doctors)
    const { error } = await adminAuth.auth.admin.deleteUser(id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/admin/doctors');
    revalidatePath('/doctors');
    logger.info('Doctor deleted successfully', { adminId: user.id, deletedDoctorId: id });
    return { success: true };
    
  } catch (error) {
    return { success: false, error: "An unexpected server error occurred." }
  }
}
