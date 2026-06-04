import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import DoctorDashboardClient from './DoctorDashboardClient'

export default async function DoctorDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect('/login')

  // Verify caller is a doctor
  const { data: doctor, error } = await supabase
    .from('doctors')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error || !doctor) {
    redirect('/dashboard') // Redirect non-doctors
  }

  // Fetch Appointments for this doctor, joining patient details
  const { data: appointments } = await supabase
    .from('appointments')
    .select(`
      *,
      patients(first_name, last_name, dob, gender, phone, blood_group)
    `)
    .eq('doctor_id', user.id)
    .order('appointment_date', { ascending: true })
    .order('appointment_time', { ascending: true })

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Dr. {doctor.first_name} {doctor.last_name}'s Dashboard</h1>
        <p className="text-slate-500 mt-1">Manage your appointments, patients, and availability.</p>
      </div>
      
      <DoctorDashboardClient 
        doctor={doctor} 
        appointments={appointments || []} 
      />
    </div>
  )
}
