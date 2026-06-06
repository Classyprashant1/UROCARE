import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()

  // Sign out on the server
  await supabase.auth.signOut()

  // Redirect to the login page with 303 See Other to force a GET request
  return NextResponse.redirect(new URL('/login', request.url), { status: 303 })
}
