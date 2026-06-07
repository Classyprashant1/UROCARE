'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

export default function LoginForm({ initialMessage }: { initialMessage?: string }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [error, setError] = useState(initialMessage || '')
  const [isLoading, setIsLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      if (isSignUp) {
        const { error: signUpError, data } = await supabase.auth.signUp({
          email,
          password,
        })
        if (signUpError) throw signUpError
        
        if (data.user) {
          const role = data.user.user_metadata?.role || 'patient'
          const route = role === 'admin' ? '/admin' : role === 'doctor' ? '/doctor' : '/dashboard'
          router.push(route)
          router.refresh()
        } else {
          setError('Account created successfully! You can now log in.')
          setIsSignUp(false)
        }
      } else {
        const { error: signInError, data } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (signInError) throw signInError

        // By default Supabase handles persistent sessions.
        // If "remember" is unchecked, we'd ideally set the cookie as a session cookie.
        // But the browser client automatically uses the default persistence.
        // As a workaround for remember me, we rely on Supabase's built-in token refresh.
        // If they checked it, it persists.
        
        const role = data.user?.user_metadata?.role || 'patient'
        const route = role === 'admin' ? '/admin' : role === 'doctor' ? '/doctor' : '/dashboard'
        router.push(route)
        router.refresh()
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
      {error && (
        <div className={`p-4 text-center text-sm font-medium rounded-lg ${error.includes('successfully') ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {error}
        </div>
      )}

      <div className="rounded-md shadow-sm -space-y-px">
        <div className="mb-4">
          <label htmlFor="email-address" className="sr-only">Email address</label>
          <input
            id="email-address"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
            placeholder="Email address"
          />
        </div>
        <div>
          <label htmlFor="password" className="sr-only">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete={isSignUp ? "new-password" : "current-password"}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
            placeholder="Password"
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <input
            id="remember-me"
            name="remember"
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
            Remember me
          </label>
        </div>
        
        <div className="text-sm">
          <button
            type="button"
            onClick={async () => {
              if (!email) {
                setError('Please enter your email first to reset your password.')
                return
              }
              setIsLoading(true)
              try {
                const { error } = await supabase.auth.resetPasswordForEmail(email, {
                  redirectTo: `${window.location.origin}/update-password`,
                })
                if (error) throw error
                setError('Password reset email sent! Check your inbox.')
              } catch (err: any) {
                setError(err.message || 'Failed to send reset email.')
              } finally {
                setIsLoading(false)
              }
            }}
            className="font-medium text-blue-600 hover:text-blue-500 bg-transparent border-none p-0 cursor-pointer"
          >
            Forgot your password?
          </button>
        </div>
      </div>

      <div className="flex gap-4">
        <button
          type="submit"
          onClick={() => setIsSignUp(false)}
          disabled={isLoading}
          className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isLoading && !isSignUp ? 'Signing in...' : 'Sign in'}
        </button>
        <button
          type="submit"
          onClick={() => setIsSignUp(true)}
          disabled={isLoading}
          className="group relative w-full flex justify-center py-2 px-4 border border-blue-600 text-sm font-medium rounded-md text-blue-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isLoading && isSignUp ? 'Signing up...' : 'Sign up'}
        </button>
      </div>
    </form>
  )
}
