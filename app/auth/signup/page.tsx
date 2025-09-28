'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createSupabaseBrowser } from '@cpn/shared'

export default function SignUpPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const router = useRouter()
  const supabase = createSupabaseBrowser()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) {
        setError(error.message)
      } else {
        setMessage('Check your email for confirmation link!')
        // Optionally redirect to login after a delay
        setTimeout(() => router.push('/auth/login'), 3000)
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
          <h2 className="text-xl text-cpn-white">Create Account</h2>
          <p className="text-cpn-gray mt-2">Start tracking your metrics</p>
        </div>

        <form onSubmit={handleSignUp} className="space-y-6">
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
              minLength={6}
              className="w-full px-3 py-2 bg-cpn-gray/10 border border-cpn-gray/20 rounded-lg text-cpn-white placeholder-cpn-gray/50 focus:outline-none focus:ring-2 focus:ring-cpn-yellow"
              placeholder="Create a password"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-cpn-white mb-2">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-3 py-2 bg-cpn-gray/10 border border-cpn-gray/20 rounded-lg text-cpn-white placeholder-cpn-gray/50 focus:outline-none focus:ring-2 focus:ring-cpn-yellow"
              placeholder="Confirm your password"
            />
          </div>

          {error && (
            <div className="text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          {message && (
            <div className="text-green-400 text-sm text-center">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-cpn-yellow text-cpn-dark font-medium rounded-lg hover:bg-cpn-yellow/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <div className="text-center">
          <p className="text-cpn-gray">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-cpn-yellow hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}