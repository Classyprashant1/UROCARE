'use server'

import { createClient } from '@/utils/supabase/server'
import { BookingSchema } from '@/lib/schema'
import { handleZodError, handleSupabaseError, DbResult } from '@/utils/db'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { rateLimit } from '@/utils/rate-limit'

export async function createAppointment(
  formData: FormData
): Promise<DbResult<null>> {
  try {
    const supabase = await createClient()
    
    // Authenticate user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: "You must be logged in to book an appointment." }
    }

    // Rate Limiting
    const rateLimitCheck = rateLimit(\`booking_\${user.id}\`, 3, 60000); // 3 per minute
    if (!rateLimitCheck.success) {
      return { success: false, error: rateLimitCheck.error };
    }

    // Prepare payload
    const rawData = {
      patient_name: formData.get('patient_name'),
      patient_phone: formData.get('patient_phone'),
      department_id: formData.get('department_id'),
      doctor_id: formData.get('doctor_id'),
      appointment_date: formData.get('appointment_date'),
      appointment_time: formData.get('appointment_time'),
      reason: formData.get('reason'),
    }

    // Validate using Zod
    const validatedData = BookingSchema.parse(rawData)

    // Insert into Supabase
    const { error } = await supabase.from('appointments').insert({
      patient_id: user.id,
      patient_name: validatedData.patient_name,
      patient_phone: validatedData.patient_phone,
      department_id: validatedData.department_id,
      doctor_id: validatedData.doctor_id,
      appointment_date: validatedData.appointment_date,
      appointment_time: validatedData.appointment_time,
      reason: validatedData.reason,
      status: 'pending'
    })

    if (error) {
      return handleSupabaseError(error)
    }

    // Revalidate patient dashboard so new appointment shows up immediately
    revalidatePath('/dashboard')

    return { success: true }
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return handleZodError(error)
    }
    return { success: false, error: "An unexpected server error occurred." }
  }
}

const STANDARD_SLOTS = [
  "09:00", "17:00"
];

export async function getAvailableTimeSlots(doctorId: string, date: string): Promise<string[]> {
  if (!doctorId || !date) return [];

  const supabase = await createClient();
  
  // Fetch existing appointments for this doctor on this date
  const { data, error } = await supabase
    .from('appointments')
    .select('appointment_time')
    .eq('doctor_id', doctorId)
    .eq('appointment_date', date)
    .neq('status', 'cancelled');

  if (error) {
    console.error("Error fetching time slots:", error);
    return [];
  }

  // Postgres TIME is returned like '09:00:00', we just need '09:00'
  const bookedTimes = new Set(data.map(row => row.appointment_time.substring(0, 5)));

  // Return slots that are NOT booked
  return STANDARD_SLOTS.filter(slot => !bookedTimes.has(slot));
}
