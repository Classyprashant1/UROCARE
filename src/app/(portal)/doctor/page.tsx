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
  const { data: appointments, error: apptError } = await supabase
    .from('appointments')
    .select(`
      *,
      patients(first_name, last_name, dob, gender, phone, blood_group)
    `)
    .eq('doctor_id', user.id)
    .order('appointment_date', { ascending: false })

  if (apptError) {
    console.error("Doctor Portal Appointments Error:", apptError);
  }

  const { data: leaves } = await supabase
    .from('doctor_leaves')
    .select('*')
    .eq('doctor_id', user.id)
    .order('leave_date', { ascending: true })

  return (
    <div className="p-8 max-w-7xl mx-auto relative z-0">
      {/* Decorative background elements for glassmorphism to pop */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-blue-50/50 to-transparent -z-10 pointer-events-none rounded-t-3xl"></div>
      <div className="absolute top-10 left-10 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>
      <div className="absolute top-20 right-20 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>

      <div className="mb-10 animate-in fade-in slide-in-from-top-4 duration-500">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider rounded-full mb-3">
          <span className="material-symbols-outlined text-[16px]">verified</span>
          Doctor Portal
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
          Welcome, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Dr. {doctor?.first_name || 'Doctor'} {doctor?.last_name || ''}</span>
        </h1>
        <p className="text-slate-500 mt-2 text-lg font-medium">Manage your clinical schedule, patient appointments, and availability seamlessly.</p>
      </div>
      
      <DoctorDashboardClient 
        doctor={doctor || {}} 
        appointments={appointments || []} 
        leaves={leaves || []}
      />
    </div>
  )
}
