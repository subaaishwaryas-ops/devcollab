import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center px-4">
      <div className="max-w-3xl text-center">
        <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
          DevCollab
        </h1>
        <p className="text-xl text-gray-400 mb-8">
          The all-in-one platform for developer teams. Manage tasks, review code, and collaborate in real-time.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/signup" className="bg-violet-600 hover:bg-violet-700 px-8 py-3 rounded-lg font-semibold transition">
            Get Started Free
          </Link>
          <Link href="/login" className="border border-gray-600 hover:border-gray-400 px-8 py-3 rounded-lg font-semibold transition">
            Login
          </Link>
        </div>
        <div className="mt-16 grid grid-cols-3 gap-6 text-left">
          <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
            <div className="text-2xl mb-2">🗂️</div>
            <h3 className="font-semibold mb-1">Kanban Boards</h3>
            <p className="text-gray-400 text-sm">Drag and drop tasks across stages in real-time</p>
          </div>
          <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
            <div className="text-2xl mb-2">🤖</div>
            <h3 className="font-semibold mb-1">AI Assistant</h3>
            <p className="text-gray-400 text-sm">Summarise projects and generate standup reports</p>
          </div>
          <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
            <div className="text-2xl mb-2">💻</div>
            <h3 className="font-semibold mb-1">Code Snippets</h3>
            <p className="text-gray-400 text-sm">Save and share reusable code with syntax highlighting</p>
          </div>
        </div>
      </div>
    </main>
  )
}