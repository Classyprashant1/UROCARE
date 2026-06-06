'use client'

import { useState } from 'react'
import { cancelAppointment, updatePatientProfile } from '@/app/actions/patient'

export default function PatientDashboardClient({ 
  profile, 
  appointments, 
  medicalHistory, 
  prescriptions 
}: { 
  profile: any, 
  appointments: any[], 
  medicalHistory: any[], 
  prescriptions: any[] 
}) {
  const [activeTab, setActiveTab] = useState('appointments')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [msg, setMsg] = useState({ type: '', text: '' })

  const handleProfileUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMsg({ type: '', text: '' })

    const formData = new FormData(e.currentTarget)
    const res = await updatePatientProfile(formData)
    
    setIsSubmitting(false)
    if (res.success) {
      setMsg({ type: 'success', text: 'Profile updated successfully.' })
    } else {
      setMsg({ type: 'error', text: res.error || 'Failed to update profile.' })
    }
  }

  const handleCancelAppointment = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this appointment?")) return;
    
    const res = await cancelAppointment(id)
    if (!res.success) {
      alert(res.error || "Failed to cancel appointment.")
    }
  }

  return (
    <div className="flex flex-col md:flex-row gap-8 items-start">
      
      {/* Sidebar Tabs */}
      <div className="w-full md:w-64 flex flex-col gap-2 shrink-0 sticky top-24">
        {[
          { id: 'appointments', label: 'My Appointments', icon: 'calendar_month' },
          { id: 'history', label: 'Medical History', icon: 'history' },
          { id: 'prescriptions', label: 'Prescriptions', icon: 'prescriptions' },
          { id: 'profile', label: 'Profile Settings', icon: 'person' },
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
            <h2 className="text-xl font-bold text-slate-800">Your Appointments</h2>
            {appointments.length === 0 ? (
              <div className="p-8 bg-slate-50 border border-slate-200 rounded-xl text-center text-slate-500">
                You have no appointments.
              </div>
            ) : (
              <div className="grid gap-4">
                {appointments.map(appt => (
                  <div key={appt.id} className="p-5 bg-white border border-slate-200 shadow-sm rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden">
                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${appt.status === 'pending' ? 'bg-amber-400' : appt.status === 'confirmed' ? 'bg-green-500' : appt.status === 'cancelled' ? 'bg-red-500' : 'bg-slate-300'}`}></div>
                    
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-bold text-slate-900 text-lg">Dr. {appt.doctors?.first_name} {appt.doctors?.last_name}</h3>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold">{appt.doctors?.departments?.name || appt.departments?.name}</span>
                      </div>
                      <p className="text-sm text-slate-500 font-medium">
                        {new Date(appt.appointment_date).toLocaleDateString()} at {appt.appointment_time.substring(0, 5)}
                      </p>
                      <p className="text-xs text-slate-400 mt-2">Status: <span className="uppercase font-bold">{appt.status}</span></p>
                    </div>

                    <div className="flex items-center gap-3">
                      {(appt.status === 'pending' || appt.status === 'confirmed') && (
                        <button onClick={() => handleCancelAppointment(appt.id)} className="px-4 py-2 text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ============ MEDICAL HISTORY ============ */}
        {activeTab === 'history' && (
          <div className="flex flex-col gap-6">
            <h2 className="text-xl font-bold text-slate-800">Medical History</h2>
            {medicalHistory.length === 0 ? (
              <div className="p-8 bg-slate-50 border border-slate-200 rounded-xl text-center text-slate-500">
                No medical history records found.
              </div>
            ) : (
              <div className="grid gap-4">
                {medicalHistory.map(record => (
                  <div key={record.id} className="p-5 bg-white border border-slate-200 shadow-sm rounded-xl">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-bold text-blue-800 text-lg">{record.condition_type}</h3>
                      <span className="text-xs text-slate-400">{new Date(record.date_recorded).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed">{record.description}</p>
                    {record.doctors && (
                      <p className="text-xs text-slate-400 mt-3 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">stethoscope</span>
                        Recorded by Dr. {record.doctors.first_name} {record.doctors.last_name}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ============ PRESCRIPTIONS ============ */}
        {activeTab === 'prescriptions' && (
          <div className="flex flex-col gap-6">
            <h2 className="text-xl font-bold text-slate-800">Prescriptions</h2>
            {prescriptions.length === 0 ? (
              <div className="p-8 bg-slate-50 border border-slate-200 rounded-xl text-center text-slate-500">
                No prescriptions found.
              </div>
            ) : (
              <div className="grid gap-4">
                {prescriptions.map(rx => {
                  const meds = typeof rx.medications === 'string' ? JSON.parse(rx.medications) : rx.medications;
                  return (
                    <div key={rx.id} className="p-6 bg-white border border-slate-200 shadow-sm rounded-xl">
                      <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-100">
                        <div>
                          <h3 className="font-bold text-slate-900 flex items-center gap-2">
                            <span className="material-symbols-outlined text-teal-600">medical_services</span>
                            Prescription
                          </h3>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {new Date(rx.created_at).toLocaleDateString()} • Dr. {rx.doctors?.first_name} {rx.doctors?.last_name}
                          </p>
                        </div>
                        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-md font-semibold text-xs transition">
                          <span className="material-symbols-outlined text-[16px]">download</span>
                          Download
                        </button>
                      </div>
                      
                      <div className="space-y-3">
                        {meds?.map((med: any, i: number) => (
                          <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-slate-50 rounded-lg">
                            <span className="font-semibold text-slate-800 text-sm">{med.name}</span>
                            <span className="text-xs text-slate-600">{med.dosage} • {med.frequency} • {med.duration}</span>
                          </div>
                        ))}
                      </div>

                      {rx.instructions && (
                        <div className="mt-4 pt-4 border-t border-slate-100">
                          <p className="text-xs font-bold text-slate-500 mb-1">DOCTOR'S INSTRUCTIONS</p>
                          <p className="text-sm text-slate-700">{rx.instructions}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ============ PROFILE ============ */}
        {activeTab === 'profile' && (
          <div className="bg-white p-6 md:p-8 border border-slate-200 shadow-sm rounded-2xl">
            <h2 className="text-xl font-bold text-slate-800 mb-6">Profile Settings</h2>
            
            {msg.text && (
              <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 text-sm font-medium border ${msg.type === 'error' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
                <span className="material-symbols-outlined">{msg.type === 'error' ? 'error' : 'check_circle'}</span>
                {msg.text}
              </div>
            )}

            <form onSubmit={handleProfileUpdate} className="flex flex-col gap-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-700">First Name</label>
                  <input name="first_name" defaultValue={profile.first_name} required className="h-11 px-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-700">Last Name</label>
                  <input name="last_name" defaultValue={profile.last_name} required className="h-11 px-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-700">Phone</label>
                  <input name="phone" defaultValue={profile.phone} className="h-11 px-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-700">Date of Birth</label>
                  <input type="date" name="dob" defaultValue={profile.dob} className="h-11 px-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-700">Gender</label>
                  <select name="gender" defaultValue={profile.gender} className="h-11 px-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none bg-white">
                    <option value="">Select...</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-700">Blood Group</label>
                  <select name="blood_group" defaultValue={profile.blood_group} className="h-11 px-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none bg-white">
                    <option value="">Select...</option>
                    <option value="A+">A+</option><option value="A-">A-</option>
                    <option value="B+">B+</option><option value="B-">B-</option>
                    <option value="O+">O+</option><option value="O-">O-</option>
                    <option value="AB+">AB+</option><option value="AB-">AB-</option>
                  </select>
                </div>
              </div>



              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate-700">Residential Address</label>
                <textarea name="address" defaultValue={profile.address} className="p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none min-h-[100px]" />
              </div>

              <div className="mt-4 flex justify-end">
                <button type="submit" disabled={isSubmitting} className="px-6 py-3 bg-blue-700 text-white font-bold rounded-lg hover:bg-blue-800 transition disabled:opacity-50 flex items-center gap-2">
                  {isSubmitting ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  )
}
