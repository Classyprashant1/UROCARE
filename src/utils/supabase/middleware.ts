import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // refreshing the auth token
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Protect routes based on user role
  const path = request.nextUrl.pathname
  
  // Dashboard protection logic
  if (path.startsWith('/dashboard')) {
    if (!user) {
      // Redirect to login if unauthenticated
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }

    // Role-based protection
    const role = user.user_metadata?.role || 'patient'
    
    if (path.startsWith('/dashboard/admin') && role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard/patient', request.url))
    }
    if (path.startsWith('/dashboard/doctor') && role !== 'doctor' && role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard/patient', request.url))
    }
  }

  return supabaseResponse
}
