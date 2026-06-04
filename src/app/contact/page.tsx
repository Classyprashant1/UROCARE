import { HOSPITAL } from '@/lib/data'
import ContactForm from './ContactForm'

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      
      {/* Page Header */}
      <div className="bg-slate-900 py-16 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-400 via-transparent to-transparent"></div>
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">Contact Us</h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">
            We are here to help. Reach out for appointments, inquiries, or emergency medical assistance.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12 lg:py-20 flex flex-col lg:flex-row gap-12">
        
        {/* Left Column: Info & Emergency */}
        <div className="w-full lg:w-5/12 flex flex-col gap-8">
          
          {/* Emergency Hotline (Prominent) */}
          <div className="bg-red-600 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
            <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-[120px] text-red-700 opacity-50 rotate-[-15deg]">emergency</span>
            <div className="relative z-10">
              <h2 className="text-2xl font-bold flex items-center gap-3 mb-2">
                <span className="material-symbols-outlined text-[32px]">support_agent</span>
                Emergency Hotline
              </h2>
              <p className="text-red-100 mb-6 text-sm font-medium">Available 24/7 for immediate medical assistance and critical care admissions.</p>
              <a href={`tel:${HOSPITAL.emergencyPhone.replace(/\s+/g, '')}`} className="inline-block bg-white text-red-700 text-3xl font-extrabold px-6 py-4 rounded-xl shadow-md hover:scale-105 transition-transform">
                {HOSPITAL.emergencyPhone}
              </a>
            </div>
          </div>

          {/* Contact Details Cards */}
          <div className="flex flex-col gap-4">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 flex items-start gap-5 shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 bg-blue-50 text-blue-700 rounded-full flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[24px]">location_on</span>
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg mb-1">Visit Us</h3>
                <p className="text-slate-600 leading-relaxed text-sm">
                  {HOSPITAL.address.line1}<br/>
                  {HOSPITAL.address.line2}<br/>
                  {HOSPITAL.address.city}, {HOSPITAL.address.state} - {HOSPITAL.address.pincode}
                </p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 flex items-start gap-5 shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 bg-blue-50 text-blue-700 rounded-full flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[24px]">call</span>
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg mb-1">Call Us</h3>
                <div className="text-slate-600 leading-relaxed text-sm flex flex-col gap-1">
                  {HOSPITAL.phones.map((phone, i) => (
                    <a key={i} href={`tel:${phone.replace(/\s+/g, '')}`} className="hover:text-blue-700 font-medium transition">{phone}</a>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 flex items-start gap-5 shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 bg-blue-50 text-blue-700 rounded-full flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[24px]">mail</span>
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg mb-1">Email Us</h3>
                <a href={`mailto:${HOSPITAL.email}`} className="text-slate-600 text-sm font-medium hover:text-blue-700 transition">
                  {HOSPITAL.email}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Contact Form */}
        <div className="w-full lg:w-7/12">
          <ContactForm />
        </div>

      </div>

      {/* Map Section */}
      <div className="w-full h-96 bg-slate-200 mt-8 relative">
        {/* We use an iframe pointing to Google Maps based on coordinates in HOSPITAL config */}
        <iframe 
          title="Hospital Location"
          width="100%" 
          height="100%" 
          style={{ border: 0 }} 
          loading="lazy" 
          allowFullScreen 
          referrerPolicy="no-referrer-when-downgrade"
          src={`https://www.google.com/maps?q=${HOSPITAL.coordinates.lat},${HOSPITAL.coordinates.lng}&hl=es;z=15&output=embed`}
        ></iframe>
      </div>

    </div>
  )
}
