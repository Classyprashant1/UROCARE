'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface DoctorLeave {
  id: string;
  doctor_id: string;
  name: string;
  department: string;
}

interface Props {
  leaves: DoctorLeave[];
}

export default function DoctorLeaveBanner({ leaves }: Props) {
  const [isDismissed, setIsDismissed] = useState(true);

  useEffect(() => {
    // Only show if there are leaves and it hasn't been dismissed in this session
    if (leaves.length > 0 && !sessionStorage.getItem('doctor_leave_banner_dismissed')) {
      setIsDismissed(false);
    }
  }, [leaves]);

  if (isDismissed || leaves.length === 0) {
    return null;
  }

  const dismissBanner = () => {
    setIsDismissed(true);
    sessionStorage.setItem('doctor_leave_banner_dismissed', 'true');
  };

  return (
    <div className="bg-amber-50 border-b border-amber-200 shadow-sm relative z-50 animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        
        <div className="flex items-start gap-3">
          <div className="p-1.5 bg-amber-100 rounded-full text-amber-600 mt-0.5 md:mt-0 shrink-0">
            <span className="material-symbols-outlined text-[20px] block">warning</span>
          </div>
          <div>
            <h4 className="text-amber-900 font-bold text-[15px] flex items-center gap-2">
              Doctor Availability Notice
              <span className="bg-amber-200 text-amber-800 text-[11px] px-2 py-0.5 rounded-full font-bold">
                {leaves.length} on leave today
              </span>
            </h4>
            <p className="text-amber-800/80 text-sm mt-0.5 font-medium">
              {leaves.map(l => `${l.name} (${l.department})`).join(', ')} {leaves.length === 1 ? 'is' : 'are'} on leave today. Please check availability before booking.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <Link 
            href="/doctors" 
            className="flex-1 md:flex-none text-center px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold rounded-md transition-colors whitespace-nowrap"
          >
            View Available Doctors
          </Link>
          <button 
            onClick={dismissBanner}
            className="p-1.5 text-amber-600 hover:bg-amber-200 rounded-md transition-colors shrink-0"
            aria-label="Dismiss"
          >
            <span className="material-symbols-outlined text-[20px] block">close</span>
          </button>
        </div>

      </div>
    </div>
  );
}
