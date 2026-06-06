export const dynamic = 'force-dynamic';
import { getDoctors, getDepartments } from '@/app/actions/data'
import DoctorManager from './DoctorManager'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function AdminDoctorsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) redirect('/login');
  
  const { data: adminCheck } = await supabase.from('admins').select('id').eq('id', user.id).single();
  if (!adminCheck) redirect('/dashboard'); // Not an admin

  const doctors = await getDoctors();
  const departments = await getDepartments();

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Doctor Management</h1>
          <p className="text-slate-500 text-sm mt-1">Add, edit, or remove doctors and their schedules.</p>
        </div>
      </div>

      <DoctorManager initialDoctors={doctors} departments={departments} />
    </div>
  )
}

