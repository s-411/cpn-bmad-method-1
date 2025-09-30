'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createSupabaseBrowser } from '@cpn/shared'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createSupabaseBrowser()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError(error.message)
      } else if (data.user) {
        // Force a full page reload to ensure server auth state syncs
        // This triggers middleware with fresh auth cookies
        window.location.href = '/dashboard'
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-cpn-dark flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h1 className="text-3xl font-heading text-cpn-yellow mb-2">CPN</h1>
          <h2 className="text-xl text-cpn-white">Sign In</h2>
          <p className="text-cpn-gray mt-2">Access your Cost Per Nut calculator</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-cpn-white mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 bg-cpn-gray/10 border border-cpn-gray/20 rounded-lg text-cpn-white placeholder-cpn-gray/50 focus:outline-none focus:ring-2 focus:ring-cpn-yellow"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-cpn-white mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 bg-cpn-gray/10 border border-cpn-gray/20 rounded-lg text-cpn-white placeholder-cpn-gray/50 focus:outline-none focus:ring-2 focus:ring-cpn-yellow"
              placeholder="Enter your password"
            />
          </div>

          {error && (
            <div className="text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-cpn w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="text-center">
          <p className="text-cpn-gray">
            Don't have an account?{' '}
            <Link href="/auth/signup" className="text-cpn-yellow hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}