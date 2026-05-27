'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const router = useRouter()

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setErrorMsg(error.message)
    else router.push('/dashboard')
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
      <div className="bg-gray-900 p-8 rounded-xl border border-gray-800 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Welcome back</h2>
        {errorMsg && <p className="text-red-400 text-sm mb-4">{errorMsg}</p>}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 mb-4 outline-none focus:border-violet-500"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 mb-6 outline-none focus:border-violet-500"
        />
        <button
          onClick={handleLogin}
          className="w-full bg-violet-600 hover:bg-violet-700 py-3 rounded-lg font-semibold transition"
        >
          Login
        </button>
        <p className="text-center text-gray-400 mt-4 text-sm">
          No account? <Link href="/signup" className="text-violet-400 hover:underline">Sign up</Link>
        </p>
      </div>
    </main>
  )
}