'use client'
 
// global-error must include html and body tags
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <div style={{ fontFamily: 'sans-serif', padding: '50px', textAlign: 'center' }}>
          <h2>Critical System Error</h2>
          <p>The application encountered a fatal error.</p>
          <button onClick={() => reset()} style={{ padding: '10px 20px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', marginTop: '20px' }}>
            Try again
          </button>
        </div>
      </body>
    </html>
  )
}
