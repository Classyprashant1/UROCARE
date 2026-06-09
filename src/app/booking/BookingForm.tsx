'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { createAppointment, getAvailableTimeSlots, SlotInfo } from '@/app/actions/appointments'

export default function BookingForm({ departments, doctors }: { departments: any[], doctors: any[] }) {
  const searchParams = useSearchParams()
  const [step, setStep] = useState(1)
  const [deptId, setDeptId] = useState('')
  const [doctorId, setDoctorId] = useState('')
  const [date, setDate] = useState('')
  
  const [availableSlots, setAvailableSlots] = useState<SlotInfo[]>([])
  const [isLoadingSlots, setIsLoadingSlots] = useState(false)
  const [selectedSlotObj, setSelectedSlotObj] = useState<SlotInfo | null>(null)

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

  useEffect(() => {
    const fetchSlots = async () => {
      if (doctorId && date) {
        setIsLoadingSlots(true);
        setSelectedSlotObj(null);
        try {
          const slots = await getAvailableTimeSlots(doctorId, date);
          setAvailableSlots(slots);
        } catch (err) {
          setAvailableSlots([]);
        } finally {
          setIsLoadingSlots(false);
        }
      } else {
        setAvailableSlots([]);
      }
    };
    fetchSlots();
  }, [doctorId, date]);

  const filteredDoctors = doctors.filter(d => {
    if (doctorId && d.id !== doctorId) return false;
    if (deptId) {
      console.log('Selected Department:', deptId);
      console.log('Doctor:', d.name);
      console.log('Department IDs:', d.departmentIds);
      
      return Array.isArray(d.departmentIds) && d.departmentIds.includes(deptId);
    }
    return true;
  });

  const selectedDoctorInfo = doctors.find(d => d.id === doctorId);

  const isValidDate = (selectedDate: string) => {
    if (!selectedDate || !selectedDoctorInfo?.available_days) return true;
    const dayOfWeek = new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'short' });
    return selectedDoctorInfo.available_days.includes(dayOfWeek);
  }

  const dateError = date && !isValidDate(date) ? `Doctor is only available on: ${selectedDoctorInfo?.available_days.join(', ')}` : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValidDate(date) || !selectedSlotObj) return;

    setIsSubmitting(true)
    setErrorMsg('')
    setFieldErrors({})
    
    const formData = new FormData()
    formData.append('patient_name', patientName)
    formData.append('patient_phone', patientPhone)
    formData.append('department_id', deptId)
    if (doctorId) formData.append('doctor_id', doctorId)
    formData.append('appointment_date', date)
    formData.append('appointment_slot', selectedSlotObj.slot)
    formData.append('appointment_time', selectedSlotObj.time)
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
              <label htmlFor="patientName" className="text-sm font-semibold text-slate-700">Full Name</label>
              <input 
                id="patientName"
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
              <label htmlFor="patientPhone" className="text-sm font-semibold text-slate-700">Phone Number</label>
              <input 
                id="patientPhone"
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
              <label htmlFor="department" className="text-sm font-semibold text-slate-700">Department</label>
              <select 
                id="department"
                className={`appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:1.2em_1.2em] bg-[right_0.8rem_center] bg-no-repeat pr-10 h-12 px-4 border rounded-lg text-slate-800 focus:ring-2 outline-none ${fieldErrors.department_id ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-600'}`}
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
              <label htmlFor="doctor" className="text-sm font-semibold text-slate-700">Doctor</label>
              <select 
                id="doctor"
                className={`appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:1.2em_1.2em] bg-[right_0.8rem_center] bg-no-repeat pr-10 h-12 px-4 border rounded-lg text-slate-800 focus:ring-2 outline-none ${fieldErrors.doctor_id ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-600'}`}
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
              <label htmlFor="timeSlot" className="text-sm font-semibold text-slate-700">Available Time Slots</label>
              <div className="relative">
                <select 
                  id="timeSlot"
                  className={`appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:1.2em_1.2em] bg-[right_0.8rem_center] bg-no-repeat pr-10 h-12 w-full px-4 border rounded-lg text-slate-800 focus:ring-2 outline-none ${fieldErrors.appointment_time ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-600'}`}
                  value={selectedSlotObj ? `${selectedSlotObj.slot}|${selectedSlotObj.time}` : ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (!val) {
                      setSelectedSlotObj(null);
                      return;
                    }
                    const [slot, time] = val.split('|');
                    setSelectedSlotObj({ slot, time });
                  }}
                  required
                  disabled={!date || !doctorId || !!dateError || isLoadingSlots || availableSlots.length === 0}
                >
                  <option value="">
                    {!date ? 'Select a date first' : 
                     isLoadingSlots ? 'Loading slots...' : 
                     availableSlots.length === 0 ? 'No slots available' : 'Select Time...'}
                  </option>
                  {availableSlots.map(s => (
                    <option key={`${s.slot}|${s.time}`} value={`${s.slot}|${s.time}`}>
                      {s.time} ({s.slot})
                    </option>
                  ))}
                </select>
                {isLoadingSlots && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <span className="material-symbols-outlined animate-spin text-slate-400">sync</span>
                  </div>
                )}
              </div>
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
            <button type="submit" disabled={!date || !selectedSlotObj || !reason || isSubmitting || !!dateError} className="px-6 py-3 bg-blue-700 text-white font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-800 transition-colors flex items-center gap-2">
              {isSubmitting ? 'Booking...' : 'Confirm Booking'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
