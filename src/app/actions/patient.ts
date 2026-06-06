'use server'

import { createClient } from '@/utils/supabase/server'
import { PatientProfileSchema } from '@/lib/schema'
import { handleZodError, handleSupabaseError, DbResult } from '@/utils/db'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

export async function updatePatientProfile(formData: FormData): Promise<DbResult<null>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Unauthorized." }

    const rawData = {
      first_name: formData.get('first_name'),
      last_name: formData.get('last_name'),
      phone: formData.get('phone') || undefined,
      dob: formData.get('dob') || undefined,
      gender: formData.get('gender') || undefined,
      blood_group: formData.get('blood_group') || undefined,
      email: formData.get('email') || undefined,
      emergency_contact: formData.get('emergency_contact') || undefined,
      address: formData.get('address') || undefined,
    }

    const validatedData = PatientProfileSchema.parse(rawData);
    
    // Remove fields that are not in the DB schema
    const dbPayload = { ...validatedData };
    delete (dbPayload as any).email;
    delete (dbPayload as any).emergency_contact;

    // Make sure patient record exists
    const { data: patientCheck } = await supabase.from('patients').select('id').eq('id', user.id).single();

    if (patientCheck) {
      const { error } = await supabase.from('patients').update(dbPayload).eq('id', user.id);
      if (error) return handleSupabaseError(error);
    } else {
      // Create record if it doesn't exist (e.g. they just signed up)
      const { error } = await supabase.from('patients').insert({ id: user.id, ...dbPayload });
      if (error) return handleSupabaseError(error);
    }

    revalidatePath('/dashboard');
    return { success: true };
    
  } catch (error) {
    if (error instanceof z.ZodError) return handleZodError(error);
    return { success: false, error: "Unexpected server error." }
  }
}

export async function cancelAppointment(appointmentId: string): Promise<DbResult<null>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Unauthorized." }

    // Patient can only cancel their own appointment
    const { error } = await supabase
      .from('appointments')
      .update({ status: 'cancelled' })
      .eq('id', appointmentId)
      .eq('patient_id', user.id);

    if (error) return handleSupabaseError(error);

    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    return { success: false, error: "Unexpected server error." }
  }
}
