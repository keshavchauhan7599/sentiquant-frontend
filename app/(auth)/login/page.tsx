import type { Metadata } from 'next'
import LoginForm from './_components/LoginForm'

export const metadata: Metadata = {
  title: 'Sign in — Sentiquant',
  description: 'Sign in to your Sentiquant account',
}

export default function LoginPage() {
  return <LoginForm />
}
