'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createTestAppointment(formData: FormData) {
  try {
    const supabase = await createClient();
    
    // Test auth
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      console.error("Must be logged in to test appointment creation.")
      return;
    }

    const { error } = await supabase.from('appointments').insert({
      patient_id: user.id,
      doctor_id: formData.get('doctor_id'),
      department_id: formData.get('department_id'),
      appointment_date: '2026-12-01', // Dummy date
      appointment_time: '10:00:00', // Dummy time
      reason: 'Automated Supabase Connection Test',
      status: 'pending'
    });

    if (error) {
      console.error(error.message)
      return;
    }

    revalidatePath('/test')
  } catch (err: any) {
    console.error(err.message || "Unknown error")
  }
}
