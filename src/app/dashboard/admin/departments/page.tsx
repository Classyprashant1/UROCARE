import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import DepartmentManager from './DepartmentManager'

export default async function AdminDepartmentsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: adminCheck } = await supabase.from('admins').select('id').eq('id', user.id).single();
  if (!adminCheck) redirect('/dashboard');

  const { data: departments } = await supabase.from('departments').select('*').order('name');

  return (
    <div className="max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Department Management</h1>
        <p className="text-slate-500 mt-2">Add, edit, or remove hospital departments and services.</p>
      </div>

      <DepartmentManager departments={departments || []} />
    </div>
  )
}
