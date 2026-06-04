'use server'

import { createClient } from '@/utils/supabase/server'

export async function getAdminAnalytics() {
  const supabase = await createClient();
  
  // Basic security check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null;
  const { data: adminCheck } = await supabase.from('admins').select('id').eq('id', user.id).single();
  if (!adminCheck) return null;

  // Run queries in parallel for performance
  const [
    { count: doctorsCount },
    { count: patientsCount },
    { count: departmentsCount },
    { count: messagesCount },
    { data: todayAppointments },
    { data: allAppointments }
  ] = await Promise.all([
    supabase.from('doctors').select('*', { count: 'exact', head: true }),
    supabase.from('patients').select('*', { count: 'exact', head: true }),
    supabase.from('departments').select('*', { count: 'exact', head: true }),
    supabase.from('contact_messages').select('*', { count: 'exact', head: true }).eq('status', 'unread'),
    supabase.from('appointments').select('*').eq('appointment_date', new Date().toISOString().split('T')[0]),
    supabase.from('appointments').select(`
      status, 
      doctors(consultation_fee)
    `)
  ]);

  // Calculate Revenue (Completed appointments * consultation fee)
  // Note: in a real app, fee might change over time, so we should store it in the appointment row. 
  // For this prototype, we'll calculate dynamically from the doctor's current fee.
  let totalRevenue = 0;
  allAppointments?.forEach((appt: any) => {
    if (appt.status === 'completed' && appt.doctors?.consultation_fee) {
      totalRevenue += Number(appt.doctors.consultation_fee);
    }
  });

  return {
    doctors: doctorsCount || 0,
    patients: patientsCount || 0,
    departments: departmentsCount || 0,
    unreadMessages: messagesCount || 0,
    todayAppointments: todayAppointments?.length || 0,
    totalRevenue
  };
}
