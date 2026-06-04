import { createClient } from '@/utils/supabase/server'
import { createTestAppointment } from './actions'

export default async function DatabaseTestPage() {
  const supabase = await createClient();
  let connectionStatus = "Checking...";
  let doctors: any[] = [];
  let errorMsg = null;

  try {
    // 1. Verify Supabase Connection
    const { data, error } = await supabase.from('doctors').select('id, first_name, last_name, department_id, departments(name)');
    
    if (error) {
      connectionStatus = "❌ FAILED";
      errorMsg = error.message;
    } else {
      connectionStatus = "✅ CONNECTED";
      doctors = data || [];
    }
  } catch (err: any) {
    connectionStatus = "❌ CRITICAL FAILURE";
    errorMsg = err.message || "Unknown exception caught.";
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Connection Status Panel */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h1 className="text-2xl font-bold text-slate-800 border-b pb-4 mb-4">Supabase Diagnostics Test</h1>
          
          <div className="flex items-center gap-4 text-lg">
            <span className="font-semibold text-slate-700">Database Status:</span>
            <span className={`font-bold ${connectionStatus.includes('✅') ? 'text-emerald-600' : 'text-red-600'}`}>
              {connectionStatus}
            </span>
          </div>

          {errorMsg && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 font-mono text-sm">
              ERROR: {errorMsg}
            </div>
          )}
        </div>

        {/* Doctors List Panel */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-xl font-bold text-slate-800 mb-4">Doctors Read Test</h2>
          
          {doctors.length === 0 ? (
            <p className="text-slate-500 italic">No doctors found in the database. Ensure you have seeded the `doctors` table.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {doctors.map(doctor => (
                <li key={doctor.id} className="py-4 flex justify-between items-center">
                  <div>
                    <div className="font-semibold text-slate-900">Dr. {doctor.first_name} {doctor.last_name}</div>
                    <div className="text-sm text-slate-500">{doctor.departments?.name || 'No Department'}</div>
                  </div>
                  
                  {/* Appointment Creation Test Form */}
                  <form action={createTestAppointment}>
                    <input type="hidden" name="doctor_id" value={doctor.id} />
                    <input type="hidden" name="department_id" value={doctor.department_id} />
                    <button 
                      type="submit"
                      className="px-4 py-2 bg-blue-100 text-blue-700 font-semibold rounded-lg hover:bg-blue-200 text-sm transition"
                    >
                      Test Booking
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          )}
        </div>

      </div>
    </div>
  )
}
