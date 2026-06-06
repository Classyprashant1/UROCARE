'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    console.error("Login Error:", error.message);
    redirect(`/login?message=${encodeURIComponent(error.message)}`)
  }

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
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signUp(data)

  if (error) {
    console.error("Signup Error:", error.message);
    redirect(`/login?message=${encodeURIComponent(error.message)}`)
  }

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
  const supabase = await createClient()
  const email = formData.get('email') as string

  // The redirectTo URL where the user will be sent after clicking the email link
  // Usually the callback route or the update-password page directly.
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/update-password`,
  })

  if (error) {
    console.error('Reset Password Error:', error.message)
    redirect(`/login?message=${encodeURIComponent(error.message)}`)
  }

  redirect('/login?message=Check your email for the password reset link.')
}

export async function updatePassword(formData: FormData) {
  const supabase = await createClient()
  const password = formData.get('password') as string

  const { error } = await supabase.auth.updateUser({ password })

  if (error) {
    console.error('Update Password Error:', error.message)
    redirect(`/update-password?message=${encodeURIComponent(error.message)}`)
  }

  redirect('/login?message=Password updated successfully. Please log in.')
}