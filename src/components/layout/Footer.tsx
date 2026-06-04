import Link from "next/link";
import { HOSPITAL } from "@/lib/data";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-slate-200 mt-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr] gap-10 max-w-7xl mx-auto px-4 md:px-8 py-16">
        
        {/* Brand */}
        <div>
          <Link href="/" className="flex items-center gap-2 mb-4 group">
            <span className="material-symbols-outlined text-2xl text-blue-700 font-variation-fill">
              local_hospital
            </span>
            <h2 className="text-xl font-bold text-blue-900 group-hover:text-blue-700 transition-colors">{HOSPITAL.shortName}</h2>
          </Link>
          <p className="text-slate-600 text-[15px] leading-relaxed mb-6 pr-4">
            {HOSPITAL.tagline}
          </p>
          <div className="flex gap-3">
            <a href={HOSPITAL.socialMedia.facebook} className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-50 text-slate-500 hover:bg-blue-700 hover:text-white transition-colors">
              <span className="material-symbols-outlined">public</span>
            </a>
            <a href={`mailto:${HOSPITAL.email}`} className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-50 text-slate-500 hover:bg-blue-700 hover:text-white transition-colors">
              <span className="material-symbols-outlined">mail</span>
            </a>
            <a href={`tel:${HOSPITAL.emergencyPhone}`} className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-50 text-slate-500 hover:bg-blue-700 hover:text-white transition-colors">
              <span className="material-symbols-outlined">call</span>
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-[13px] font-bold uppercase tracking-[0.08em] text-blue-700 mb-5">Quick Links</h4>
          <ul className="flex flex-col gap-3.5">
            <li><Link href="/about" className="text-[15px] text-slate-600 hover:text-teal-600 transition-colors">About Us</Link></li>
            <li><Link href="/departments" className="text-[15px] text-slate-600 hover:text-teal-600 transition-colors">Departments</Link></li>
            <li><Link href="/doctors" className="text-[15px] text-slate-600 hover:text-teal-600 transition-colors">Our Doctors</Link></li>
            <li><Link href="/booking" className="text-[15px] text-slate-600 hover:text-teal-600 transition-colors">Book Appointment</Link></li>
            <li><Link href="/contact" className="text-[15px] text-slate-600 hover:text-teal-600 transition-colors">Contact Us</Link></li>
          </ul>
        </div>

        {/* Portal */}
        <div>
          <h4 className="text-[13px] font-bold uppercase tracking-[0.08em] text-blue-700 mb-5">Portals</h4>
          <ul className="flex flex-col gap-3.5">
            <li><Link href="/login" className="text-[15px] text-slate-600 hover:text-teal-600 transition-colors">Patient Portal</Link></li>
            <li><Link href="/login" className="text-[15px] text-slate-600 hover:text-teal-600 transition-colors">Doctor Portal</Link></li>
            <li><Link href="/login" className="text-[15px] text-slate-600 hover:text-teal-600 transition-colors">Admin Portal</Link></li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-[13px] font-bold uppercase tracking-[0.08em] text-blue-700 mb-5">Contact</h4>
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-2.5">
              <span className="material-symbols-outlined text-[18px] text-teal-600 mt-0.5">location_on</span>
              <p className="text-sm text-slate-600 leading-relaxed">{HOSPITAL.address.landmark}<br />{HOSPITAL.address.city}, {HOSPITAL.address.state}</p>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="material-symbols-outlined text-[18px] text-teal-600 mt-0.5">call</span>
              <a href={`tel:${HOSPITAL.phones[0]}`} className="text-sm text-slate-600 hover:text-blue-700 transition-colors">{HOSPITAL.phones[0]}</a>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="material-symbols-outlined text-[18px] text-teal-600 mt-0.5">schedule</span>
              <p className="text-sm text-slate-600">Open {HOSPITAL.openHours}</p>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-5 flex flex-col md:flex-row items-center justify-between gap-3 text-center">
          <p className="text-[13px] text-slate-500">© {year} {HOSPITAL.name}. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="text-[13px] text-slate-500 hover:text-blue-700 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="text-[13px] text-slate-500 hover:text-blue-700 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
