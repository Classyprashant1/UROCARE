"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HOSPITAL, NAV_LINKS } from "@/lib/data";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
          scrolled
            ? "h-16 bg-white/90 backdrop-blur-md shadow-md border-slate-200/50"
            : "h-20 bg-white/75 backdrop-blur-lg shadow-sm border-slate-200/30"
        }`}
      >
        <nav className="flex justify-between items-center w-full max-w-7xl mx-auto px-4 md:px-8 h-full">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <img src="/logo.png" alt="Hospital Logo" className="w-10 h-10 object-contain group-hover:scale-110 transition-transform" />
            <span className="text-xl font-bold text-blue-900 tracking-tight">
              {HOSPITAL.shortName}
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden lg:flex items-center gap-8">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative py-1 text-[15px] transition-colors ${
                    isActive
                      ? "text-blue-700 font-semibold"
                      : "text-slate-600 font-medium hover:text-blue-700"
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-[-2px] left-0 right-0 h-[2px] bg-blue-700 rounded-full" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Link
              href="/booking"
              className="hidden md:inline-block px-5 py-2.5 bg-blue-700 text-white rounded-lg text-sm font-semibold tracking-wide shadow-md shadow-blue-700/20 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-700/30 active:scale-95 transition-all"
            >
              Book Appointment
            </Link>
            <a
              href={`tel:${HOSPITAL.emergencyPhone}`}
              className="flex items-center justify-center w-10 h-10 rounded-full text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors"
              aria-label="Call hospital"
            >
              <span className="material-symbols-outlined">call</span>
            </a>
            
            <Link 
              href="/login" 
              className="hidden md:flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold tracking-wide text-blue-600 bg-white border border-blue-200 shadow-sm hover:shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:border-blue-400 hover:-translate-y-1 active:scale-95 transition-all duration-300 group relative overflow-hidden"
              title="Login or Signup"
            >
              <div className="absolute inset-0 bg-blue-50 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
              <span className="material-symbols-outlined text-[18px] relative z-10 group-hover:rotate-12 transition-transform duration-300">login</span>
              <span className="relative z-10">Login / Signup</span>
            </Link>

            {/* Hamburger */}
            <button
              className="lg:hidden flex items-center justify-center w-10 h-10 rounded-full text-slate-600 hover:bg-slate-100 transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
            >
              <span className="material-symbols-outlined">
                {mobileOpen ? "close" : "menu"}
              </span>
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-[999] bg-black/40 animate-in fade-in duration-200"
          onClick={() => setMobileOpen(false)}
        >
          <div
            className="absolute top-0 right-0 w-[min(340px,85vw)] h-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <img src="/logo.png" alt="Hospital Logo" className="w-8 h-8 object-contain" />
                <span className="text-lg font-bold text-blue-900">{HOSPITAL.shortName}</span>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center w-9 h-9 rounded-full text-slate-500 hover:bg-slate-100 transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="flex-1 flex flex-col p-4 gap-1 overflow-y-auto">
              {NAV_LINKS.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`block px-4 py-3.5 text-base rounded-lg transition-colors ${
                      isActive
                        ? "text-blue-700 font-semibold bg-blue-50/50"
                        : "text-slate-700 font-medium hover:bg-slate-50"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
              <div className="my-2 border-t border-slate-100"></div>
              <Link
                href="/login"
                className="block px-4 py-3.5 text-base text-blue-700 font-bold bg-blue-50/50 hover:bg-blue-100 rounded-lg transition-colors flex items-center gap-3 group"
              >
                <span className="material-symbols-outlined text-blue-500 group-hover:rotate-12 transition-transform">login</span>
                Login / Signup
              </Link>
            </div>

            <div className="p-4 border-t border-slate-100 flex flex-col gap-3">
              <Link
                href="/booking"
                className="block text-center p-3.5 bg-blue-700 text-white rounded-lg text-[15px] font-semibold shadow-md"
              >
                Book Appointment
              </Link>
              <a
                href={`tel:${HOSPITAL.emergencyPhone}`}
                className="flex items-center justify-center gap-2 p-3 border border-slate-200 rounded-lg text-sm font-semibold text-blue-700 hover:bg-slate-50 transition-colors"
              >
                <span className="material-symbols-outlined">call</span>
                Call: {HOSPITAL.emergencyPhone}
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
