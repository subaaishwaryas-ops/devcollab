'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

const COLUMNS = ['todo', 'inprogress', 'inreview', 'done']
const COLUMN_LABELS: Record<string, string> = {
  todo: '📋 To Do',
  inprogress: '⚡ In Progress',
  inreview: '👀 In Review',
  done: '✅ Done'
}
const PRIORITIES = ['P0', 'P1', 'P2']

export default function Project() {
  const [tasks, setTasks] = useState<any[]>([])
  const [project, setProject] = useState<any>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'P1', status: 'todo' })
  const [aiResponse, setAiResponse] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'kanban' | 'snippets' | 'ai'>('kanban')
  const [snippets, setSnippets] = useState<any[]>([])
  const [newSnippet, setNewSnippet] = useState({ title: '', language: 'javascript', code: '', tags: '' })
  const [showSnippetForm, setShowSnippetForm] = useState(false)
  const params = useParams()
  const id = params.id as string

  useEffect(() => {
    const load = async () => {
      const { data: proj } = await supabase.from('projects').select('*').eq('id', id).single()
      setProject(proj)
      const { data: t } = await supabase.from('tasks').select('*').eq('project_id', id)
      setTasks(t || [])
      const { data: s } = await supabase.from('snippets').select('*').eq('project_id', id)
      setSnippets(s || [])
    }
    load()
  }, [])

  const addTask = async () => {
    if (!newTask.title.trim()) return
    const { data } = await supabase.from('tasks').insert({
      ...newTask,
      project_id: id
    }).select().single()
    if (data) setTasks([...tasks, data])
    setNewTask({ title: '', description: '', priority: 'P1', status: 'todo' })
    setShowAdd(false)
  }

  const moveTask = async (taskId: string, newStatus: string) => {
    await supabase.from('tasks').update({ status: newStatus }).eq('id', taskId)
    setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t))
  }

  const askAI = async (prompt: string) => {
    setAiLoading(true)
    setAiResponse('')
    try {
      const taskSummary = tasks.map(t => `${t.title} [${t.status}] [${t.priority}]`).join(', ')
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, tasks: taskSummary, project: project?.name })
      })
      const data = await res.json()
      setAiResponse(data.response)
    } catch {
      setAiResponse('Error contacting AI. Please try again.')
    }
    setAiLoading(false)
  }

  const addSnippet = async () => {
    if (!newSnippet.title.trim()) return
    const { data } = await supabase.from('snippets').insert({
      ...newSnippet,
      tags: newSnippet.tags.split(',').map(t => t.trim()),
      project_id: id
    }).select().single()
    if (data) setSnippets([...snippets, data])
    setNewSnippet({ title: '', language: 'javascript', code: '', tags: '' })
    setShowSnippetForm(false)
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <nav className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-gray-400 hover:text-white">← Back</Link>
          <h1 className="text-xl font-bold text-violet-400">{project?.name}</h1>
        </div>
        <div className="flex gap-2">
          {(['kanban', 'snippets', 'ai'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === tab ? 'bg-violet-600' : 'bg-gray-800 hover:bg-gray-700'}`}
            >
              {tab === 'kanban' ? '🗂 Board' : tab === 'snippets' ? '💻 Snippets' : '🤖 AI'}
            </button>
          ))}
        </div>
      </nav>

      {activeTab === 'kanban' && (
        <div className="px-6 py-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Kanban Board</h2>
            <button
              onClick={() => setShowAdd(true)}
              className="bg-violet-600 hover:bg-violet-700 px-4 py-2 rounded-lg text-sm font-semibold"
            >
              + Add Task
            </button>
          </div>

          {showAdd && (
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 mb-6 max-w-lg">
              <h3 className="font-semibold mb-4">New Task</h3>
              <input
                type="text"
                placeholder="Task title"
                value={newTask.title}
                onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 mb-3 outline-none focus:border-violet-500"
              />
              <input
                type="text"
                placeholder="Description"
                value={newTask.description}
                onChange={e => setNewTask({ ...newTask, description: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 mb-3 outline-none focus:border-violet-500"
              />
              <div className="flex gap-3 mb-4">
                <select
                  value={newTask.priority}
                  onChange={e => setNewTask({ ...newTask, priority: e.target.value })}
                  className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 outline-none"
                >
                  {PRIORITIES.map(p => <option key={p}>{p}</option>)}
                </select>
                <select
                  value={newTask.status}
                  onChange={e => setNewTask({ ...newTask, status: e.target.value })}
                  className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 outline-none"
                >
                  {COLUMNS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="flex gap-2">
                <button onClick={addTask} className="bg-violet-600 hover:bg-violet-700 px-4 py-2 rounded-lg text-sm font-semibold">Add</button>
                <button onClick={() => setShowAdd(false)} className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg text-sm">Cancel</button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-4 gap-4">
            {COLUMNS.map(col => (
              <div key={col} className="bg-gray-900 rounded-xl p-4 border border-gray-800">
                <h3 className="font-semibold mb-4 text-sm">{COLUMN_LABELS[col]}</h3>
                <div className="space-y-3">
                  {tasks.filter(t => t.status === col).map(task => (
                    <div key={task.id} className="bg-gray-800 rounded-lg p-3 border border-gray-700">
                      <p className="font-medium text-sm mb-1">{task.title}</p>
                      {task.description && <p className="text-gray-400 text-xs mb-2">{task.description}</p>}
                      <div className="flex items-center justify-between">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${task.priority === 'P0' ? 'bg-red-900 text-red-300' : task.priority === 'P1' ? 'bg-yellow-900 text-yellow-300' : 'bg-green-900 text-green-300'}`}>
                          {task.priority}
                        </span>
                        <select
                          value={task.status}
                          onChange={e => moveTask(task.id, e.target.value)}
                          className="text-xs bg-gray-700 border border-gray-600 rounded px-1 py-0.5 outline-none"
                        >
                          {COLUMNS.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                    </div>
                  ))}
                  {tasks.filter(t => t.status === col).length === 0 && (
                    <p className="text-gray-600 text-xs text-center py-4">No tasks</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'snippets' && (
        <div className="px-6 py-6 max-w-4xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Code Snippets</h2>
            <button onClick={() => setShowSnippetForm(true)} className="bg-violet-600 hover:bg-violet-700 px-4 py-2 rounded-lg text-sm font-semibold">
              + Add Snippet
            </button>
          </div>

          {showSnippetForm && (
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 mb-6">
              <input type="text" placeholder="Title" value={newSnippet.title} onChange={e => setNewSnippet({ ...newSnippet, title: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 mb-3 outline-none focus:border-violet-500" />
              <select value={newSnippet.language} onChange={e => setNewSnippet({ ...newSnippet, language: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 mb-3 outline-none">
                {['javascript', 'python', 'typescript', 'java', 'cpp', 'go'].map(l => <option key={l}>{l}</option>)}
              </select>
              <textarea placeholder="Paste your code here..." value={newSnippet.code} onChange={e => setNewSnippet({ ...newSnippet, code: e.target.value })} rows={6} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 mb-3 outline-none font-mono text-sm focus:border-violet-500" />
              <input type="text" placeholder="Tags (comma separated)" value={newSnippet.tags} onChange={e => setNewSnippet({ ...newSnippet, tags: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 mb-4 outline-none focus:border-violet-500" />
              <div className="flex gap-2">
                <button onClick={addSnippet} className="bg-violet-600 hover:bg-violet-700 px-4 py-2 rounded-lg text-sm font-semibold">Save</button>
                <button onClick={() => setShowSnippetForm(false)} className="bg-gray-700 px-4 py-2 rounded-lg text-sm">Cancel</button>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {snippets.map(s => (
              <div key={s.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold">{s.title}</h3>
                    <span className="text-xs text-violet-400 bg-violet-900/30 px-2 py-0.5 rounded">{s.language}</span>
                  </div>
                  <button onClick={() => navigator.clipboard.writeText(s.code)} className="text-xs bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded-lg">Copy</button>
                </div>
                <pre className="bg-gray-800 rounded-lg p-4 text-sm font-mono overflow-x-auto mt-3 text-green-300">{s.code}</pre>
                {s.tags?.length > 0 && (
                  <div className="flex gap-2 mt-2">
                    {s.tags.map((tag: string) => <span key={tag} className="text-xs text-gray-400 bg-gray-800 px-2 py-0.5 rounded">#{tag}</span>)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'ai' && (
        <div className="px-6 py-6 max-w-2xl">
          <h2 className="text-xl font-bold mb-6">🤖 AI Project Assistant</h2>
          <div className="grid grid-cols-1 gap-3 mb-6">
            {[
              { label: '📊 Summarise Project', prompt: 'Summarise this project progress' },
              { label: '🚧 What is Blocking Us?', prompt: 'What tasks are blocking progress?' },
              { label: '📝 Generate Standup Report', prompt: 'Generate a daily standup report' },
            ].map(btn => (
              <button
                key={btn.prompt}
                onClick={() => askAI(btn.prompt)}
                className="bg-gray-900 hover:bg-gray-800 border border-gray-700 hover:border-violet-500 px-6 py-4 rounded-xl text-left font-medium transition"
              >
                {btn.label}
              </button>
            ))}
          </div>
          {aiLoading && <p className="text-violet-400 animate-pulse">AI is thinking...</p>}
          {aiResponse && (
            <div className="bg-gray-900 border border-violet-800 rounded-xl p-6">
              <p className="text-gray-300 whitespace-pre-wrap">{aiResponse}</p>
            </div>
          )}
        </div>
      )}
    </main>
  )
}