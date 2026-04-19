'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { Send, Plus, Trash2, MessageSquare } from 'lucide-react'
import Sidebar from '@/components/Sidebar'
import TopBar from '@/components/TopBar'
import ChatMessage from '@/components/ChatMessage'
import EmptyState from '@/components/EmptyState'
import { useSelectedProblem } from '@/lib/useSelectedProblem'
import { Target } from 'lucide-react'

const AGENTS = [
  { value: 'supervisor', label: '🧠 Supervisor', name: 'Supervisor AI' },
  { value: 'research', label: '🔍 Research', name: 'Research Agent' },
  { value: 'code', label: '💻 Code', name: 'Code Agent' },
  { value: 'marketing', label: '📣 Marketing', name: 'Marketing Agent' },
  { value: 'legal', label: '⚖️ Legal', name: 'Legal Agent' },
  { value: 'finance', label: '💰 Finance', name: 'Finance Agent' },
]

interface ChatItem {
  _id: string
  title: string
  agent: string
  updatedAt: string
}

interface Message {
  _id?: string
  role: 'user' | 'assistant'
  content: string
  agentName?: string
  agentEmoji?: string
  timestamp: string
}

function timeAgo(d: string) {
  const diff = Date.now() - new Date(d).getTime()
  const min = Math.floor(diff / 60000)
  if (min < 60) return `${min}m ago`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr}h ago`
  return `${Math.floor(hr / 24)}d ago`
}

export default function ChatPage() {
  const { data: session } = useSession()
  const [chats, setChats] = useState<ChatItem[]>([])
  const [activeChatId, setActiveChatId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [sending, setSending] = useState(false)
  const [selectedAgent, setSelectedAgent] = useState('supervisor')
  const [loadingChats, setLoadingChats] = useState(true)
  const [newChatMode, setNewChatMode] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { problem } = useSelectedProblem()

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })

  const fetchChats = useCallback(async () => {
    try {
      const res = await fetch('/api/chats')
      if (res.ok) {
        const data = await res.json()
        setChats(data.chats || [])
      }
    } finally {
      setLoadingChats(false)
    }
  }, [])

  const fetchMessages = useCallback(async (id: string) => {
    const res = await fetch(`/api/chats/${id}`)
    if (res.ok) {
      const data = await res.json()
      setMessages(data.chat?.messages || [])
      setTimeout(scrollToBottom, 100)
    }
  }, [])

  useEffect(() => { fetchChats() }, [fetchChats])

  useEffect(() => {
    if (activeChatId) fetchMessages(activeChatId)
  }, [activeChatId, fetchMessages])

  useEffect(() => { scrollToBottom() }, [messages, typing])

  const handleSend = async () => {
    if (!input.trim() || sending) return
    const text = input.trim()
    setInput('')

    if (!activeChatId || newChatMode) {
      // Create new chat
      setSending(true)
      try {
        const res = await fetch('/api/chats', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ firstMessage: text, agent: selectedAgent }),
        })
        if (res.ok) {
          const data = await res.json()
          setChats(prev => [data.chat, ...prev])
          setActiveChatId(data.chat._id)
          setMessages(data.chat.messages || [])
          setNewChatMode(false)
          setTimeout(scrollToBottom, 100)
        }
      } finally {
        setSending(false)
      }
      return
    }

    // Append user message optimistically
    const userMsg: Message = { role: 'user', content: text, timestamp: new Date().toISOString() }
    setMessages(prev => [...prev, userMsg])
    setSending(true)
    setTyping(true)

    try {
      const res = await fetch(`/api/chats/${activeChatId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: text }),
      })
      
      if (res.ok) {
        const data = await res.json()
        setMessages(data.chat.messages || [])
        setTimeout(scrollToBottom, 50)
      } else {
        // Fallback if API completely crashes
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: 'Agent unavailable. Please try again.',
          timestamp: new Date().toISOString(),
          agentName: AGENTS.find(a => a.value === selectedAgent)?.name,
          agentEmoji: '⚠️'
        }])
      }
    } finally {
      setTyping(false)
      setSending(false)
      fetchChats()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const deleteChat = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    await fetch(`/api/chats/${id}`, { method: 'DELETE' })
    setChats(prev => prev.filter(c => c._id !== id))
    if (activeChatId === id) { setActiveChatId(null); setMessages([]) }
  }

  const agentInfo = AGENTS.find(a => a.value === selectedAgent)

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-main">
        <TopBar title="AI Chat" />
        <div className="chat-container">
          {/* Chat list sidebar */}
          <div className="chat-sidebar">
            <div className="chat-sidebar-header">
              <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', fontSize: 12 }}
                onClick={() => { setNewChatMode(true); setActiveChatId(null); setMessages([]) }}>
                <Plus size={15} /> New Chat
              </button>
            </div>
            <div className="chat-list">
              {loadingChats ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} style={{ padding: '12px', marginBottom: 4 }}>
                    <div className="skeleton" style={{ width: '80%', height: 13, marginBottom: 6 }} />
                    <div className="skeleton" style={{ width: '50%', height: 10 }} />
                  </div>
                ))
              ) : chats.length === 0 ? (
                <p style={{ textAlign: 'center', padding: '24px 12px', fontSize: 13, color: 'var(--text-muted)' }}>No chats yet</p>
              ) : (
                chats.map(c => (
                  <div key={c._id} className={`chat-list-item ${activeChatId === c._id ? 'active' : ''}`}
                    onClick={() => { setActiveChatId(c._id); setNewChatMode(false) }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <p className="chat-item-title" style={{ flex: 1 }}>{c.title}</p>
                      <button onClick={(e) => deleteChat(c._id, e)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0 0 0 4px', flexShrink: 0 }}>
                        <Trash2 size={12} />
                      </button>
                    </div>
                    <div className="chat-item-meta">
                      <span className="chat-item-agent">{c.agent}</span>
                      <span className="chat-item-time">{timeAgo(c.updatedAt)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Main chat area */}
          <div className="chat-main">
            {/* Agent selector */}
            <div className="chat-header">
              <span style={{ fontSize: 24 }}>{AGENTS.find(a => a.value === selectedAgent)?.label.split(' ')[0]}</span>
              <div>
                <p style={{ fontWeight: 600, fontSize: 14 }}>{agentInfo?.name}</p>
                {problem ? (
                  <p style={{ fontSize: 11, color: '#00F5A0', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Target size={12} /> Context: {problem.title}
                  </p>
                ) : (
                  <p style={{ fontFamily: 'Space Mono', fontSize: 10, color: 'var(--text-muted)' }}>Select agent below to change</p>
                )}
              </div>
              <select
                value={selectedAgent}
                onChange={e => setSelectedAgent(e.target.value)}
                className="select"
                style={{ maxWidth: 180, marginLeft: 'auto' }}
              >
                {AGENTS.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
              </select>
            </div>

            {/* Messages */}
            <div className="chat-messages">
              {!activeChatId && !newChatMode ? (
                <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                  <EmptyState
                    icon={MessageSquare}
                    title="Start a conversation"
                    description="Select a chat from the sidebar or click New Chat to get started."
                    action={{ label: 'New Chat', onClick: () => setNewChatMode(true) }}
                  />
                </div>
              ) : messages.length === 0 && newChatMode ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                  <p style={{ fontSize: 32, marginBottom: 12 }}>{AGENTS.find(a => a.value === selectedAgent)?.label.split(' ')[0]}</p>
                  <p style={{ fontFamily: 'Syne', fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
                    {agentInfo?.name} ready
                  </p>
                  <p style={{ fontSize: 14 }}>Ask me anything. I&apos;m here to help build your startup.</p>
                </div>
              ) : (
                messages.map((msg, i) => (
                  <ChatMessage
                    key={i}
                    role={msg.role}
                    content={msg.content}
                    agentName={msg.agentName}
                    agentEmoji={msg.agentEmoji}
                    timestamp={msg.timestamp}
                    userName={session?.user?.name}
                  />
                ))
              )}
              {typing && (
                <div className="msg msg-assistant">
                  <div className="msg-avatar agent-avatar">{AGENTS.find(a => a.value === selectedAgent)?.label.split(' ')[0]}</div>
                  <div className="msg-bubble msg-bubble-assistant">
                    <div className="typing-indicator">
                      <div className="typing-dot" />
                      <div className="typing-dot" />
                      <div className="typing-dot" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <div className="chat-input-area">
              <textarea
                ref={textareaRef}
                className="chat-textarea"
                placeholder={`Message ${agentInfo?.name}...`}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                disabled={sending}
              />
              <button
                className="btn btn-primary"
                onClick={handleSend}
                disabled={!input.trim() || sending}
                style={{ padding: '10px 16px', flexShrink: 0 }}
              >
                {sending ? <span className="spinner" /> : <Send size={16} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
