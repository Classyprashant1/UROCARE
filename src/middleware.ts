import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
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
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
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

  const { data: { user } } = await supabase.auth.getUser()

  // Strict route protection
  const path = request.nextUrl.pathname;

  const isProtectedPath = path.startsWith('/dashboard') || path.startsWith('/admin') || path === '/doctor' || path.startsWith('/doctor/') || path.startsWith('/booking');

  if (isProtectedPath) {
    if (!user) {
      // Unauthenticated, kick to login
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }
  }

  // Role-based protection
  const role = user?.user_metadata?.role || 'patient'

  if (path.startsWith('/admin') && role !== 'admin') {
    const url = request.nextUrl.clone()
    url.pathname = role === 'patient' ? '/dashboard' : `/${role}`
    return NextResponse.redirect(url)
  }

  if ((path === '/doctor' || path.startsWith('/doctor/')) && role !== 'doctor') {
    const url = request.nextUrl.clone()
    url.pathname = role === 'patient' ? '/dashboard' : `/${role}`
    return NextResponse.redirect(url)
  }

  if (path.startsWith('/dashboard') && role !== 'patient') {
    const url = request.nextUrl.clone()
    url.pathname = `/${role}`
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
