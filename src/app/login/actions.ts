'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { LoginSchema, SignupSchema, ResetPasswordSchema, UpdatePasswordSchema } from '@/lib/schema'
import { rateLimit } from '@/utils/rate-limit'
import { logger } from '@/utils/logger'

export async function login(formData: FormData) {
  const emailRaw = formData.get('email');
  
  // Rate limiting (by email or IP - we use email here as a simple identifier)
  const identifier = typeof emailRaw === 'string' ? emailRaw.toLowerCase() : 'unknown';
  const rateLimitCheck = rateLimit(`login_${identifier}`, 5, 60000); // 5 attempts per minute
  if (!rateLimitCheck.success) {
    redirect(`/login?message=${encodeURIComponent(rateLimitCheck.error!)}`)
  }

  const rawData = {
    email: emailRaw,
    password: formData.get('password'),
  }

  const parsed = LoginSchema.safeParse(rawData);
  if (!parsed.success) {
    redirect(`/login?message=${encodeURIComponent("Invalid input data.")}`)
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword(parsed.data)

  if (error) {
    logger.warn("Failed login attempt", { email: parsed.data.email, error: error.message });
    redirect(`/login?message=${encodeURIComponent(error.message)}`)
  }

  logger.info("Successful login", { email: parsed.data.email });
  revalidatePath('/', 'layout')
  
  // Try to determine user role and redirect to appropriate dashboard
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    const role = user.user_metadata?.role || 'patient'
    const route = role === 'admin' ? '/admin' : role === 'doctor' ? '/doctor' : '/dashboard'
    redirect(route)
  } else {
    redirect('/dashboard')
  }
}

export async function signup(formData: FormData) {
  const emailRaw = formData.get('email');
  
  const identifier = typeof emailRaw === 'string' ? emailRaw.toLowerCase() : 'unknown';
  const rateLimitCheck = rateLimit(`signup_${identifier}`, 3, 3600000); // 3 attempts per hour
  if (!rateLimitCheck.success) {
    redirect(`/login?message=${encodeURIComponent(rateLimitCheck.error!)}`)
  }

  const rawData = {
    email: emailRaw,
    password: formData.get('password'),
  }

  const parsed = SignupSchema.safeParse(rawData);
  if (!parsed.success) {
    redirect(`/login?message=${encodeURIComponent(parsed.error.issues[0].message)}`)
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.signUp(parsed.data)

  if (error) {
    logger.warn("Failed signup attempt", { email: parsed.data.email, error: error.message });
    redirect(`/login?message=${encodeURIComponent(error.message)}`)
  }

  logger.info("Successful signup", { email: parsed.data.email });
  revalidatePath('/', 'layout')
  
  // If email confirmation is disabled, signUp instantly logs the user in.
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    const role = user.user_metadata?.role || 'patient'
    const route = role === 'admin' ? '/admin' : role === 'doctor' ? '/doctor' : '/dashboard'
    redirect(route)
  } else {
    redirect('/login?message=Account created successfully! You can now log in.')
  }
}

export async function resetPassword(formData: FormData) {
  const emailRaw = formData.get('email');
  
  const identifier = typeof emailRaw === 'string' ? emailRaw.toLowerCase() : 'unknown';
  const rateLimitCheck = rateLimit(`reset_${identifier}`, 3, 3600000); // 3 attempts per hour
  if (!rateLimitCheck.success) {
    redirect(`/login?message=${encodeURIComponent(rateLimitCheck.error!)}`)
  }

  const rawData = { email: emailRaw }
  const parsed = ResetPasswordSchema.safeParse(rawData);
  
  if (!parsed.success) {
    redirect(`/login?message=${encodeURIComponent("Invalid email address.")}`)
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/update-password`,
  })

  if (error) {
    logger.error('Reset Password Error', error, { email: parsed.data.email })
    redirect(`/login?message=${encodeURIComponent(error.message)}`)
  }

  logger.info('Password reset requested', { email: parsed.data.email });
  redirect('/login?message=Check your email for the password reset link.')
}

export async function updatePassword(formData: FormData) {
  const rawData = { password: formData.get('password') }
  const parsed = UpdatePasswordSchema.safeParse(rawData);

  if (!parsed.success) {
    redirect(`/update-password?message=${encodeURIComponent(parsed.error.issues[0].message)}`)
  }

  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect(`/update-password?message=${encodeURIComponent("Unauthorized.")}`)
  }

  const rateLimitCheck = rateLimit(`update_pw_${user.id}`, 5, 3600000);
  if (!rateLimitCheck.success) {
    redirect(`/update-password?message=${encodeURIComponent(rateLimitCheck.error!)}`)
  }

  const { error } = await supabase.auth.updateUser(parsed.data)

  if (error) {
    logger.error('Update Password Error', error, { userId: user.id })
    redirect(`/update-password?message=${encodeURIComponent(error.message)}`)
  }

  logger.info('Password updated', { userId: user.id });
  redirect('/login?message=Password updated successfully. Please log in.')
}