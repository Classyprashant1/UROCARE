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
  
  // Portal protection logic
  const isPortalRoute = path.startsWith('/dashboard') || path.startsWith('/admin') || path.startsWith('/doctor')
  
  if (isPortalRoute) {
    if (!user) {
      // Redirect to login if unauthenticated
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }

    // Role-based protection
    // DO NOT TRUST user.user_metadata.role for security decisions.
    // Query the secure, RLS-protected database tables to establish identity.
    let role = 'patient';
    if (user) {
      const { data: adminData } = await supabase.from('admins').select('id').eq('id', user.id).single();
      if (adminData) {
        role = 'admin';
      } else {
        const { data: doctorData } = await supabase.from('doctors').select('id').eq('id', user.id).single();
        if (doctorData) {
          role = 'doctor';
        }
      }
    }
    
    // Admin routes
    if (path.startsWith('/admin') && role !== 'admin') {
      const target = role === 'doctor' ? '/doctor' : '/dashboard'
      return NextResponse.redirect(new URL(target, request.url))
    }
    
    // Doctor routes
    if (path.startsWith('/doctor') && role !== 'doctor' && role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    
    // Patient dashboard routes - if an admin or doctor tries to access /dashboard, route them to their respective portal.
    // (We allow admins to access /doctor above, but let's strictly route their root /dashboard to /admin).
    if (path === '/dashboard' || path.startsWith('/dashboard/')) {
      if (role === 'admin') {
        return NextResponse.redirect(new URL('/admin', request.url))
      }
      if (role === 'doctor') {
        return NextResponse.redirect(new URL('/doctor', request.url))
      }
    }
  }

  return supabaseResponse
}
