export const dynamic = 'force-dynamic';
import Link from "next/link";
import { HOSPITAL, STATS } from "@/lib/data";
import { getDepartments, getDoctors, getDoctorsOnLeaveToday } from "@/app/actions/data";
import Reveal from "@/components/layout/Reveal";
import DoctorLeaveBanner from "@/components/ui/DoctorLeaveBanner";

export default async function HomePage() {
  const departments = await getDepartments();
  const doctors = await getDoctors();
  const leavesToday = await getDoctorsOnLeaveToday();

  return (
    <>
      <DoctorLeaveBanner leaves={leavesToday} />
      <Reveal className="overflow-hidden">
        {/* ============ HERO ============ */}
        <section className="relative min-h-[620px] flex flex-col pt-20 overflow-hidden">
          {/* Layer 1: Background Image */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat blur-[2px]"
            style={{
              backgroundImage: "url('/images/hospital.png')",
            }}
          />

          {/* Layer 2: Dark Overlay */}
          <div className="absolute inset-0 bg-black/50"></div>

          {/* Layer 3: Hero Content Container */}
          <div className="relative z-10 flex-1 flex items-center pt-16 pb-28 max-w-7xl mx-auto w-full px-4 md:px-8">
            <div className="transition-all duration-700 max-w-2xl p-10 md:p-12 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/15 rounded-full text-[13px] font-semibold text-white/90 mb-6">
                <span className="material-symbols-outlined text-base">verified</span>
                Trusted Multispeciality Care Since {HOSPITAL.established}
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-[1.15] tracking-tight mb-5">
                Advanced Medical Care,<br />Compassionate Healing
              </h1>
              <p className="text-lg text-white/80 leading-relaxed mb-8">
                {HOSPITAL.description}
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/booking" className="px-8 py-3.5 bg-white text-blue-800 rounded-lg text-[15px] font-bold shadow-xl shadow-black/10 hover:-translate-y-0.5 hover:shadow-2xl transition-all">
                  Book Appointment
                </Link>
                <Link href="/departments" className="px-8 py-3.5 bg-transparent text-white border-2 border-white/40 rounded-lg text-[15px] font-semibold hover:bg-white/10 hover:border-white/70 transition-all">
                  Explore Departments
                </Link>
              </div>
            </div>
          </div>

          {/* Booking Widget */}
          <div className="relative z-20 max-w-7xl mx-auto w-full px-4 md:px-8 -mt-12">
            <form action="/booking" method="GET" className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6 md:p-8 bg-white/90 backdrop-blur-xl border border-slate-200 shadow-2xl rounded-2xl items-end">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Department</label>
                <select name="deptId" className="h-11 px-3 border border-slate-200 rounded-lg text-sm bg-white text-slate-700 focus:border-blue-600 focus:outline-none transition-colors w-full">
                  <option value="">Select Department</option>
                  {departments.map((d: any) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Doctor</label>
                <select name="doctorId" className="h-11 px-3 border border-slate-200 rounded-lg text-sm bg-white text-slate-700 focus:border-blue-600 focus:outline-none transition-colors w-full">
                  <option value="">Select Doctor</option>
                  {doctors.map((d: any) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Preferred Date</label>
                <input type="date" name="date" className="h-11 px-3 border border-slate-200 rounded-lg text-sm bg-white text-slate-700 focus:border-blue-600 focus:outline-none transition-colors w-full" />
              </div>
              <button type="submit" className="h-11 flex items-center justify-center px-6 bg-blue-700 text-white rounded-lg text-sm font-bold shadow-md shadow-blue-700/20 hover:-translate-y-0.5 transition-all w-full">
                Search Availability
              </button>
            </form>
          </div>
        </section>

        {/* ============ EMERGENCY BAR ============ */}
        <div className="bg-gradient-to-r from-blue-700 to-blue-800 text-white py-3 mt-8">
          <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined font-variation-fill text-[22px]">emergency</span>
              <span className="text-sm font-bold tracking-wider">24/7 EMERGENCY: {HOSPITAL.emergencyPhone}</span>
            </div>
            <div className="flex items-center gap-4 text-sm opacity-90">
              <span className="hidden md:inline">Immediate medical attention & ambulance support</span>
              <a href={`tel:${HOSPITAL.emergencyPhone}`} className="font-bold underline hover:text-blue-100 transition-colors">Call Now</a>
            </div>
          </div>
        </div>

        {/* ============ STATS ============ */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {STATS.map((stat, i) => (
                <div
                  key={i}
                  className="reveal opacity-0 translate-y-10 transition-all duration-500 flex flex-col items-center text-center p-8 bg-white border border-slate-200 rounded-2xl hover:shadow-xl hover:-translate-y-1"
                  style={{ transitionDelay: `${i * 100}ms` }}
                >
                  <span className="material-symbols-outlined text-4xl text-blue-700 mb-3 font-variation-fill">{stat.icon}</span>
                  <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">{stat.value}</h3>
                  <p className="text-sm text-slate-500 mt-1 font-medium">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============ DEPARTMENTS ============ */}
        <section className="py-20 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="reveal opacity-0 translate-y-10 transition-all duration-500 text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">Our Medical Departments</h2>
              <p className="text-base text-slate-600 max-w-2xl mx-auto mt-3">
                Specialized clinical services with experienced doctors and modern diagnostic facilities.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr] gap-6">

              {/* Featured Dept */}
              {departments[0] && (
                <div className="reveal opacity-0 translate-y-10 transition-all duration-500 lg:row-span-2 relative p-10 bg-white border border-slate-200 rounded-3xl overflow-hidden flex flex-col hover:shadow-xl">
                  <div className="absolute -top-3 -right-3 text-blue-700">
                    <span className="material-symbols-outlined text-[80px] opacity-[0.03]">{departments[0].icon || 'local_hospital'}</span>
                  </div>
                  <h3 className="text-3xl font-bold text-slate-900 mb-3">{departments[0].name}</h3>
                  <p className="text-[15px] text-slate-600 leading-relaxed mb-6">
                    {departments[0].description}
                  </p>
                  <ul className="flex flex-col gap-3 mb-8">
                    {(departments[0].services || []).slice(0, 3).map((s: string, i: number) => (
                      <li key={i} className="flex items-center gap-3 text-sm text-slate-700 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0"></span>
                        {s}
                      </li>
                    ))}
                  </ul>
                  <Link href={`/departments/${departments[0].slug}`} className="mt-auto inline-flex items-center gap-2 text-sm font-bold text-blue-700 hover:gap-3 transition-all">
                    Learn More <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </Link>
                </div>
              )}

              {/* Other Depts */}
              {departments.slice(1, 5).map((dept: any, i: number) => (
                <div
                  key={dept.id}
                  className="reveal opacity-0 translate-y-10 transition-all duration-500 p-7 bg-white border border-slate-200 rounded-2xl flex flex-col hover:shadow-lg hover:-translate-y-1"
                  style={{ transitionDelay: `${(i + 1) * 100}ms` }}
                >
                  <span className="material-symbols-outlined text-[32px] text-teal-600 mb-4">{dept.icon || 'medical_services'}</span>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{dept.name}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed flex-1 line-clamp-3">{dept.description}</p>
                  <Link href={`/departments/${dept.slug}`} className="mt-4 flex items-center justify-center w-10 h-10 rounded-full bg-blue-50 text-blue-700 hover:bg-blue-700 hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-[20px]">trending_flat</span>
                  </Link>
                </div>
              ))}

            </div>
          </div>
        </section>
      </Reveal>
    </>
  );
}

