'use server'

import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
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

    const rawData = {
      available_days: formData.getAll('available_days') as string[],
      morning_start_time: formData.get('morning_start_time') || undefined,
      morning_end_time: formData.get('morning_end_time') || undefined,
      evening_start_time: formData.get('evening_start_time') || undefined,
      evening_end_time: formData.get('evening_end_time') || undefined,
      slot_duration: formData.get('slot_duration') || '5',
    }
    
    // Validate input
    const validatedData = (await import('@/lib/schema')).DoctorAvailabilitySchema.parse(rawData);

    const { error } = await supabase
      .from('doctors')
      .update({ 
        available_days: validatedData.available_days,
        morning_start_time: validatedData.morning_start_time || null,
        morning_end_time: validatedData.morning_end_time || null,
        evening_start_time: validatedData.evening_start_time || null,
        evening_end_time: validatedData.evening_end_time || null,
        slot_duration: validatedData.slot_duration,
      })
      .eq('id', user.id);

    if (error) return handleSupabaseError(error);

    revalidatePath('/doctor');
    revalidatePath('/doctors'); // Refresh public listing
    revalidatePath('/booking'); // Refresh booking availability
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

export async function updateDoctorProfile(formData: FormData): Promise<DbResult<null>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Unauthorized." }

    const { data: doctorCheck } = await supabase.from('doctors').select('id').eq('id', user.id).single();
    if (!doctorCheck) return { success: false, error: "Only doctors can update this." }

    const photoFile = formData.get('photo') as File | null;

    // Upload Photo if provided
    if (photoFile && photoFile.size > 0) {
      // Validate File Size (max 2MB)
      if (photoFile.size > 2 * 1024 * 1024) {
        return { success: false, error: "Profile photo must be less than 2MB." };
      }
      // Validate File Type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(photoFile.type)) {
        return { success: false, error: "Only JPG, PNG, and WebP images are allowed." };
      }

      // Use standard client as RLS policy allows doctors to manage their own avatars
      const fileName = `${user.id}`;
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, photoFile, { upsert: true });

      if (uploadError) {
        console.error("Photo upload failed:", uploadError);
        return { success: false, error: "Failed to upload profile photo." };
      }
    }

    // Update DB
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
      languages: validatedData.languages.split(',').map((s: string) => s.trim()),
      bio: validatedData.bio || null,
    };

    const { error } = await supabase
      .from('doctors')
      .update(updateData)
      .eq('id', user.id);

    if (error) return handleSupabaseError(error);

    // Recreate doctor_departments using admin client because table has no RLS policies for doctors
    const adminClient = createAdminClient();
    await adminClient.from('doctor_departments').delete().eq('doctor_id', user.id);
    
    const departmentInserts = validatedData.department_ids.map((depId: string) => ({
      doctor_id: user.id,
      department_id: depId
    }));
    
    const { error: deptError } = await adminClient.from('doctor_departments').insert(departmentInserts);
    
    if (deptError) {
      console.error("Failed to update doctor departments:", deptError);
      return { success: false, error: "Failed to update department mappings." }
    }

    revalidatePath('/doctor');
    revalidatePath('/doctors');
    revalidatePath('/booking');
    return { success: true };
  } catch (error) {
    return { success: false, error: "Unexpected server error." }
  }
}
