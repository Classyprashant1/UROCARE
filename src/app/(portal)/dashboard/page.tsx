export const dynamic = 'force-dynamic';
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { DOCTORS, DEPARTMENTS } from '@/lib/data'
import PatientDashboardClient from './PatientDashboardClient'

export default async function PatientDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect('/login')

  // 1. Fetch Patient Profile
  const { data: profile } = await supabase
    .from('patients')
    .select('*')
    .eq('id', user.id)
    .single()

  // 2. Fetch Appointments
  const { data: appointments, error: apptError } = await supabase
    .from('appointments')
    .select('*')
    .eq('patient_id', user.id)
    .order('appointment_date', { ascending: false })
  
  if (apptError) console.error("Error fetching appointments:", apptError);

  // Fetch doctors and departments to map manually since appointments.doctor_id is TEXT
  const { data: dbDoctors } = await supabase.from('doctors').select('*, doctor_departments(departments(id, name))');

  const enrichedAppointments = appointments?.map(appt => {
    // Try to find the real DB doctor first
    const dbDoctor = dbDoctors?.find(d => d.id === appt.doctor_id);
    if (dbDoctor) {
      const deptMapping = dbDoctor.doctor_departments?.find((dd: any) => dd.departments?.id === appt.department_id);
      const deptName = deptMapping?.departments?.name || '';

      return {
        ...appt,
        doctors: {
          first_name: dbDoctor.first_name,
          last_name: dbDoctor.last_name,
          departments: { name: deptName }
        }
      }
    }

    // Fallback to static mock data if it was an old mock appointment
    const doctor = DOCTORS.find(d => d.id === appt.doctor_id)
    const dept = DEPARTMENTS.find(d => d.id === appt.department_id)
    const doctorNameParts = doctor?.name?.replace('Dr. ', '').split(' ') || ['']
    return {
      ...appt,
      doctors: {
        first_name: doctorNameParts[0] || 'Unknown',
        last_name: doctorNameParts.slice(1).join(' ') || '',
        departments: { name: dept?.name || '' }
      }
    }
  }) || [];

  // 3. Fetch Medical History
  const { data: medicalHistory } = await supabase
    .from('medical_history')
    .select(`
      *,
      doctors(first_name, last_name)
    `)
    .eq('patient_id', user.id)
    .order('date_recorded', { ascending: false })

  // 4. Fetch Prescriptions
  const { data: prescriptions } = await supabase
    .from('prescriptions')
    .select(`
      *,
      doctors(first_name, last_name)
    `)
    .eq('patient_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Patient Dashboard</h1>
        <p className="text-slate-500 mt-1">Manage your appointments, health records, and profile.</p>
      </div>
      
      <PatientDashboardClient 
        profile={profile || {}} 
        appointments={enrichedAppointments} 
        medicalHistory={medicalHistory || []} 
        prescriptions={prescriptions || []}
      />
    </div>
  )
}

