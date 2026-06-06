'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { createAppointment } from '@/app/actions/appointments'

export default function BookingForm({ departments, doctors }: { departments: any[], doctors: any[] }) {
  const searchParams = useSearchParams()
  const [step, setStep] = useState(1)
  const [deptId, setDeptId] = useState('')
  const [doctorId, setDoctorId] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [reason, setReason] = useState('')
  const [patientName, setPatientName] = useState('')
  const [patientPhone, setPatientPhone] = useState('')
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})

  useEffect(() => {
    const sDept = searchParams.get('deptId')
    const sDoc = searchParams.get('doctorId')
    const sDate = searchParams.get('date')
    
    if (sDept) setDeptId(sDept)
    if (sDoc) setDoctorId(sDoc)
    if (sDate) {
      setDate(sDate)
      setStep(2)
    }
  }, [searchParams])

  const filteredDoctors = doctorId ? doctors.filter(d => d.id === doctorId) : 
                          deptId ? doctors.filter(d => d.department === departments.find(dep=>dep.id === deptId)?.name) : doctors

  const selectedDoctorInfo = doctors.find(d => d.id === doctorId);

  const isValidDate = (selectedDate: string) => {
    if (!selectedDate || !selectedDoctorInfo?.available_days) return true;
    const dayOfWeek = new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'short' });
    return selectedDoctorInfo.available_days.includes(dayOfWeek);
  }

  const dateError = date && !isValidDate(date) ? `Doctor is only available on: ${selectedDoctorInfo?.available_days.join(', ')}` : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValidDate(date)) return;

    setIsSubmitting(true)
    setErrorMsg('')
    setFieldErrors({})
    
    const formData = new FormData()
    formData.append('patient_name', patientName)
    formData.append('patient_phone', patientPhone)
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
      <div className="bg-green-50 p-10 rounded-2xl border border-green-200 text-center shadow-sm">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="material-symbols-outlined text-green-600 text-3xl">check_circle</span>
        </div>
        <h2 className="text-2xl font-bold text-green-800 mb-2">Booking Confirmed!</h2>
        <p className="text-green-700">Your appointment has been successfully scheduled. We will send you a confirmation message shortly.</p>
      </div>
    )
  }

  return (
    <div className="bg-white p-8 md:p-12 rounded-3xl border border-slate-200 shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none"></div>

      {errorMsg && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl flex items-center gap-3">
          <span className="material-symbols-outlined">error</span>
          <p className="font-semibold">{errorMsg}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="relative z-10 flex flex-col gap-8">
        <div className={`transition-opacity duration-300 ${step !== 1 ? 'hidden' : 'block'}`}>
          <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 text-sm">1</span>
            Patient Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-700">Full Name</label>
              <input 
                type="text"
                className={`h-12 px-4 border rounded-lg text-slate-800 focus:ring-2 outline-none ${fieldErrors.patient_name ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-600'}`}
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                required
                placeholder="Full Name"
              />
              {fieldErrors.patient_name && <p className="text-xs text-red-500">{fieldErrors.patient_name[0]}</p>}
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-700">Phone Number</label>
              <input 
                type="tel"
                className={`h-12 px-4 border rounded-lg text-slate-800 focus:ring-2 outline-none ${fieldErrors.patient_phone ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-600'}`}
                value={patientPhone}
                onChange={(e) => setPatientPhone(e.target.value)}
                required
                placeholder="+1234567890"
              />
              {fieldErrors.patient_phone && <p className="text-xs text-red-500">{fieldErrors.patient_phone[0]}</p>}
            </div>
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2 mt-8 border-t pt-8 border-slate-100">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 text-sm">2</span>
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
            <button type="button" onClick={() => setStep(2)} disabled={!patientName || !patientPhone || !deptId || !doctorId} className="px-6 py-3 bg-blue-700 text-white font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-800 transition-colors">
              Next Step
            </button>
          </div>
        </div>

        <div className={`transition-opacity duration-300 ${step !== 2 ? 'hidden' : 'block'}`}>
          <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 text-sm">3</span>
            Date & Time
          </h2>
          {selectedDoctorInfo && selectedDoctorInfo.available_days && (
            <div className="mb-4 text-sm font-medium text-blue-700 bg-blue-50 p-3 rounded-lg flex items-center gap-2 border border-blue-100">
              <span className="material-symbols-outlined text-[18px]">info</span>
              {selectedDoctorInfo.name} is available on: <strong className="ml-1">{selectedDoctorInfo.available_days.join(', ')}</strong>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-700">Preferred Date</label>
              <input 
                type="date"
                min={new Date().toISOString().split('T')[0]}
                className={`h-12 px-4 border rounded-lg text-slate-800 focus:ring-2 outline-none ${fieldErrors.appointment_date || dateError ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-600'}`}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
              {dateError && <p className="text-xs text-red-500 font-bold">{dateError}</p>}
              {fieldErrors.appointment_date && !dateError && <p className="text-xs text-red-500">{fieldErrors.appointment_date[0]}</p>}
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-700">Preferred Time</label>
              <select 
                className={`h-12 px-4 border rounded-lg text-slate-800 focus:ring-2 outline-none ${fieldErrors.appointment_time ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-600'}`}
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
                disabled={!date || !doctorId || !!dateError}
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
            <button type="submit" disabled={!date || !time || !reason || isSubmitting || !!dateError} className="px-6 py-3 bg-blue-700 text-white font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-800 transition-colors flex items-center gap-2">
              {isSubmitting ? 'Booking...' : 'Confirm Booking'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
