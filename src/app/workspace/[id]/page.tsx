'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

export default function Workspace() {
  const [projects, setProjects] = useState<any[]>([])
  const [newProject, setNewProject] = useState('')
  const [workspace, setWorkspace] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUser(user)
      const { data: ws } = await supabase.from('workspaces').select('*').eq('id', id).single()
      setWorkspace(ws)
      const { data: proj } = await supabase.from('projects').select('*').eq('workspace_id', id)
      setProjects(proj || [])
    }
    load()
  }, [])

  const createProject = async () => {
    if (!newProject.trim()) return
    const { data } = await supabase.from('projects').insert({
      name: newProject,
      workspace_id: id
    }).select().single()
    if (data) setProjects([...projects, data])
    setNewProject('')
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <nav className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-gray-400 hover:text-white">← Back</Link>
          <h1 className="text-xl font-bold text-violet-400">{workspace?.name}</h1>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-10">
        <h2 className="text-2xl font-bold mb-8">Projects</h2>

        <div className="flex gap-3 mb-8">
          <input
            type="text"
            placeholder="New project name..."
            value={newProject}
            onChange={e => setNewProject(e.target.value)}
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 outline-none focus:border-violet-500"
          />
          <button
            onClick={createProject}
            className="bg-violet-600 hover:bg-violet-700 px-6 py-3 rounded-lg font-semibold transition"
          >
            Create
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {projects.map(proj => (
            <Link key={proj.id} href={`/project/${proj.id}`}>
              <div className="bg-gray-900 border border-gray-800 hover:border-violet-500 rounded-xl p-6 cursor-pointer transition">
                <div className="text-2xl mb-3">📁</div>
                <h3 className="font-semibold text-lg">{proj.name}</h3>
                <p className="text-gray-400 text-sm mt-1">Kanban · Snippets · AI Assistant</p>
              </div>
            </Link>
          ))}
          {projects.length === 0 && (
            <p className="text-gray-500 col-span-3">No projects yet. Create one above!</p>
          )}
        </div>
      </div>
    </main>
  )
}