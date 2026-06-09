'use client'

import { useState } from 'react'
import { addDoctor, deleteDoctor } from '@/app/actions/admin/doctors'
import { Avatar } from '@/components/ui/Avatar'

export default function DoctorManager({ initialDoctors, departments }: { initialDoctors: any[], departments: any[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})

  // Basic list view
  return (
    <div>
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-800 transition flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          Add New Doctor
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
            <tr>
              <th className="px-6 py-4">Doctor Name</th>
              <th className="px-6 py-4">Department</th>
              <th className="px-6 py-4">Designation</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {initialDoctors.map(doctor => (
              <tr key={doctor.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-900 flex items-center gap-3">
                  <Avatar
                    src={doctor.avatar_url}
                    alt={doctor.name}
                    initials={doctor.name.split(' ').slice(-1)[0][0]}
                    className="w-10 h-10 text-sm"
                  />
                  {doctor.name}
                </td>
                <td className="px-6 py-4">{doctor.department}</td>
                <td className="px-6 py-4">{doctor.designation}</td>
                <td className="px-6 py-4 text-right flex justify-end gap-3">
                  <button
                    onClick={async () => {
                      if (confirm('Are you sure you want to delete this doctor?')) {
                        await deleteDoctor(doctor.id);
                      }
                    }}
                    className="text-red-500 hover:text-red-700 font-medium"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {initialDoctors.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-slate-500">No doctors found. Add one to get started.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Doctor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white">
              <h2 className="text-xl font-bold text-slate-800">Add New Doctor</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form action={async (formData) => {
              setIsSubmitting(true);
              setErrorMsg('');
              setFieldErrors({});
              const res = await addDoctor(formData);
              setIsSubmitting(false);
              if (res.success) {
                setIsModalOpen(false);
              } else {
                setErrorMsg(res.error || 'Failed to add doctor.');
                if (res.fieldErrors) setFieldErrors(res.fieldErrors);
              }
            }} className="p-6 flex flex-col gap-5">

              {errorMsg && (
                <div className="p-3 bg-red-50 text-red-700 rounded border border-red-200 text-sm">
                  {errorMsg}
                  {Object.keys(fieldErrors).length > 0 && (
                    <ul className="list-disc pl-5 mt-2">
                      {Object.entries(fieldErrors).map(([field, errors]) => (
                        <li key={field}><strong>{field}:</strong> {errors.join(', ')}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-700">First Name</label>
                  <input name="first_name" required className="h-10 px-3 border rounded-lg" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-700">Last Name</label>
                  <input name="last_name" required className="h-10 px-3 border rounded-lg" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-700">Login Email</label>
                  <input type="email" name="email" required className="h-10 px-3 border rounded-lg" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-700">Initial Password</label>
                  <input type="text" name="password" required minLength={6} className="h-10 px-3 border rounded-lg" />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-700">Departments</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
                  {departments.map(d => (
                    <label key={d.id} className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer hover:text-blue-700 transition-colors">
                      <input type="checkbox" name="department_ids" value={d.id} className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600" />
                      {d.name}
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate-700">Designation</label>
                <input name="designation" required placeholder="e.g. Senior Consultant" className="h-10 px-3 border rounded-lg" />
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-700">Consultation Fee (₹)</label>
                  <input type="number" name="consultation_fee" required className="h-10 px-3 border rounded-lg" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-700">Experience</label>
                  <input name="experience" required placeholder="e.g. 15+ Years" className="h-10 px-3 border rounded-lg" />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate-700">Qualifications</label>
                <input name="qualifications" required placeholder="e.g. MBBS, MD" className="h-10 px-3 border rounded-lg" />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate-700">Languages (comma separated)</label>
                <input name="languages" required placeholder="e.g. English, Hindi" className="h-10 px-3 border rounded-lg" />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate-700">Profile Photo (Optional)</label>
                <input type="file" name="photo" accept="image/*" className="h-10 px-3 border rounded-lg py-1.5 text-sm" />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-700">Available Days</label>
                <div className="flex flex-wrap gap-3">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                    <label key={day} className="flex items-center gap-1.5 text-sm">
                      <input type="checkbox" name="available_days" value={day} className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600" />
                      {day}
                    </label>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="px-5 py-2 bg-blue-700 text-white font-semibold rounded-lg hover:bg-blue-800 disabled:opacity-50">
                  {isSubmitting ? 'Saving...' : 'Add Doctor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
