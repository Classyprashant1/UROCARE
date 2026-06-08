'use client'

import { useState, useRef } from 'react'
import { updateAppointment, updateDoctorAvailability, addDoctorLeave, removeDoctorLeave, updateDoctorProfile } from '@/app/actions/doctor'

export default function DoctorDashboardClient({ 
  doctor, 
  appointments,
  leaves = []
}: { 
  doctor: any, 
  appointments: any[],
  leaves?: any[]
}) {
  const [activeTab, setActiveTab] = useState('appointments')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [msg, setMsg] = useState({ type: '', text: '' })
  
  // Profile Photo state
  const [photoPreview, setPhotoPreview] = useState(doctor.avatar_url || '')
  
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

  const handleAddLeave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMsg({ type: '', text: '' })

    const formData = new FormData(e.currentTarget)
    const res = await addDoctorLeave(formData)
    
    setIsSubmitting(false)
    if (res.success) {
      setMsg({ type: 'success', text: 'Leave added successfully.' })
      ;(e.target as HTMLFormElement).reset()
    } else {
      setMsg({ type: 'error', text: res.error || 'Failed to add leave.' })
    }
  }

  const handleRemoveLeave = async (leaveId: string) => {
    if(!confirm('Are you sure you want to cancel this leave?')) return;
    setIsSubmitting(true)
    setMsg({ type: '', text: '' })
    const res = await removeDoctorLeave(leaveId)
    setIsSubmitting(false)
    if (res.success) {
      setMsg({ type: 'success', text: 'Leave cancelled successfully.' })
    } else {
      setMsg({ type: 'error', text: res.error || 'Failed to cancel leave.' })
    }
  }

  const handleProfileUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMsg({ type: '', text: '' })

    const formData = new FormData(e.currentTarget)
    const photoFile = formData.get('photo') as File
    const res = await updateDoctorProfile(formData, photoFile)
    
    setIsSubmitting(false)
    if (res.success) {
      setMsg({ type: 'success', text: 'Profile updated successfully.' })
    } else {
      setMsg({ type: 'error', text: res.error || 'Failed to update profile.' })
    }
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
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
    <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
      
      {/* Sidebar Tabs - Premium Glassmorphism */}
      <div className="w-full md:w-64 flex flex-col gap-2 shrink-0 sticky top-24 bg-white/60 backdrop-blur-xl border border-white/50 p-4 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-2">Navigation</h3>
        {[
          { id: 'appointments', label: 'My Appointments', icon: 'calendar_month' },
          { id: 'availability', label: 'Manage Availability', icon: 'schedule' },
          { id: 'leaves', label: 'Leave Management', icon: 'event_busy' },
          { id: 'profile', label: 'Profile Settings', icon: 'person' },
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setMsg({type:'', text:''}); }}
            className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-300 text-left relative overflow-hidden group ${activeTab === tab.id ? 'text-white shadow-md' : 'text-slate-600 hover:bg-white hover:shadow-sm'}`}
          >
            {activeTab === tab.id && (
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 -z-10"></div>
            )}
            <span className={`material-symbols-outlined text-[20px] transition-transform duration-300 ${activeTab === tab.id ? 'scale-110' : 'group-hover:scale-110 group-hover:text-blue-600'}`}>
              {tab.icon}
            </span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 w-full min-w-0">
        
        {/* Leave Reminder Banner */}
        {leaves.length > 0 && leaves.some(l => {
          const leaveDate = new Date(l.leave_date);
          const diffDays = Math.ceil((leaveDate.getTime() - new Date().getTime()) / (1000 * 3600 * 24));
          return diffDays >= 0 && diffDays <= 7;
        }) && (
          <div className="mb-6 p-5 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/60 rounded-2xl flex items-start gap-4 shadow-sm backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="p-2 bg-amber-100 rounded-lg text-amber-600 shadow-inner">
              <span className="material-symbols-outlined">notification_important</span>
            </div>
            <div>
              <h4 className="font-bold text-amber-900 text-lg">Upcoming Leave Reminder</h4>
              <p className="text-sm text-amber-700 mt-1 leading-relaxed">You have scheduled leave coming up soon. Ensure all pending appointments on those dates are rescheduled or reassigned.</p>
            </div>
          </div>
        )}

        {/* ============ APPOINTMENTS ============ */}
        {activeTab === 'appointments' && (
          <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Assigned Appointments</h2>
              <span className="px-3 py-1 bg-blue-50 text-blue-700 text-sm font-bold rounded-full border border-blue-100 shadow-sm">{appointments.length} Total</span>
            </div>
            
            {appointments.length === 0 ? (
              <div className="p-12 bg-white/60 backdrop-blur-xl border border-white/50 rounded-3xl text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col items-center justify-center gap-4">
                <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center text-blue-500 shadow-inner">
                  <span className="material-symbols-outlined text-[40px]">event_available</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800">No Appointments</h3>
                  <p className="text-slate-500 mt-2">You currently have no appointments assigned to you.</p>
                </div>
              </div>
            ) : (
              <div className="grid gap-5">
                {appointments.map(appt => {
                  const statusColors = {
                    pending: 'from-amber-400 to-orange-400 text-amber-900 border-amber-200 bg-amber-50',
                    confirmed: 'from-emerald-400 to-teal-500 text-emerald-900 border-emerald-200 bg-emerald-50',
                    completed: 'from-blue-400 to-indigo-500 text-blue-900 border-blue-200 bg-blue-50',
                    cancelled: 'from-red-400 to-rose-500 text-red-900 border-red-200 bg-red-50'
                  }
                  const currentStatusColor = statusColors[appt.status as keyof typeof statusColors] || statusColors.pending;
                  const currentStatusBadge = appt.status === 'pending' ? 'bg-amber-100 text-amber-800' : appt.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800' : appt.status === 'completed' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800';

                  return (
                    <div key={appt.id} className="group p-6 bg-white/80 backdrop-blur-xl border border-white shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 rounded-2xl flex flex-col xl:flex-row xl:items-start justify-between gap-6 relative overflow-hidden">
                      {/* Gradient Line Indicator */}
                      <div className={`absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b ${currentStatusColor.split(' ')[0]} ${currentStatusColor.split(' ')[1]}`}></div>
                      
                      <div className="flex-1 pl-2">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-300 flex items-center justify-center text-slate-600 font-bold text-lg shadow-inner">
                            {(appt.patient_name || appt.patients?.first_name || 'P')[0].toUpperCase()}
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-900 text-xl tracking-tight">
                              Patient: {appt.patient_name || `${appt.patients?.first_name || 'Unknown'} ${appt.patients?.last_name || ''}`}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`text-xs px-2.5 py-1 rounded-md font-bold uppercase tracking-wider ${currentStatusBadge}`}>
                                Status: {appt.status}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Patient Info Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-5 p-4 bg-slate-50/50 rounded-xl border border-slate-100 text-sm">
                          <div><span className="text-slate-400 text-xs font-bold block uppercase tracking-wider mb-1">Age</span><span className="font-semibold text-slate-700">{getAge(appt.patients?.dob) !== 'N/A' ? `${getAge(appt.patients?.dob)} Years` : 'Not Provided'}</span></div>
                          <div><span className="text-slate-400 text-xs font-bold block uppercase tracking-wider mb-1">Gender</span><span className="font-semibold text-slate-700">{appt.patients?.gender ? appt.patients.gender.charAt(0).toUpperCase() + appt.patients.gender.slice(1) : 'Not Provided'}</span></div>
                          <div><span className="text-slate-400 text-xs font-bold block uppercase tracking-wider mb-1">Blood Group</span><span className="font-semibold text-slate-700">{appt.patients?.blood_group || 'Not Provided'}</span></div>
                          <div><span className="text-slate-400 text-xs font-bold block uppercase tracking-wider mb-1">Phone</span><span className="font-semibold text-slate-700">{appt.patient_phone || appt.patients?.phone || 'Not Provided'}</span></div>
                          <div><span className="text-slate-400 text-xs font-bold block uppercase tracking-wider mb-1">Email</span><span className="font-semibold text-slate-700">{appt.patients?.email || 'Not Provided'}</span></div>
                          <div><span className="text-slate-400 text-xs font-bold block uppercase tracking-wider mb-1">Appointment</span><span className="font-semibold text-slate-700">{new Date(appt.appointment_date).toLocaleDateString(undefined, { day: '2-digit', month: 'long', year: 'numeric' })}, {appt.appointment_time.substring(0, 5)}</span></div>
                          <div className="col-span-2 md:col-span-3"><span className="text-slate-400 text-xs font-bold block uppercase tracking-wider mb-1">Reason for Visit</span><span className="font-semibold text-slate-700">{appt.reason || 'Not Provided'}</span></div>
                        </div>

                        {appt.notes && (
                          <div className="mt-4 p-4 bg-amber-50/50 text-amber-900 text-sm rounded-xl border border-amber-100 relative overflow-hidden">
                            <div className="absolute top-0 left-0 bottom-0 w-1 bg-amber-300"></div>
                            <strong className="block mb-1 text-amber-800">Consultation Notes:</strong> 
                            <p className="opacity-90">{appt.notes}</p>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex flex-row xl:flex-col gap-3 shrink-0 min-w-[160px] pl-2 xl:pl-0 border-t xl:border-t-0 xl:border-l border-slate-100 pt-4 xl:pt-0 xl:pl-6">
                        {appt.status === 'pending' && (
                          <button onClick={() => handleStatusChange(appt.id, 'confirmed')} className="px-5 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-md hover:shadow-lg rounded-xl transition-all w-full flex items-center justify-center gap-2">
                            <span className="material-symbols-outlined text-[18px]">check_circle</span>
                            Accept
                          </button>
                        )}
                        
                        {(appt.status === 'pending' || appt.status === 'confirmed') && (
                          <button onClick={() => setNotesModalData({id: appt.id, notes: appt.notes || ''})} className="px-5 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg rounded-xl transition-all w-full flex items-center justify-center gap-2">
                            <span className="material-symbols-outlined text-[18px]">edit_note</span>
                            Complete
                          </button>
                        )}

                        {appt.status !== 'cancelled' && appt.status !== 'completed' && (
                          <button onClick={() => handleStatusChange(appt.id, 'cancelled')} className="px-5 py-2.5 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-100 rounded-xl transition-all w-full mt-auto flex items-center justify-center gap-2">
                            <span className="material-symbols-outlined text-[18px]">cancel</span>
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ============ AVAILABILITY ============ */}
        {activeTab === 'availability' && (
          <div className="bg-white/70 backdrop-blur-xl p-8 border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-100">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                <span className="material-symbols-outlined text-[28px]">schedule</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Manage Availability</h2>
                <p className="text-slate-500 text-sm mt-1">Set the days you are available for patient consultations.</p>
              </div>
            </div>
            
            {msg.text && (
              <div className={`mb-8 p-4 rounded-xl flex items-center gap-3 text-sm font-semibold border shadow-sm ${msg.type === 'error' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                <span className="material-symbols-outlined">{msg.type === 'error' ? 'error' : 'check_circle'}</span>
                {msg.text}
              </div>
            )}

            <form onSubmit={handleAvailabilityUpdate} className="flex flex-col gap-8">
              <div className="flex flex-col gap-4">
                <label className="text-base font-bold text-slate-700 uppercase tracking-wide">Select Available Days</label>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                    <label key={day} className="group relative flex items-center justify-center p-4 border border-slate-200 bg-white rounded-2xl cursor-pointer hover:border-indigo-300 hover:shadow-md transition-all has-[:checked]:border-indigo-600 has-[:checked]:bg-indigo-50 has-[:checked]:shadow-inner overflow-hidden">
                      <div className="absolute inset-0 bg-indigo-600 opacity-0 group-has-[:checked]:opacity-5 transition-opacity"></div>
                      <input 
                        type="checkbox" 
                        name="available_days" 
                        value={day} 
                        defaultChecked={doctor.available_days?.includes(day)}
                        className="peer sr-only" 
                      />
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-6 h-6 rounded-md border-2 border-slate-300 flex items-center justify-center peer-checked:border-indigo-600 peer-checked:bg-indigo-600 transition-colors">
                          <span className="material-symbols-outlined text-[16px] text-white opacity-0 peer-checked:opacity-100 transform scale-50 peer-checked:scale-100 transition-all">check</span>
                        </div>
                        <span className="font-bold text-slate-600 peer-checked:text-indigo-700">{day}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <button type="submit" disabled={isSubmitting} className="px-8 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:transform-none flex items-center gap-2">
                  {isSubmitting ? 'Saving Changes...' : 'Update Schedule'}
                  {!isSubmitting && <span className="material-symbols-outlined text-[20px]">save</span>}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ============ LEAVE MANAGEMENT ============ */}
        {activeTab === 'leaves' && (
          <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Add Leave Form */}
            <div className="bg-white/70 backdrop-blur-xl p-8 border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl">
              <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-100">
                <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600">
                  <span className="material-symbols-outlined text-[28px]">event_busy</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">Schedule Leave</h2>
                  <p className="text-slate-500 text-sm mt-1">Block out dates when you are unavailable.</p>
                </div>
              </div>
              
              {msg.text && (
                <div className={`mb-8 p-4 rounded-xl flex items-center gap-3 text-sm font-semibold border shadow-sm ${msg.type === 'error' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                  <span className="material-symbols-outlined">{msg.type === 'error' ? 'error' : 'check_circle'}</span>
                  {msg.text}
                </div>
              )}

              <form onSubmit={handleAddLeave} className="flex flex-col lg:flex-row gap-5 items-end">
                <div className="flex flex-col gap-2 flex-1 w-full">
                  <label className="text-sm font-bold text-slate-700 uppercase tracking-wider pl-1">Leave Date</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400">calendar_month</span>
                    <input type="date" name="leave_date" required min={new Date().toISOString().split('T')[0]} className="h-12 w-full pl-12 pr-4 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all shadow-sm font-medium text-slate-700" />
                  </div>
                </div>
                <div className="flex flex-col gap-2 flex-[2] w-full">
                  <label className="text-sm font-bold text-slate-700 uppercase tracking-wider pl-1">Reason (Optional)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400">edit</span>
                    <input type="text" name="reason" placeholder="e.g. Personal emergency, Vacation, Conference" className="h-12 w-full pl-12 pr-4 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all shadow-sm font-medium text-slate-700" />
                  </div>
                </div>
                <button type="submit" disabled={isSubmitting} className="h-12 px-8 bg-gradient-to-r from-slate-800 to-slate-900 text-white font-bold rounded-xl hover:from-slate-700 hover:to-slate-800 shadow-md hover:shadow-lg transition-all disabled:opacity-50 whitespace-nowrap flex items-center gap-2 w-full lg:w-auto justify-center">
                  <span className="material-symbols-outlined text-[20px]">add_circle</span>
                  {isSubmitting ? 'Adding...' : 'Add Leave'}
                </button>
              </form>
            </div>

            {/* Existing Leaves List */}
            <div className="bg-white/70 backdrop-blur-xl p-8 border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl">
              <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600">view_timeline</span>
                Upcoming Leaves
              </h2>
              {leaves.length === 0 ? (
                <div className="p-8 border-2 border-dashed border-slate-200 rounded-2xl text-center">
                  <span className="material-symbols-outlined text-[40px] text-slate-300 mb-3">event_note</span>
                  <p className="text-slate-500 font-medium">You have no upcoming leaves scheduled.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {leaves.map(leave => (
                    <div key={leave.id} className="group flex justify-between items-center p-5 bg-white border border-slate-100 hover:border-slate-200 shadow-sm hover:shadow-md rounded-2xl transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center text-rose-500">
                          <span className="material-symbols-outlined">event_busy</span>
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-lg">{new Date(leave.leave_date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                          {leave.reason ? (
                            <div className="text-sm font-medium text-slate-500 mt-0.5">{leave.reason}</div>
                          ) : (
                            <div className="text-sm font-medium text-slate-400 italic mt-0.5">No reason provided</div>
                          )}
                        </div>
                      </div>
                      <button onClick={() => handleRemoveLeave(leave.id)} className="w-10 h-10 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white shadow-sm flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 focus:opacity-100" title="Cancel Leave">
                        <span className="material-symbols-outlined text-[20px]">delete</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============ PROFILE SETTINGS ============ */}
        {activeTab === 'profile' && (
          <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Profile Settings</h2>
            </div>
            
            <div className="bg-white/60 backdrop-blur-xl p-8 border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl">
              {msg.text && (
                <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 text-sm font-semibold border shadow-sm ${msg.type === 'error' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                  <span className="material-symbols-outlined">{msg.type === 'error' ? 'error' : 'check_circle'}</span>
                  {msg.text}
                </div>
              )}

              <form onSubmit={handleProfileUpdate} className="flex flex-col gap-6">
                
                {/* Photo Upload Section */}
                <div className="flex items-center gap-6 mb-4">
                  <div className="relative group">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg bg-slate-100 flex items-center justify-center">
                      {photoPreview ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <span className="material-symbols-outlined text-[40px] text-slate-300">person</span>
                      )}
                    </div>
                    <label className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-md cursor-pointer hover:bg-blue-700 transition-colors">
                      <span className="material-symbols-outlined text-[16px]">photo_camera</span>
                      <input type="file" name="photo" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                    </label>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">Profile Photo</h3>
                    <p className="text-sm text-slate-500">Upload a professional photo. Max 2MB.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-slate-700">First Name</label>
                    <input type="text" name="first_name" defaultValue={doctor.first_name} required className="h-11 px-3 border border-slate-200 rounded-xl text-sm bg-white text-slate-700 focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-slate-700">Last Name</label>
                    <input type="text" name="last_name" defaultValue={doctor.last_name} required className="h-11 px-3 border border-slate-200 rounded-xl text-sm bg-white text-slate-700 focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-slate-700">Phone Number</label>
                    <input type="tel" name="phone" defaultValue={doctor.phone} className="h-11 px-3 border border-slate-200 rounded-xl text-sm bg-white text-slate-700 focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-slate-700">Consultation Fee (₹)</label>
                    <input type="number" name="consultation_fee" defaultValue={doctor.consultation_fee} required className="h-11 px-3 border border-slate-200 rounded-xl text-sm bg-white text-slate-700 focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-slate-700">Designation</label>
                    <input type="text" name="designation" defaultValue={doctor.designation} required className="h-11 px-3 border border-slate-200 rounded-xl text-sm bg-white text-slate-700 focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-slate-700">Experience</label>
                    <input type="text" name="experience" defaultValue={doctor.experience} required placeholder="e.g. 15+ Years" className="h-11 px-3 border border-slate-200 rounded-xl text-sm bg-white text-slate-700 focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all" />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-700">Qualifications</label>
                  <input type="text" name="qualifications" defaultValue={doctor.qualifications} required placeholder="e.g. MBBS, MD" className="h-11 px-3 border border-slate-200 rounded-xl text-sm bg-white text-slate-700 focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all" />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-700">Languages (comma separated)</label>
                  <input type="text" name="languages" defaultValue={Array.isArray(doctor.languages) ? doctor.languages.join(', ') : doctor.languages} required placeholder="e.g. English, Hindi" className="h-11 px-3 border border-slate-200 rounded-xl text-sm bg-white text-slate-700 focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all" />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-700">Bio</label>
                  <textarea name="bio" defaultValue={doctor.bio} className="h-24 py-2 px-3 border border-slate-200 rounded-xl text-sm bg-white text-slate-700 focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all resize-none"></textarea>
                </div>

                <div className="mt-4 flex justify-end">
                  <button type="submit" disabled={isSubmitting} className="h-12 px-8 bg-blue-700 text-white font-bold rounded-xl hover:bg-blue-800 shadow-md hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2">
                    {isSubmitting ? (
                      <>
                        <span className="material-symbols-outlined animate-spin text-[20px]">sync</span>
                        Saving...
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[20px]">save</span>
                        Save Profile
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>

      {/* NOTES MODAL WITH PREMIUM STYLING */}
      {notesModalData && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-2xl border border-white/50 overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-6 md:p-8 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-blue-50/50 to-transparent">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                  <span className="material-symbols-outlined">edit_note</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Consultation Notes</h2>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-0.5">Complete Appointment</p>
                </div>
              </div>
              <button onClick={() => setNotesModalData(null)} className="w-10 h-10 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="p-6 md:p-8 flex flex-col gap-6">
              <div className="p-4 bg-blue-50/80 border border-blue-100 rounded-xl flex gap-3 text-blue-800">
                <span className="material-symbols-outlined text-blue-500 mt-0.5">info</span>
                <p className="text-sm font-medium leading-relaxed">Record your consultation notes, diagnoses, or prescriptions below. Saving this will permanently mark the appointment status as <strong className="font-bold">Completed</strong>.</p>
              </div>
              
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-slate-700 uppercase tracking-wider pl-1">Clinical Notes</label>
                <textarea 
                  className="w-full h-40 p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 focus:bg-white outline-none resize-none transition-all shadow-inner font-medium text-slate-700"
                  placeholder="Enter detailed clinical notes here..."
                  value={notesModalData.notes}
                  onChange={e => setNotesModalData({...notesModalData, notes: e.target.value})}
                  autoFocus
                />
              </div>

              <div className="flex justify-end gap-3 mt-2 pt-6 border-t border-slate-100">
                <button onClick={() => setNotesModalData(null)} className="px-6 py-3 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
                <button onClick={saveNotes} disabled={isSubmitting} className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:transform-none flex items-center gap-2">
                  {isSubmitting ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-[20px]">sync</span>
                      Saving...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[20px]">task_alt</span>
                      Save & Complete
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
