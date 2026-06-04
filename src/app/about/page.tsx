import Image from "next/image";
import Link from "next/link";
import { STATS, FACILITIES } from "@/lib/data";

export const metadata = {
  title: "About Us | Urocare Apolo Hospital",
  description: "Learn more about Urocare Apolo Hospital, our mission, and our state-of-the-art facilities.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-slate-50 py-20 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">
              About <span className="text-blue-700">Urocare Apolo</span>
            </h1>
            <p className="mt-6 text-lg text-slate-600">
              Urocare Apolo Multi & Super Speciality Hospital is a premium 25-bed multispeciality facility delivering comprehensive, compassionate healthcare with advanced diagnostics and a dedicated team of specialists.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((stat, idx) => (
              <div key={idx} className="text-center p-6 bg-blue-50 rounded-2xl border border-blue-100">
                <span className="material-symbols-outlined text-4xl text-blue-600 mb-3 block">{stat.icon}</span>
                <div className="text-3xl font-bold text-slate-900">{stat.value}</div>
                <div className="text-sm font-medium text-slate-600 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Facilities Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900">World-Class Facilities</h2>
            <p className="mt-4 text-slate-600">Equipped with modern technology to ensure the highest standard of care.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {FACILITIES.map((facility, idx) => (
              <div key={idx} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition">
                <span className="material-symbols-outlined text-4xl text-blue-700 bg-blue-50 w-16 h-16 flex items-center justify-center rounded-xl mb-6">
                  {facility.icon}
                </span>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{facility.name}</h3>
                <p className="text-slate-600 leading-relaxed">{facility.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Ready to experience premium healthcare?</h2>
          <div className="flex justify-center gap-4">
            <Link href="/booking" className="bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-800 transition">
              Book Appointment
            </Link>
            <Link href="/contact" className="bg-slate-100 text-slate-700 px-8 py-3 rounded-xl font-semibold hover:bg-slate-200 transition">
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
