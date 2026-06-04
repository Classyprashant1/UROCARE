import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
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
  const { data: appointments } = await supabase
    .from('appointments')
    .select(`
      *,
      doctors(first_name, last_name, designation),
      departments(name)
    `)
    .eq('patient_id', user.id)
    .order('appointment_date', { ascending: false })

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
        appointments={appointments || []} 
        medicalHistory={medicalHistory || []} 
        prescriptions={prescriptions || []}
      />
    </div>
  )
}
