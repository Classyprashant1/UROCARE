export const dynamic = 'force-dynamic';
import { createClient } from '@/utils/supabase/server'
import { getAdminAnalytics } from '@/app/actions/admin/analytics'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function AdminDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login');
  
  const analytics = await getAdminAnalytics();
  if (!analytics) redirect('/dashboard'); // Not an admin

  // Fetch recent activity
  const { data: recentAppointments } = await supabase
    .from('appointments')
    .select('*, patients(first_name, last_name), doctors(first_name, last_name)')
    .order('created_at', { ascending: false })
    .limit(5);

  const { data: recentMessages } = await supabase
    .from('contact_messages')
    .select('*')
    .eq('status', 'unread')
    .order('created_at', { ascending: false })
    .limit(5);

  return (
    <div className="max-w-6xl">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Hospital Administration</h1>
          <p className="text-slate-500 mt-2">Enterprise overview of hospital operations.</p>
        </div>
      </div>

      {/* Analytics KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><span className="material-symbols-outlined">groups</span></div>
            <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">+Active</span>
          </div>
          <div>
            <p className="text-3xl font-bold text-slate-900">{analytics.patients}</p>
            <p className="text-sm text-slate-500 font-medium">Registered Patients</p>
          </div>
        </div>
        
        <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-teal-50 text-teal-600 rounded-lg"><span className="material-symbols-outlined">stethoscope</span></div>
          </div>
          <div>
            <p className="text-3xl font-bold text-slate-900">{analytics.doctors}</p>
            <p className="text-sm text-slate-500 font-medium">Medical Staff</p>
          </div>
        </div>

        <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><span className="material-symbols-outlined">calendar_month</span></div>
            {analytics.todayAppointments > 0 && <span className="flex h-3 w-3 relative"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span></span>}
          </div>
          <div>
            <p className="text-3xl font-bold text-slate-900">{analytics.todayAppointments}</p>
            <p className="text-sm text-slate-500 font-medium">Appointments Today</p>
          </div>
        </div>

        <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><span className="material-symbols-outlined">payments</span></div>
          </div>
          <div>
            <p className="text-3xl font-bold text-slate-900">₹{analytics.totalRevenue.toLocaleString()}</p>
            <p className="text-sm text-slate-500 font-medium">Total Revenue (Completed)</p>
          </div>
        </div>
      </div>

      {/* Activity Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Recent Appointments */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-600">event_upcoming</span>
              Recent Bookings
            </h2>
          </div>
          <div className="p-0 flex-1">
            {recentAppointments && recentAppointments.length > 0 ? (
              <ul className="divide-y divide-slate-100">
                {recentAppointments.map(appt => (
                  <li key={appt.id} className="p-4 hover:bg-slate-50 transition flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-sm text-slate-900">{appt.patients?.first_name} {appt.patients?.last_name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">with Dr. {appt.doctors?.last_name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-medium text-slate-700">{new Date(appt.appointment_date).toLocaleDateString()}</p>
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full mt-1 inline-block ${appt.status === 'pending' ? 'bg-amber-100 text-amber-800' : appt.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-600'}`}>
                        {appt.status}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-8 text-center text-slate-500">No recent bookings.</div>
            )}
          </div>
        </div>

        {/* Action Center (Messages & Alerts) */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <span className="material-symbols-outlined text-rose-500">mark_email_unread</span>
              Action Required ({analytics.unreadMessages})
            </h2>
            <Link href="/admin/messages" className="text-sm text-blue-600 font-semibold hover:underline">View All</Link>
          </div>
          <div className="p-0 flex-1">
            {recentMessages && recentMessages.length > 0 ? (
              <ul className="divide-y divide-slate-100">
                {recentMessages.map(msg => (
                  <li key={msg.id} className="p-4 hover:bg-slate-50 transition flex justify-between items-start">
                    <div className="pr-4">
                      <p className="font-bold text-sm text-slate-900 line-clamp-1">{msg.subject}</p>
                      <p className="text-xs text-slate-500 mt-0.5">From: {msg.name} ({msg.email})</p>
                    </div>
                    <Link href={`/admin/messages`} className="text-xs font-semibold text-blue-600 border border-blue-200 bg-blue-50 px-3 py-1.5 rounded-lg shrink-0">
                      Respond
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-8 text-center text-slate-500">All caught up! No unread messages.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

