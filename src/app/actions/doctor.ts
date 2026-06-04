'use server'

import { createClient } from '@/utils/supabase/server'
import { handleSupabaseError, DbResult } from '@/utils/db'
import { revalidatePath } from 'next/cache'

export async function updateAppointment(
  appointmentId: string, 
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled',
  notes?: string
): Promise<DbResult<null>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Unauthorized." }

    // Ensure the caller is the assigned doctor
    const { data: doctorCheck } = await supabase.from('doctors').select('id').eq('id', user.id).single();
    if (!doctorCheck) return { success: false, error: "Only doctors can update this." }

    const updateData: any = { status };
    if (notes !== undefined) {
      updateData.notes = notes;
    }

    const { error } = await supabase
      .from('appointments')
      .update(updateData)
      .eq('id', appointmentId)
      .eq('doctor_id', user.id);

    if (error) return handleSupabaseError(error);

    revalidatePath('/dashboard/doctor');
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

    const available_days = formData.getAll('available_days');
    
    if (available_days.length === 0) {
      return { success: false, error: "You must select at least one available day." }
    }

    const { error } = await supabase
      .from('doctors')
      .update({ available_days })
      .eq('id', user.id);

    if (error) return handleSupabaseError(error);

    revalidatePath('/dashboard/doctor');
    revalidatePath('/doctors'); // Refresh public listing
    return { success: true };
  } catch (error) {
    return { success: false, error: "Unexpected server error." }
  }
}
