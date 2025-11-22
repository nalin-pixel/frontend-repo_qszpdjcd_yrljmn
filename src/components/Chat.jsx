import { useEffect, useRef, useState } from 'react'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

function Chat() {
  const [room, setRoom] = useState('general')
  const [username, setUsername] = useState('')
  const [connected, setConnected] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [since, setSince] = useState(null)
  const pollRef = useRef(null)
  const endRef = useRef(null)

  useEffect(() => {
    if (connected) {
      startPolling()
    }
    return () => stopPolling()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connected, room])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const startPolling = () => {
    stopPolling()
    fetchMessages(true)
    pollRef.current = setInterval(() => fetchMessages(false), 2000)
  }

  const stopPolling = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current)
      pollRef.current = null
    }
  }

  const connect = (e) => {
    e.preventDefault()
    setMessages([])
    setSince(null)
    setConnected(true)
  }

  const fetchMessages = async (initial) => {
    try {
      const params = new URLSearchParams({ room })
      if (since && !initial) params.append('since', since)
      const res = await fetch(`${BACKEND_URL}/api/messages?${params.toString()}`)
      if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`)
      const data = await res.json()
      if (Array.isArray(data.messages) && data.messages.length > 0) {
        setMessages((prev) => {
          // merge dedup by id+timestamp
          const keyed = new Map(prev.map((m) => [m.id || m.timestamp, m]))
          for (const m of data.messages) {
            keyed.set(m.id || m.timestamp, m)
          }
          return Array.from(keyed.values())
        })
        const last = data.messages[data.messages.length - 1]
        if (last?.timestamp) setSince(last.timestamp)
      }
      setError('')
    } catch (err) {
      setError(err.message)
    }
  }

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!input.trim()) return
    if (!username.trim()) {
      setError('Enter a username first')
      return
    }
    setSending(true)
    try {
      const res = await fetch(`${BACKEND_URL}/api/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ room, sender: username.trim(), content: input.trim() })
      })
      if (!res.ok) throw new Error('Failed to send')
      setInput('')
      await fetchMessages(false)
    } catch (err) {
      setError(err.message)
    } finally {
      setSending(false)
    }
  }

  const formatTime = (iso) => {
    if (!iso) return ''
    try {
      const d = new Date(iso)
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } catch {
      return ''
    }
  }

  return (
    <div className="max-w-5xl mx-auto grid md:grid-cols-[280px,1fr] gap-6">
      <div className="bg-slate-800/50 border border-blue-500/20 rounded-xl p-4 h-fit">
        <h2 className="text-white font-semibold mb-3">Join a room</h2>
        <form onSubmit={connect} className="space-y-3">
          <div>
            <label className="block text-sm text-blue-200 mb-1">Username</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. alex"
              className="w-full px-3 py-2 rounded bg-slate-900/70 text-white border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm text-blue-200 mb-1">Room</label>
            <input
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              placeholder="general"
              className="w-full px-3 py-2 rounded bg-slate-900/70 text-white border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded px-3 py-2 transition"
          >
            {connected ? 'Reconnect' : 'Connect'}
          </button>
          <p className="text-xs text-blue-300/70">Using AJAX polling every 2s</p>
          <p className="text-xs text-blue-300/70 break-all">Backend: {BACKEND_URL}</p>
        </form>
      </div>

      <div className="bg-slate-800/50 border border-blue-500/20 rounded-xl flex flex-col min-h-[60vh]">
        <div className="px-4 py-3 border-b border-blue-500/20 flex items-center justify-between">
          <div>
            <h3 className="text-white font-semibold">Room: {room}</h3>
            <p className="text-xs text-blue-300/70">{connected ? 'Connected' : 'Not connected'}</p>
          </div>
          {error && <span className="text-xs text-red-300">{error}</span>}
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {messages.length === 0 && (
            <p className="text-blue-200/70 text-sm">No messages yet. Say hi!</p>
          )}
          {messages.map((m) => (
            <div key={(m.id||'')+m.timestamp} className={`max-w-[80%] ${m.sender===username? 'ml-auto text-right':''}`}>
              <div className={`inline-block rounded-lg px-3 py-2 mb-1 ${m.sender===username? 'bg-blue-600 text-white':'bg-slate-700 text-blue-100'}`}>
                <div className="text-sm whitespace-pre-wrap break-words">{m.content}</div>
              </div>
              <div className="text-[10px] text-blue-300/70">{m.sender} • {formatTime(m.timestamp)}</div>
            </div>
          ))}
          <div ref={endRef} />
        </div>
        <form onSubmit={sendMessage} className="p-3 border-t border-blue-500/20 flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={connected? 'Type a message...':'Connect to start chatting'}
            disabled={!connected || sending}
            className="flex-1 px-3 py-2 rounded bg-slate-900/70 text-white border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!connected || sending || !input.trim()}
            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded px-4 py-2"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  )
}

export default Chat
