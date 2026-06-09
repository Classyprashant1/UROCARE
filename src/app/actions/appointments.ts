'use server'

import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { BookingSchema } from '@/lib/schema'
import { handleZodError, handleSupabaseError, DbResult } from '@/utils/db'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

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

    // Prepare payload
    const rawData = {
      patient_name: formData.get('patient_name'),
      patient_phone: formData.get('patient_phone'),
      department_id: formData.get('department_id'),
      doctor_id: formData.get('doctor_id'),
      appointment_date: formData.get('appointment_date'),
      appointment_slot: formData.get('appointment_slot'),
      appointment_time: formData.get('appointment_time'),
      reason: formData.get('reason'),
    }

    // Validate using Zod
    const validatedData = BookingSchema.parse(rawData)

    // Check if the exact time is already booked
    const { data: existingAppt } = await supabase
      .from('appointments')
      .select('id')
      .eq('doctor_id', validatedData.doctor_id)
      .eq('appointment_date', validatedData.appointment_date)
      .eq('appointment_time', validatedData.appointment_time)
      .neq('status', 'cancelled')
      .single()

    if (existingAppt) {
      return { success: false, error: "This time slot has just been booked. Please select another time." }
    }

    // Verify that the selected doctor belongs to the selected department
    const adminSupabase = createAdminClient()
    const { data: deptMapping } = await adminSupabase
      .from('doctor_departments')
      .select('department_id')
      .eq('doctor_id', validatedData.doctor_id)
      .eq('department_id', validatedData.department_id)
      .single()

    if (!deptMapping) {
      return { success: false, error: "The selected doctor does not belong to the selected department." }
    }

    // Insert into Supabase
    const { error } = await supabase.from('appointments').insert({
      patient_id: user.id,
      patient_name: validatedData.patient_name,
      patient_phone: validatedData.patient_phone,
      department_id: validatedData.department_id,
      doctor_id: validatedData.doctor_id,
      appointment_date: validatedData.appointment_date,
      appointment_slot: validatedData.appointment_slot,
      appointment_time: validatedData.appointment_time,
      reason: validatedData.reason,
      status: 'pending'
    })

    if (error) {
      if (error.code === '23505') { // Unique constraint violation code
        return { success: false, error: "This time slot is already booked." }
      }
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

export type SlotInfo = {
  slot: string;
  time: string;
};

function generateSlots(start: string | null, end: string | null, durationMin: number, label: string): SlotInfo[] {
  const slots: SlotInfo[] = [];
  if (!start || !end) return slots;
  
  const [startH, startM] = start.split(':').map(Number);
  const [endH, endM] = end.split(':').map(Number);
  
  let currentMin = startH * 60 + startM;
  const endMin = endH * 60 + endM;
  
  while (currentMin + durationMin <= endMin) {
    const h = Math.floor(currentMin / 60);
    const m = currentMin % 60;
    const timeStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:00`;
    slots.push({ slot: label, time: timeStr });
    currentMin += durationMin;
  }
  
  return slots;
}

export async function getAvailableTimeSlots(doctorId: string, date: string): Promise<SlotInfo[]> {
  if (!doctorId || !date) return [];

  const supabase = await createClient();

  // 1. Check if doctor is on leave
  const { data: leaves } = await supabase
    .from('doctor_leaves')
    .select('id')
    .eq('doctor_id', doctorId)
    .eq('leave_date', date);

  if (leaves && leaves.length > 0) {
    return []; // Doctor is on leave, no slots available
  }

  // 2. Fetch doctor's availability configuration
  const { data: doctor } = await supabase
    .from('doctors')
    .select('available_days, morning_start_time, morning_end_time, evening_start_time, evening_end_time, slot_duration')
    .eq('id', doctorId)
    .single();

  if (!doctor) return [];

  // Check available_days
  if (doctor.available_days) {
    const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'short' });
    if (!doctor.available_days.includes(dayOfWeek)) {
      return [];
    }
  }
  
  // Generate possible slots based on doctor's schedule
  const duration = doctor.slot_duration || 5;
  const morningSlots = generateSlots(doctor.morning_start_time, doctor.morning_end_time, duration, 'Morning');
  const eveningSlots = generateSlots(doctor.evening_start_time, doctor.evening_end_time, duration, 'Evening');
  const allSlots = [...morningSlots, ...eveningSlots];
  
  // If no slots are configured at all, fallback to a standard list if needed, or just return empty
  if (allSlots.length === 0) {
    // If you want to keep the legacy fallback for old accounts:
    // allSlots.push({ slot: "Morning", time: "Morning" }, { slot: "Evening", time: "Evening" });
  }

  // Fetch existing appointments for this doctor on this date
  const { data: appointments, error } = await supabase
    .from('appointments')
    .select('appointment_time')
    .eq('doctor_id', doctorId)
    .eq('appointment_date', date)
    .neq('status', 'cancelled');

  if (error) {
    console.error("Error fetching time slots:", error);
    return [];
  }

  const bookedTimes = new Set((appointments || []).map(row => row.appointment_time));
  
  return allSlots.filter(s => !bookedTimes.has(s.time));
}
