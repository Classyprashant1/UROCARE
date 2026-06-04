import Link from "next/link";
import { getDepartments } from "@/app/actions/data";

export const metadata = {
  title: "Medical Departments | Urocare Apolo Hospital",
  description: "Explore our specialized medical departments and centers of excellence.",
};

export default async function DepartmentsPage() {
  const departments = await getDepartments();

  return (
    <div className="min-h-screen bg-slate-50 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Our Departments</h1>
          <p className="mt-4 text-lg text-slate-600">
            Comprehensive healthcare services spanning multiple medical and surgical specialties.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {departments.map((dept: any) => (
            <div key={dept.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 flex flex-col h-full hover:shadow-lg transition group">
              <div className="w-14 h-14 bg-blue-50 text-blue-700 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <span className="material-symbols-outlined text-3xl">
                  {dept.icon || 'medical_services'}
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
                {dept.name}
                {dept.is_coe && (
                  <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 text-xs font-bold rounded-full uppercase tracking-wider">
                    Center of Excellence
                  </span>
                )}
              </h3>
              <p className="text-slate-600 mb-6 flex-grow">
                {dept.description}
              </p>
              
              {dept.services && (
                <div className="mb-6 pt-6 border-t border-slate-100">
                  <h4 className="text-sm font-semibold text-slate-900 mb-3">Key Services:</h4>
                  <ul className="space-y-2">
                    {(Array.isArray(dept.services) ? dept.services : dept.services.split(',')).slice(0,3).map((service: string, idx: number) => (
                      <li key={idx} className="text-sm text-slate-600 flex items-start gap-2">
                        <span className="material-symbols-outlined text-blue-500 text-[18px]">check_circle</span>
                        {service.trim()}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <Link 
                href={`/booking?department=${dept.id}`}
                className="w-full bg-slate-50 text-blue-700 font-semibold py-3 rounded-xl hover:bg-blue-50 transition text-center mt-auto"
              >
                Book Consultation
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
