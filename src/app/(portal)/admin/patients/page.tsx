export const dynamic = 'force-dynamic';
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function AdminPatientsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: adminCheck } = await supabase.from('admins').select('id').eq('id', user.id).single();
  if (!adminCheck) redirect('/dashboard');

  // Fetch all patients and their appointment count
  const { data: patients } = await supabase
    .from('patients')
    .select(`
      *,
      appointments(id)
    `)
    .order('created_at', { ascending: false });

  // Calculate age from DOB
  const getAge = (dob: string | null) => {
    if (!dob) return 'N/A';
    const diff_ms = Date.now() - new Date(dob).getTime();
    const age_dt = new Date(diff_ms); 
    return Math.abs(age_dt.getUTCFullYear() - 1970);
  }

  return (
    <div className="max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Patient CRM</h1>
        <p className="text-slate-500 mt-2">Manage registered patients and view their activity.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 min-w-[800px]">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Patient Name</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Demographics</th>
                <th className="px-6 py-4">Total Visits</th>
                <th className="px-6 py-4 text-right">Registered</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {patients?.map(patient => (
                <tr key={patient.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-900">{patient.first_name} {patient.last_name}</p>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">{patient.id.substring(0, 8)}...</p>
                  </td>
                  <td className="px-6 py-4">
                    <p>{patient.phone || 'N/A'}</p>
                    {/* We don't have email in the patients table (it's in auth), but this is fine for CRM overview */}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1 text-xs">
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full w-fit">Age: {getAge(patient.dob)}</span>
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full w-fit capitalize">Gender: {patient.gender || 'Unknown'}</span>
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full w-fit">Blood: {patient.blood_group || 'Unknown'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-semibold text-blue-600">
                    {patient.appointments?.length || 0}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {new Date(patient.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {(!patients || patients.length === 0) && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">No patients registered yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

