import BookingForm from './BookingForm'
import { getDepartments, getDoctors } from '@/app/actions/data'

export default async function BookingPage() {
  const departments = await getDepartments()
  const doctors = await getDoctors()

  return (
    <div className="max-w-3xl mx-auto my-12 px-4">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Book an Appointment</h1>
        <p className="text-slate-500 mt-3">Select a department, choose your preferred doctor, and pick a time.</p>
      </div>

      {/* Renders the interactive client form, passing down the Supabase data */}
      <BookingForm departments={departments} doctors={doctors} />
    </div>
  )
}
