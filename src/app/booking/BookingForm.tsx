'use client'

import { useState, useEffect } from 'react'
import { createAppointment, getAvailableTimeSlots } from '@/app/actions/appointments'

export default function BookingForm({ departments, doctors }: { departments: any[], doctors: any[] }) {
  const [step, setStep] = useState(1)
  const [deptId, setDeptId] = useState('')
  const [doctorId, setDoctorId] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [reason, setReason] = useState('')
  
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [isLoadingSlots, setIsLoadingSlots] = useState(false)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})

  const filteredDoctors = doctorId ? doctors.filter(d => d.id === doctorId) : 
                          deptId ? doctors.filter(d => d.department === departments.find(dep=>dep.id === deptId)?.name) : doctors

  // Dynamic time slot fetching removed as requested
  // User just selects Morning or Evening directly from the hardcoded list.

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMsg('')
    setFieldErrors({})
    
    const formData = new FormData()
    formData.append('department_id', deptId)
    if (doctorId) formData.append('doctor_id', doctorId)
    formData.append('appointment_date', date)
    formData.append('appointment_time', time)
    formData.append('reason', reason)

    const res = await createAppointment(formData)
    
    setIsSubmitting(false)

    if (res.success) {
      setSubmitted(true)
    } else {
      setErrorMsg(res.error || 'Failed to book appointment.')
      if (res.fieldErrors) {
        setFieldErrors(res.fieldErrors)
      }
    }
  }

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto my-20 bg-white p-10 rounded-2xl shadow-xl text-center border border-slate-200">
        <span className="material-symbols-outlined text-[80px] text-teal-500 mb-6 font-variation-fill">check_circle</span>
        <h2 className="text-3xl font-bold text-slate-900 mb-4">Appointment Requested</h2>
        <p className="text-slate-600 mb-8">
          Your request for an appointment has been securely recorded. 
          Our team will contact you shortly to confirm the exact time slot.
        </p>
        <button onClick={() => window.location.href = '/dashboard/patient'} className="px-6 py-3 bg-blue-700 text-white rounded-lg font-bold hover:bg-blue-800 transition-colors">
          Go to My Dashboard
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200">
      {errorMsg && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start gap-3">
          <span className="material-symbols-outlined mt-0.5">error</span>
          <p className="text-sm font-medium leading-relaxed">{errorMsg}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Step 1: Department & Doctor */}
        <div className={`transition-opacity duration-300 ${step !== 1 ? 'hidden' : 'block'}`}>
          <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 text-sm">1</span>
            Specialty & Doctor
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-700">Department</label>
              <select 
                className={`h-12 px-4 border rounded-lg text-slate-800 focus:ring-2 outline-none ${fieldErrors.department_id ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-600'}`}
                value={deptId}
                onChange={(e) => { setDeptId(e.target.value); setDoctorId(''); }}
                required
              >
                <option value="">Select Department...</option>
                {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
              {fieldErrors.department_id && <p className="text-xs text-red-500">{fieldErrors.department_id[0]}</p>}
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-700">Doctor</label>
              <select 
                className={`h-12 px-4 border rounded-lg text-slate-800 focus:ring-2 outline-none ${fieldErrors.doctor_id ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-600'}`}
                value={doctorId}
                onChange={(e) => setDoctorId(e.target.value)}
                required
              >
                <option value="">Select Doctor...</option>
                {filteredDoctors.map(d => <option key={d.id} value={d.id}>{d.name} - {d.designation}</option>)}
              </select>
              {fieldErrors.doctor_id && <p className="text-xs text-red-500">{fieldErrors.doctor_id[0]}</p>}
            </div>
          </div>
          <div className="mt-8 flex justify-end">
            <button type="button" onClick={() => setStep(2)} disabled={!deptId || !doctorId} className="px-6 py-3 bg-blue-700 text-white font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-800 transition-colors">
              Next Step
            </button>
          </div>
        </div>

        {/* Step 2: Date & Time */}
        <div className={`transition-opacity duration-300 ${step !== 2 ? 'hidden' : 'block'}`}>
          <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 text-sm">2</span>
            Date & Time
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-700">Preferred Date</label>
              <input 
                type="date"
                className={`h-12 px-4 border rounded-lg text-slate-800 focus:ring-2 outline-none ${fieldErrors.appointment_date ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-600'}`}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
              {fieldErrors.appointment_date && <p className="text-xs text-red-500">{fieldErrors.appointment_date[0]}</p>}
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-700">Preferred Time</label>
              <select 
                className={`h-12 px-4 border rounded-lg text-slate-800 focus:ring-2 outline-none ${fieldErrors.appointment_time ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-600'}`}
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
                disabled={!date || !doctorId}
              >
                <option value="">Select Time...</option>
                <option value="Morning">Morning</option>
                <option value="Evening">Evening</option>
              </select>
              {fieldErrors.appointment_time && <p className="text-xs text-red-500">{fieldErrors.appointment_time[0]}</p>}
            </div>
          </div>
          <div className="flex flex-col gap-2 mt-5">
            <label className="text-sm font-semibold text-slate-700">Reason for Visit</label>
            <textarea 
              className={`p-4 border rounded-lg text-slate-800 focus:ring-2 outline-none min-h-[120px] ${fieldErrors.reason ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-600'}`}
              placeholder="Briefly describe your symptoms or reason for visit..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
            />
            {fieldErrors.reason && <p className="text-xs text-red-500">{fieldErrors.reason[0]}</p>}
          </div>
          <div className="mt-8 flex justify-between">
            <button type="button" onClick={() => setStep(1)} className="px-6 py-3 bg-slate-100 text-slate-700 font-bold rounded-lg hover:bg-slate-200 transition-colors">
              Back
            </button>
            <button type="submit" disabled={!date || !time || !reason || isSubmitting} className="px-6 py-3 bg-blue-700 text-white font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-800 transition-colors flex items-center gap-2">
              {isSubmitting ? 'Booking...' : 'Confirm Booking'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
