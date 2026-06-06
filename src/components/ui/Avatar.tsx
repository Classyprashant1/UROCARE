'use client'

import { useState } from 'react'

export function Avatar({ src, alt, initials, className }: { src: string, alt: string, initials: string, className?: string }) {
  const [error, setError] = useState(false);

  return (
    <div className={`flex items-center justify-center overflow-hidden shrink-0 bg-blue-100 text-blue-700 rounded-full font-bold ${className || ''}`}>
      {src && !error ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img 
          src={src} 
          alt={alt} 
          onError={() => setError(true)}
          className="w-full h-full object-cover" 
        />
      ) : (
        initials
      )}
    </div>
  )
}
