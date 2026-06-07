import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser()
      const role = user?.user_metadata?.role || 'patient'
      const roleRoute = role === 'admin' ? '/admin' : role === 'doctor' ? '/doctor' : '/dashboard'
      
      const redirectPath = next === '/' ? roleRoute : next

      const forwardedHost = request.headers.get('x-forwarded-host') 
      const isLocalEnv = process.env.NODE_ENV === 'development'
      if (isLocalEnv) {
        // we can be sure that there is no load balancer in between, so no need to watch for X-Forwarded-Host
        return NextResponse.redirect(\`\${origin}\${redirectPath}\`)
      } else if (forwardedHost) {
        return NextResponse.redirect(\`https://\${forwardedHost}\${redirectPath}\`)
      } else {
        return NextResponse.redirect(\`\${origin}\${redirectPath}\`)
      }
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
