import type { Metadata } from 'next'
import SignupForm from './_components/SignupForm'

export const metadata: Metadata = {
  title: 'Create account — Sentiquant',
  description: 'Create your free Sentiquant account',
}

export default function SignupPage() {
  return <SignupForm />
}
