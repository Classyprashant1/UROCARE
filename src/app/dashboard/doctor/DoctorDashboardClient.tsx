'use client'

import { useState } from 'react'
import { updateAppointment, updateDoctorAvailability } from '@/app/actions/doctor'

export default function DoctorDashboardClient({ 
  doctor, 
  appointments
}: { 
  doctor: any, 
  appointments: any[]
}) {
  const [activeTab, setActiveTab] = useState('appointments')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [msg, setMsg] = useState({ type: '', text: '' })
  
  // Notes Modal state
  const [notesModalData, setNotesModalData] = useState<{id: string, notes: string} | null>(null)

  const handleAvailabilityUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMsg({ type: '', text: '' })

    const formData = new FormData(e.currentTarget)
    const res = await updateDoctorAvailability(formData)
    
    setIsSubmitting(false)
    if (res.success) {
      setMsg({ type: 'success', text: 'Availability updated successfully.' })
    } else {
      setMsg({ type: 'error', text: res.error || 'Failed to update availability.' })
    }
  }

  const handleStatusChange = async (id: string, status: any) => {
    const res = await updateAppointment(id, status);
    if (!res.success) alert(res.error || "Update failed.");
  }

  const saveNotes = async () => {
    if (!notesModalData) return;
    setIsSubmitting(true);
    const res = await updateAppointment(notesModalData.id, 'completed', notesModalData.notes);
    setIsSubmitting(false);
    
    if (res.success) {
      setNotesModalData(null);
    } else {
      alert(res.error || "Failed to save notes.");
    }
  }

  // Calculate age from DOB
  const getAge = (dob: string) => {
    if (!dob) return 'N/A';
    const diff_ms = Date.now() - new Date(dob).getTime();
    const age_dt = new Date(diff_ms); 
    return Math.abs(age_dt.getUTCFullYear() - 1970);
  }

  return (
    <div className="flex flex-col md:flex-row gap-8 items-start">
      
      {/* Sidebar Tabs */}
      <div className="w-full md:w-64 flex flex-col gap-2 shrink-0 sticky top-24">
        {[
          { id: 'appointments', label: 'My Appointments', icon: 'calendar_month' },
          { id: 'availability', label: 'Manage Availability', icon: 'schedule' },
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setMsg({type:'', text:''}); }}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-colors text-left ${activeTab === tab.id ? 'bg-blue-700 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <span className="material-symbols-outlined text-[20px]">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 w-full">
        
        {/* ============ APPOINTMENTS ============ */}
        {activeTab === 'appointments' && (
          <div className="flex flex-col gap-6">
            <h2 className="text-xl font-bold text-slate-800">Assigned Appointments</h2>
            {appointments.length === 0 ? (
              <div className="p-8 bg-slate-50 border border-slate-200 rounded-xl text-center text-slate-500">
                You have no appointments assigned.
              </div>
            ) : (
              <div className="grid gap-4">
                {appointments.map(appt => (
                  <div key={appt.id} className="p-5 bg-white border border-slate-200 shadow-sm rounded-xl flex flex-col xl:flex-row xl:items-start justify-between gap-4 relative overflow-hidden">
                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${appt.status === 'pending' ? 'bg-amber-400' : appt.status === 'confirmed' ? 'bg-green-500' : appt.status === 'cancelled' ? 'bg-red-500' : 'bg-blue-500'}`}></div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-slate-900 text-lg">
                          {appt.patients?.first_name} {appt.patients?.last_name}
                        </h3>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold border border-slate-200 uppercase">
                          {appt.status}
                        </span>
                      </div>
                      
                      {/* Patient Info Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4 p-3 bg-slate-50 rounded-lg text-sm">
                        <div><span className="text-slate-400 text-xs block uppercase">Age/Gender</span><span className="font-medium text-slate-700">{getAge(appt.patients?.dob)} / {appt.patients?.gender || 'N/A'}</span></div>
                        <div><span className="text-slate-400 text-xs block uppercase">Blood Group</span><span className="font-medium text-slate-700">{appt.patients?.blood_group || 'N/A'}</span></div>
                        <div><span className="text-slate-400 text-xs block uppercase">Phone</span><span className="font-medium text-slate-700">{appt.patients?.phone || 'N/A'}</span></div>
                        <div><span className="text-slate-400 text-xs block uppercase">Reason</span><span className="font-medium text-slate-700">{appt.reason || 'N/A'}</span></div>
                      </div>

                      <div className="flex items-center gap-2 text-sm font-medium text-blue-800 bg-blue-50 w-fit px-3 py-1.5 rounded-lg border border-blue-100">
                        <span className="material-symbols-outlined text-[18px]">calendar_clock</span>
                        {new Date(appt.appointment_date).toLocaleDateString()} at {appt.appointment_time.substring(0, 5)}
                      </div>

                      {appt.notes && (
                        <div className="mt-3 p-3 bg-yellow-50 text-yellow-800 text-sm rounded border border-yellow-100">
                          <strong>Consultation Notes:</strong> {appt.notes}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-row xl:flex-col gap-2 shrink-0">
                      {appt.status === 'pending' && (
                        <button onClick={() => handleStatusChange(appt.id, 'confirmed')} className="px-4 py-2 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors w-full">
                          Accept
                        </button>
                      )}
                      
                      {(appt.status === 'pending' || appt.status === 'confirmed') && (
                        <button onClick={() => setNotesModalData({id: appt.id, notes: appt.notes || ''})} className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors w-full">
                          Mark Completed
                        </button>
                      )}

                      {appt.status !== 'cancelled' && appt.status !== 'completed' && (
                        <button onClick={() => handleStatusChange(appt.id, 'cancelled')} className="px-4 py-2 text-sm font-semibold text-red-600 bg-red-50 border border-red-100 hover:bg-red-100 rounded-lg transition-colors w-full mt-auto">
                          Cancel Appt
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ============ AVAILABILITY ============ */}
        {activeTab === 'availability' && (
          <div className="bg-white p-6 md:p-8 border border-slate-200 shadow-sm rounded-2xl">
            <h2 className="text-xl font-bold text-slate-800 mb-6">Manage Availability</h2>
            
            {msg.text && (
              <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 text-sm font-medium border ${msg.type === 'error' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
                <span className="material-symbols-outlined">{msg.type === 'error' ? 'error' : 'check_circle'}</span>
                {msg.text}
              </div>
            )}

            <form onSubmit={handleAvailabilityUpdate} className="flex flex-col gap-5">
              <div className="flex flex-col gap-3">
                <label className="text-sm font-semibold text-slate-700">Days you are available for consultation:</label>
                <div className="flex flex-wrap gap-4">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                    <label key={day} className="flex items-center gap-2 p-3 border rounded-xl cursor-pointer hover:bg-slate-50 transition">
                      <input 
                        type="checkbox" 
                        name="available_days" 
                        value={day} 
                        defaultChecked={doctor.available_days?.includes(day)}
                        className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-600" 
                      />
                      <span className="font-medium text-slate-700">{day}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <button type="submit" disabled={isSubmitting} className="px-6 py-3 bg-blue-700 text-white font-bold rounded-lg hover:bg-blue-800 transition disabled:opacity-50 flex items-center gap-2">
                  {isSubmitting ? 'Saving...' : 'Update Schedule'}
                </button>
              </div>
            </form>
          </div>
        )}

      </div>

      {/* NOTES MODAL */}
      {notesModalData && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-800">Consultation Notes</h2>
              <button onClick={() => setNotesModalData(null)} className="text-slate-400 hover:text-slate-600">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="p-6 flex flex-col gap-4">
              <p className="text-sm text-slate-500">Record your consultation notes. Saving this will permanently mark the appointment as <strong className="text-blue-600">Completed</strong>.</p>
              
              <textarea 
                className="w-full h-32 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none resize-none"
                placeholder="Enter clinical notes, diagnoses, or prescriptions here..."
                value={notesModalData.notes}
                onChange={e => setNotesModalData({...notesModalData, notes: e.target.value})}
              />

              <div className="flex justify-end gap-3 mt-4">
                <button onClick={() => setNotesModalData(null)} className="px-5 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg">Cancel</button>
                <button onClick={saveNotes} disabled={isSubmitting} className="px-5 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50">
                  {isSubmitting ? 'Saving...' : 'Save & Complete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
