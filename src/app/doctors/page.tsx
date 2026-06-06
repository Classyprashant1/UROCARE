import Link from "next/link";
import { getDoctors } from "@/app/actions/data";
import { Avatar } from "@/components/ui/Avatar";

export const metadata = {
  title: "Our Specialists | Urocare Apolo Hospital",
  description: "Meet our team of experienced doctors and medical specialists.",
};

export default async function DoctorsPage() {
  const doctors = await getDoctors();

  return (
    <div className="min-h-screen bg-slate-50 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Our Specialists</h1>
          <p className="mt-4 text-lg text-slate-600">
            Meet our highly qualified team of experienced doctors dedicated to your health and well-being.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {doctors.map((doctor: any) => (
            <div key={doctor.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg transition">
              <div className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <Avatar 
                    src={doctor.avatar_url} 
                    alt={doctor.name} 
                    initials={doctor.name.split(' ').slice(-1)[0][0]} 
                    className="w-16 h-16 text-xl" 
                  />
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">{doctor.name}</h3>
                    <p className="text-blue-700 font-medium text-sm">{doctor.department}</p>
                  </div>
                </div>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-start gap-3 text-slate-600 text-sm">
                    <span className="material-symbols-outlined text-[20px] text-slate-400">school</span>
                    <span>{doctor.qualifications || doctor.designation}</span>
                  </div>
                  {doctor.experience && (
                    <div className="flex items-start gap-3 text-slate-600 text-sm">
                      <span className="material-symbols-outlined text-[20px] text-slate-400">work</span>
                      <span>{doctor.experience}</span>
                    </div>
                  )}
                  {doctor.languages && (
                    <div className="flex items-start gap-3 text-slate-600 text-sm">
                      <span className="material-symbols-outlined text-[20px] text-slate-400">translate</span>
                      <span>{(Array.isArray(doctor.languages) ? doctor.languages.join(', ') : doctor.languages)}</span>
                    </div>
                  )}
                </div>

                <Link 
                  href={`/booking?doctor=${doctor.id}`}
                  className="w-full inline-flex justify-center items-center gap-2 bg-blue-700 text-white font-semibold py-3 rounded-xl hover:bg-blue-800 transition"
                >
                  <span className="material-symbols-outlined text-[20px]">calendar_month</span>
                  Book Appointment
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
