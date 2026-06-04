import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const role = user.user_metadata?.role || 'patient'
  const name = user.user_metadata?.first_name || 'User'

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row pt-20">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-slate-200 flex-shrink-0">
        <div className="p-6">
          <h2 className="text-xl font-bold text-slate-800 capitalize">{role} Portal</h2>
          <p className="text-sm text-slate-500 mt-1">Welcome back, {name}</p>
        </div>
        <nav className="flex flex-col gap-1 px-4 pb-6">
          <Link href={`/dashboard/${role}`} className="px-4 py-2.5 rounded-lg bg-blue-50 text-blue-700 font-semibold text-sm flex items-center gap-3">
            <span className="material-symbols-outlined text-[20px]">dashboard</span>
            Overview
          </Link>
          <Link href={`/dashboard/${role}/appointments`} className="px-4 py-2.5 rounded-lg text-slate-600 hover:bg-slate-50 font-medium text-sm flex items-center gap-3">
            <span className="material-symbols-outlined text-[20px]">event</span>
            Appointments
          </Link>
          {role === 'admin' && (
            <>
              <Link href="/dashboard/admin/doctors" className="px-4 py-2.5 rounded-lg text-slate-600 hover:bg-slate-50 font-medium text-sm flex items-center gap-3">
                <span className="material-symbols-outlined text-[20px]">stethoscope</span>
                Manage Doctors
              </Link>
              <Link href="/dashboard/admin/departments" className="px-4 py-2.5 rounded-lg text-slate-600 hover:bg-slate-50 font-medium text-sm flex items-center gap-3">
                <span className="material-symbols-outlined text-[20px]">local_hospital</span>
                Departments
              </Link>
              <Link href="/dashboard/admin/patients" className="px-4 py-2.5 rounded-lg text-slate-600 hover:bg-slate-50 font-medium text-sm flex items-center gap-3">
                <span className="material-symbols-outlined text-[20px]">groups</span>
                Patients
              </Link>
              <Link href="/dashboard/admin/messages" className="px-4 py-2.5 rounded-lg text-slate-600 hover:bg-slate-50 font-medium text-sm flex items-center gap-3">
                <span className="material-symbols-outlined text-[20px]">mail</span>
                Messages
              </Link>
            </>
          )}
          {role === 'patient' && (
            <Link href="/dashboard/patient/records" className="px-4 py-2.5 rounded-lg text-slate-600 hover:bg-slate-50 font-medium text-sm flex items-center gap-3">
              <span className="material-symbols-outlined text-[20px]">medical_information</span>
              Medical Records
            </Link>
          )}
          <div className="my-4 border-t border-slate-100"></div>
          <form action="/auth/signout" method="post">
            <button type="submit" className="w-full text-left px-4 py-2.5 rounded-lg text-red-600 hover:bg-red-50 font-medium text-sm flex items-center gap-3">
              <span className="material-symbols-outlined text-[20px]">logout</span>
              Sign Out
            </button>
          </form>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10">
        {children}
      </main>
    </div>
  )
}
