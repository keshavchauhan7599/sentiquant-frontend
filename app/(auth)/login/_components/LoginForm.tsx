'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { authService } from '@/src/services/authService'
import { ApiError } from '@/src/types'

interface FormFields {
  email: string
  password: string
}

interface FieldErrors {
  email?: string
  password?: string
}

function validate(fields: FormFields): FieldErrors {
  const errors: FieldErrors = {}

  if (!fields.email) {
    errors.email = 'Email is required.'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) {
    errors.email = 'Enter a valid email address.'
  }

  if (!fields.password) {
    errors.password = 'Password is required.'
  } else if (fields.password.length < 6) {
    errors.password = 'Password must be at least 6 characters.'
  }

  return errors
}

export default function LoginForm() {
  const router = useRouter()

  const [fields, setFields] = useState<FormFields>({ email: '', password: '' })
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [apiError, setApiError] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target
    const updated = { ...fields, [name]: value }
    setFields(updated)
    if (submitted) setFieldErrors(validate(updated))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitted(true)
    setApiError('')

    const errors = validate(fields)
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    setLoading(true)
    try {
      await authService.login({ email: fields.email, password: fields.password })
      router.push('/portfolio')
      router.refresh()
    } catch (err) {
      setApiError(
        err instanceof ApiError ? err.message : 'Something went wrong. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-sm">
      {/* Brand */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-600 text-white font-bold text-base mb-4 select-none">
          SQ
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white">
          Welcome back
        </h1>
        <p className="mt-1.5 text-sm text-zinc-500 dark:text-zinc-400">
          Sign in to your Sentiquant account
        </p>
      </div>

      {/* Card */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xs p-8">
        <form onSubmit={handleSubmit} noValidate className="space-y-5">

          {/* API error banner */}
          {apiError && (
            <div className="flex items-start gap-3 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/40 px-4 py-3">
              <svg
                className="mt-0.5 h-4 w-4 shrink-0 text-red-600 dark:text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-sm text-red-700 dark:text-red-400">{apiError}</p>
            </div>
          )}

          {/* Email */}
          <div className="space-y-1.5">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={fields.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className={[
                'w-full rounded-lg border bg-white dark:bg-zinc-800 px-3.5 py-2.5',
                'text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400',
                'outline-none transition-shadow',
                'focus:ring-2 focus:ring-indigo-500 focus:border-transparent',
                fieldErrors.email
                  ? 'border-red-400 dark:border-red-600'
                  : 'border-zinc-200 dark:border-zinc-700',
              ].join(' ')}
            />
            {fieldErrors.email && (
              <p className="text-xs text-red-600 dark:text-red-400">{fieldErrors.email}</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={fields.password}
              onChange={handleChange}
              placeholder="••••••••"
              className={[
                'w-full rounded-lg border bg-white dark:bg-zinc-800 px-3.5 py-2.5',
                'text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400',
                'outline-none transition-shadow',
                'focus:ring-2 focus:ring-indigo-500 focus:border-transparent',
                fieldErrors.password
                  ? 'border-red-400 dark:border-red-600'
                  : 'border-zinc-200 dark:border-zinc-700',
              ].join(' ')}
            />
            {fieldErrors.password && (
              <p className="text-xs text-red-600 dark:text-red-400">{fieldErrors.password}</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2.5 transition-colors"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Signing in…
              </>
            ) : (
              'Sign in'
            )}
          </button>
        </form>
      </div>

      {/* Footer link */}
      <p className="mt-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
        Don&apos;t have an account?{' '}
        <Link
          href="/signup"
          className="font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 transition-colors"
        >
          Sign up
        </Link>
      </p>
    </div>
  )
}
