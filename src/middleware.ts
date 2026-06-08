import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

// Basic in-memory rate limiter for Edge
// Note: In a distributed Vercel deployment, this is per-isolate.
// For true global rate limiting, use Upstash Redis.
const rateLimitMap = new Map<string, { count: number, timestamp: number }>();
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10; // 10 requests per minute for sensitive endpoints

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  
  if (!record) {
    rateLimitMap.set(ip, { count: 1, timestamp: now });
    return true;
  }
  
  if (now - record.timestamp > RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.set(ip, { count: 1, timestamp: now });
    return true;
  }
  
  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }
  
  record.count += 1;
  return true;
}

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  // Rate Limiting on sensitive endpoints (Login, Signup, Forgot Password)
  const path = request.nextUrl.pathname;
  if (path.startsWith('/login') || path.startsWith('/signup') || path.startsWith('/api/auth')) {
    const ip = request.headers.get('x-forwarded-for') ?? 'unknown';
    if (!checkRateLimit(ip)) {
      return new NextResponse("Too Many Requests", { status: 429 });
    }
  }

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
