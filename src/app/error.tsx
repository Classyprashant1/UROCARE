'use client'
 
import { useEffect } from 'react'
import Link from 'next/link'
 
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('[React Error Boundary Caught]:', error)
  }, [error])
 
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
      <div className="bg-white p-10 rounded-2xl shadow-xl max-w-md w-full border border-slate-200">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="material-symbols-outlined text-[32px]">warning</span>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Something went wrong!</h2>
        <p className="text-slate-500 mb-8 text-sm">We encountered an unexpected error while processing your request.</p>
        
        <div className="flex flex-col gap-3">
          <button
            onClick={() => reset()}
            className="w-full bg-blue-700 text-white font-semibold py-3 rounded-xl hover:bg-blue-800 transition shadow-md hover:shadow-lg"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="w-full bg-slate-100 text-slate-700 font-semibold py-3 rounded-xl hover:bg-slate-200 transition"
          >
            Return Home
          </Link>
        </div>
      </div>
    </div>
  )
}
