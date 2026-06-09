import { DEPARTMENT_DETAILS } from "@/lib/departmentDetails";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDoctors } from "@/app/actions/data";

export function generateStaticParams() {
  return DEPARTMENT_DETAILS.map((dept) => ({
    slug: dept.slug,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const dept = DEPARTMENT_DETAILS.find((d) => d.slug === resolvedParams.slug);
  
  if (!dept) {
    return { title: 'Department Not Found' };
  }
  
  return {
    title: `${dept.name} | Urocare Apolo Hospital`,
    description: dept.description,
  };
}

export default async function DepartmentDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const dept = DEPARTMENT_DETAILS.find((d) => d.slug === resolvedParams.slug);

  if (!dept) {
    notFound();
  }

  // Fetch doctors logic
  const allDoctors = await getDoctors();
  let deptDoctors: any[] = allDoctors.filter((doc: any) => 
    doc.departmentIds?.includes(dept.id) || doc.department?.toLowerCase().includes(dept.name.toLowerCase())
  );

  if (!deptDoctors || deptDoctors.length === 0) {
    deptDoctors = dept.doctors; // Fallback
  }

  // Related departments logic
  const relatedDepts = DEPARTMENT_DETAILS.filter(d => d.id !== dept.id).slice(0, 3);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Breadcrumb Navigation */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex text-sm font-medium text-slate-500">
            <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
            <span className="mx-2 text-slate-400">/</span>
            <Link href="/departments" className="hover:text-blue-600 transition-colors">Departments</Link>
            <span className="mx-2 text-slate-400">/</span>
            <span className="text-slate-900">{dept.name}</span>
          </nav>
        </div>
      </div>

      {/* Hero Banner */}
      <section className="relative h-[400px] flex items-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat blur-[2px]"
          style={{ backgroundImage: `url('${dept.image || '/images/hospital.jpg'}')` }}
        />
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full text-center">
          <div className="w-20 h-20 mx-auto bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center mb-6 border border-white/20">
            <span className="material-symbols-outlined text-4xl text-white">
              {dept.icon}
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
            {dept.name}
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            {dept.description}
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-12">
          
          {/* Left Column: Details */}
          <div className="space-y-12">
            
            {/* Overview */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Department Overview</h2>
              <p className="text-slate-600 leading-relaxed">
                {dept.overview}
              </p>
            </div>

            {/* Treatments & Services */}
            <div className="grid md:grid-cols-2 gap-8">
              {dept.treatments && dept.treatments.length > 0 && (
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                  <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <span className="material-symbols-outlined text-teal-600">medical_services</span>
                    Key Treatments
                  </h3>
                  <ul className="space-y-3">
                    {dept.treatments.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-slate-700">
                        <span className="material-symbols-outlined text-teal-500 text-[20px] mt-0.5">check_circle</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {dept.services && dept.services.length > 0 && (
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                  <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <span className="material-symbols-outlined text-blue-600">health_and_safety</span>
                    Services Offered
                  </h3>
                  <ul className="space-y-3">
                    {dept.services.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-slate-700">
                        <span className="material-symbols-outlined text-blue-500 text-[20px] mt-0.5">done</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* FAQs */}
            {dept.faqs && dept.faqs.length > 0 && (
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Frequently Asked Questions</h2>
                <div className="space-y-6">
                  {dept.faqs.map((faq, idx) => (
                    <div key={idx} className="border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                      <h4 className="text-lg font-semibold text-slate-800 mb-2">{faq.question}</h4>
                      <p className="text-slate-600">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Related Departments */}
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Related Departments</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {relatedDepts.map(rd => (
                  <Link key={rd.id} href={`/departments/${rd.slug}`} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition group">
                    <div className="w-12 h-12 bg-blue-50 text-blue-700 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <span className="material-symbols-outlined">{rd.icon}</span>
                    </div>
                    <h3 className="font-bold text-slate-900">{rd.name}</h3>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Sidebar */}
          <div className="space-y-8">
            
            {/* Booking Card */}
            <div className="bg-blue-700 p-8 rounded-2xl shadow-lg text-white">
              <h3 className="text-2xl font-bold mb-3">Book Appointment CTA</h3>
              <p className="text-blue-100 mb-6 text-sm">
                Schedule a consultation with our specialized doctors in the {dept.name} department today.
              </p>
              <Link
                href={`/booking?department=${dept.id}`}
                className="block w-full bg-white text-blue-800 font-bold py-3.5 rounded-xl text-center hover:bg-blue-50 transition-colors shadow-md"
              >
                Book Now
              </Link>
            </div>

            {/* Doctors */}
            {deptDoctors && deptDoctors.length > 0 && (
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Available Doctors</h3>
                <div className="space-y-4">
                  {deptDoctors.map((doc: any, idx: number) => (
                    <div key={idx} className="flex gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-xl">person</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{doc.name}</h4>
                        <p className="text-xs text-slate-500 font-medium mb-1">{doc.designation}</p>
                        <p className="text-[11px] text-slate-400">{doc.qualifications}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Link
                  href="/doctors"
                  className="mt-4 block text-center text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                >
                  View All Doctors &rarr;
                </Link>
              </div>
            )}

            {/* Contact Info CTA */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 border-l-4 border-l-red-600">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Emergency Contact CTA</h3>
              <div className="flex items-center gap-3 text-red-600 mb-3">
                <span className="material-symbols-outlined text-2xl font-variation-fill">emergency</span>
                <span className="font-bold text-lg">+91 9971107329</span>
              </div>
              <p className="text-sm text-slate-500">
                24/7 emergency services available. For immediate medical attention, call the number above or visit the hospital directly.
              </p>
            </div>

          </div>

        </div>
      </section>
    </div>
  );
}
