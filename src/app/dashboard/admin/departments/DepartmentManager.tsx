'use client'

import { useState } from 'react'
import { addDepartment, deleteDepartment } from '@/app/actions/admin/departments'

export default function DepartmentManager({ departments }: { departments: any[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  return (
    <div>
      <div className="flex justify-end mb-6">
        <button onClick={() => setIsModalOpen(true)} className="bg-blue-700 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-blue-800 transition flex items-center gap-2 shadow-sm">
          <span className="material-symbols-outlined">add</span>
          Add Department
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departments.map(dept => (
          <div key={dept.id} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col justify-between relative overflow-hidden">
            {dept.is_coe && (
              <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 text-[10px] font-bold uppercase px-3 py-1 rounded-bl-lg">
                Center of Excellence
              </div>
            )}
            
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">{dept.name}</h3>
              <p className="text-sm text-slate-600 line-clamp-3 mb-4">{dept.description || 'No description provided.'}</p>
              
              {dept.services && dept.services.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {dept.services.slice(0, 3).map((service: string, i: number) => (
                    <span key={i} className="text-[10px] bg-slate-100 text-slate-600 font-semibold px-2 py-1 rounded-full uppercase">{service}</span>
                  ))}
                  {dept.services.length > 3 && (
                    <span className="text-[10px] bg-slate-100 text-slate-600 font-semibold px-2 py-1 rounded-full uppercase">+{dept.services.length - 3} more</span>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-end border-t border-slate-100 pt-4 mt-auto">
              <button 
                onClick={async () => {
                  if (confirm(`Are you sure you want to delete ${dept.name}?`)) {
                    await deleteDepartment(dept.id);
                  }
                }}
                className="text-sm font-semibold text-red-600 hover:text-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-800">Add Department</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form action={async (formData) => {
              setIsSubmitting(true);
              setErrorMsg('');
              const res = await addDepartment(formData);
              setIsSubmitting(false);
              if (res.success) {
                setIsModalOpen(false);
              } else {
                setErrorMsg(res.error || 'Failed to add department.');
              }
            }} className="p-6 flex flex-col gap-5">
              
              {errorMsg && (
                <div className="p-3 bg-red-50 text-red-700 rounded border border-red-200 text-sm">
                  {errorMsg}
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate-700">Department Name</label>
                <input name="name" required placeholder="e.g. Cardiology" className="h-10 px-3 border rounded-lg" />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate-700">Description</label>
                <textarea name="description" placeholder="A brief overview of the department..." className="p-3 border rounded-lg resize-none h-24" />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate-700">Services (Comma separated)</label>
                <input name="services" placeholder="e.g. ECG, Heart Bypass, Angiography" className="h-10 px-3 border rounded-lg" />
              </div>

              <label className="flex items-center gap-3 p-4 border rounded-xl cursor-pointer hover:bg-slate-50 transition">
                <input type="checkbox" name="is_coe" value="true" className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-600" />
                <div>
                  <span className="font-semibold text-slate-800 block">Center of Excellence</span>
                  <span className="text-xs text-slate-500">Highlight this department prominently on the website.</span>
                </div>
              </label>

              <div className="mt-2 pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="px-5 py-2 bg-blue-700 text-white font-semibold rounded-lg hover:bg-blue-800 disabled:opacity-50">
                  {isSubmitting ? 'Saving...' : 'Add Department'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
