'use server'

import { createClient } from '@/utils/supabase/server'
import { handleSupabaseError, DbResult } from '@/utils/db'
import { revalidatePath } from 'next/cache'

export async function updateAppointment(
  appointmentId: string, 
  status: string,
  notes?: string
): Promise<DbResult<null>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Unauthorized." }

    // Ensure the caller is the assigned doctor
    const { data: doctorCheck } = await supabase.from('doctors').select('id').eq('id', user.id).single();
    if (!doctorCheck) return { success: false, error: "Only doctors can update this." }

    // Validate input
    const { status: validatedStatus, notes: validatedNotes } = (await import('@/lib/schema')).UpdateAppointmentSchema.parse({ status, notes });

    const updateData: any = { status: validatedStatus };
    if (validatedNotes !== undefined) {
      updateData.notes = validatedNotes;
    }

    const { error } = await supabase
      .from('appointments')
      .update(updateData)
      .eq('id', appointmentId)
      .eq('doctor_id', user.id);

    if (error) return handleSupabaseError(error);

    revalidatePath('/doctor');
    return { success: true };
    
  } catch (error) {
    return { success: false, error: "Unexpected server error." }
  }
}

export async function updateDoctorAvailability(formData: FormData): Promise<DbResult<null>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Unauthorized." }

    const available_days = formData.getAll('available_days') as string[];
    
    // Validate input
    const validatedData = (await import('@/lib/schema')).DoctorAvailabilitySchema.parse({ available_days });

    const { error } = await supabase
      .from('doctors')
      .update({ available_days: validatedData.available_days })
      .eq('id', user.id);

    if (error) return handleSupabaseError(error);

    revalidatePath('/doctor');
    revalidatePath('/doctors'); // Refresh public listing
    return { success: true };
  } catch (error) {
    return { success: false, error: "Unexpected server error." }
  }
}

export async function addDoctorLeave(formData: FormData): Promise<DbResult<null>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Unauthorized." }

    const leave_date = formData.get('leave_date') as string;
    const reason = formData.get('reason') as string;

    // Validate input
    const validatedData = (await import('@/lib/schema')).DoctorLeaveSchema.parse({ leave_date, reason });

    // Prevent duplicate leave
    const { data: existingLeave } = await supabase
      .from('doctor_leaves')
      .select('id')
      .eq('doctor_id', user.id)
      .eq('leave_date', leave_date)
      .single();

    if (existingLeave) {
      return { success: false, error: "You already have a leave scheduled for this date." };
    }

    const { error } = await supabase
      .from('doctor_leaves')
      .insert({
        doctor_id: user.id,
        leave_date: validatedData.leave_date,
        reason: validatedData.reason
      });

    if (error) return handleSupabaseError(error);

    revalidatePath('/doctor');
    return { success: true };
  } catch (error) {
    return { success: false, error: "Unexpected server error." }
  }
}

export async function removeDoctorLeave(leaveId: string): Promise<DbResult<null>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Unauthorized." }

    const { error } = await supabase
      .from('doctor_leaves')
      .delete()
      .eq('id', leaveId)
      .eq('doctor_id', user.id); // Ensure they can only delete their own

    if (error) return handleSupabaseError(error);

    revalidatePath('/doctor');
    return { success: true };
  } catch (error) {
    return { success: false, error: "Unexpected server error." }
  }
}

export async function updateDoctorProfile(formData: FormData, photoFile?: File): Promise<DbResult<null>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Unauthorized." }

    const { data: doctorCheck } = await supabase.from('doctors').select('id').eq('id', user.id).single();
    if (!doctorCheck) return { success: false, error: "Only doctors can update this." }

    // Upload Photo if provided
    if (photoFile && photoFile.size > 0) {
      // Use admin client to bypass RLS for avatars which currently requires admin role
      const { createAdminClient } = await import('@/utils/supabase/admin');
      const adminAuth = createAdminClient();
      const fileName = `${user.id}`;
      const { error: uploadError } = await adminAuth.storage
        .from('avatars')
        .upload(fileName, photoFile, { upsert: true });

      if (uploadError) {
        console.error("Photo upload failed:", uploadError);
        return { success: false, error: "Failed to upload profile photo." };
      }
    }

    // Update DB
    const rawData = {
      first_name: formData.get('first_name'),
      last_name: formData.get('last_name'),
      phone: formData.get('phone') || undefined,
      designation: formData.get('designation'),
      qualifications: formData.get('qualifications'),
      experience: formData.get('experience'),
      consultation_fee: formData.get('consultation_fee'),
      languages: formData.get('languages'),
      bio: formData.get('bio') || undefined,
    };

    const validatedData = (await import('@/lib/schema')).DoctorProfileUpdateSchema.parse(rawData);

    const updateData = {
      first_name: validatedData.first_name,
      last_name: validatedData.last_name,
      phone: validatedData.phone || null,
      designation: validatedData.designation,
      qualifications: validatedData.qualifications,
      experience: validatedData.experience,
      consultation_fee: validatedData.consultation_fee,
      languages: validatedData.languages.split(',').map(s => s.trim()),
      bio: validatedData.bio || null,
    };

    const { error } = await supabase
      .from('doctors')
      .update(updateData)
      .eq('id', user.id);

    if (error) return handleSupabaseError(error);

    revalidatePath('/doctor');
    revalidatePath('/doctors');
    return { success: true };
  } catch (error) {
    return { success: false, error: "Unexpected server error." }
  }
}
