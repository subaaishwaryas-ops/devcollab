'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [workspaces, setWorkspaces] = useState<any[]>([])
  const [newWorkspace, setNewWorkspace] = useState('')
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) router.push('/login')
      else {
        setUser(user)
        const { data } = await supabase.from('workspaces').select('*').eq('owner_id', user.id)
        setWorkspaces(data || [])
        setLoading(false)
      }
    }
    getUser()
  }, [])

  const createWorkspace = async () => {
    if (!newWorkspace.trim()) return
    const { data } = await supabase.from('workspaces').insert({
      name: newWorkspace,
      owner_id: user.id
    }).select().single()
    if (data) setWorkspaces([...workspaces, data])
    setNewWorkspace('')
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
      <p className="text-gray-400">Loading...</p>
    </div>
  )

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <nav className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
          DevCollab
        </h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-400 text-sm">{user?.email}</span>
          <button onClick={handleLogout} className="text-sm text-red-400 hover:text-red-300">Logout</button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-10">
        <h2 className="text-2xl font-bold mb-8">Your Workspaces</h2>

        <div className="flex gap-3 mb-8">
          <input
            type="text"
            placeholder="New workspace name..."
            value={newWorkspace}
            onChange={e => setNewWorkspace(e.target.value)}
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 outline-none focus:border-violet-500"
          />
          <button
            onClick={createWorkspace}
            className="bg-violet-600 hover:bg-violet-700 px-6 py-3 rounded-lg font-semibold transition"
          >
            Create
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {workspaces.map(ws => (
            <Link key={ws.id} href={`/workspace/${ws.id}`}>
              <div className="bg-gray-900 border border-gray-800 hover:border-violet-500 rounded-xl p-6 cursor-pointer transition">
                <div className="text-2xl mb-3">🏢</div>
                <h3 className="font-semibold text-lg">{ws.name}</h3>
                <p className="text-gray-400 text-sm mt-1">Click to open workspace</p>
              </div>
            </Link>
          ))}
          {workspaces.length === 0 && (
            <p className="text-gray-500 col-span-3">No workspaces yet. Create one above!</p>
          )}
        </div>
      </div>
    </main>
  )
}