import Chat from './components/Chat'

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.05),transparent_50%)]"></div>

      <div className="relative min-h-screen p-6">
        <header className="max-w-5xl mx-auto py-8">
          <div className="flex items-center gap-4">
            <img src="/flame-icon.svg" alt="Flames" className="w-10 h-10" />
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Live Chat</h1>
              <p className="text-blue-200/80 text-sm">AJAX polling with a persistent backend</p>
            </div>
          </div>
        </header>

        <main className="relative z-10 px-2">
          <Chat />
        </main>

        <footer className="max-w-5xl mx-auto py-6 text-center">
          <p className="text-blue-300/60 text-xs">Built with FastAPI + MongoDB + React</p>
        </footer>
      </div>
    </div>
  )
}

export default App
