import Link from 'next/link'
 
export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
      <div className="max-w-md w-full">
        <h1 className="text-9xl font-black text-slate-200 select-none">404</h1>
        <h2 className="text-3xl font-bold text-slate-900 mt-4 mb-2">Page Not Found</h2>
        <p className="text-slate-500 mb-8">The page you are looking for doesn't exist or has been moved.</p>
        
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-blue-700 text-white font-semibold rounded-xl hover:bg-blue-800 transition shadow-md"
        >
          <span className="material-symbols-outlined">home</span>
          Back to Home
        </Link>
      </div>
    </div>
  )
}
