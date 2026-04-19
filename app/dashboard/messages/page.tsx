'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Send, MessageSquare } from 'lucide-react'

// Layout matching the chat CSS
export default function FounderMessagesPage() {
  const [threads, setThreads] = useState<any[]>([])
  const [activeThread, setActiveThread] = useState<string | null>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [draft, setDraft] = useState('')
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Fetch threads initially and on interval
  const fetchThreads = async () => {
    try {
      const res = await fetch('/api/messages/threads')
      if (res.ok) {
        const data = await res.json()
        setThreads(data.threads)
      }
    } catch (error) {
      console.error('Fetch threads failed:', error)
    } finally {
      if (loading) setLoading(false)
    }
  }

  const fetchMessages = async (threadId: string) => {
    try {
      const res = await fetch(`/api/messages/${threadId}`)
      if (res.ok) {
        const data = await res.json()
        setMessages(data.messages)
      }
    } catch (error) {
      console.error('Fetch messages failed:', error)
    }
  }

  // Initial load
  useEffect(() => {
    fetchThreads()
  }, [])

  // Switch thread
  useEffect(() => {
    if (activeThread) {
      fetchMessages(activeThread)
    } else {
      setMessages([])
    }
  }, [activeThread])

  // Polling
  useEffect(() => {
    const interval = setInterval(() => {
      fetchThreads()
      if (activeThread) {
        fetchMessages(activeThread)
      }
    }, 10000)
    return () => clearInterval(interval)
  }, [activeThread])

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!draft.trim() || !activeThread) return
    const content = draft
    setDraft('')

    // Optimistic UI
    const tempMsg = {
      _id: Date.now().toString(),
      content,
      senderRole: 'founder',
      createdAt: new Date().toISOString()
    }
    setMessages(prev => [...prev, tempMsg])

    try {
      const res = await fetch(`/api/messages/${activeThread}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      })
      if (!res.ok) {
        console.error('Failed to send message')
      }
      // Re-fetch to guarantee sync
      fetchMessages(activeThread)
      fetchThreads()
    } catch (error) {
      console.error('Send error:', error)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const timeAgo = (dateStr: string) => {
    const s = Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / 1000)
    if (s < 60) return 'Just now'
    if (s < 3600) return `${Math.floor(s / 60)}m ago`
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`
    return `${Math.floor(s / 86400)}d ago`
  }

  const activeThreadData = threads.find(t => t.threadId === activeThread)

  if (loading) {
    return <div className="chat-container"><div className="chat-messages"><span className="spinner"></span></div></div>
  }

  return (
    <div className="chat-container" style={{ margin: '-28px' }}>
      <div className="chat-sidebar">
        <div className="chat-sidebar-header">
          <h2 style={{ fontSize: '15px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MessageSquare size={16} /> Messages
          </h2>
        </div>
        <div className="chat-list">
          {threads.length === 0 ? (
            <div className="empty-state" style={{ padding: '20px', textAlign: 'center' }}>
              <MessageSquare size={32} style={{ color: 'var(--text-muted)', marginBottom: 12 }} />
              <p className="empty-desc" style={{ fontSize: '13px' }}>
                No messages yet. Once an investor&apos;s introduction is accepted, you can chat here.
              </p>
            </div>
          ) : (
            threads.map(thread => (
              <div
                key={thread.threadId}
                className={`chat-list-item ${activeThread === thread.threadId ? 'active' : ''}`}
                style={{
                  borderLeft: activeThread === thread.threadId ? '3px solid var(--color-green)' : '3px solid transparent'
                }}
                onClick={() => setActiveThread(thread.threadId)}
              >
                <div className="chat-item-title" style={{ fontSize: '14px', marginBottom: '2px' }}>
                  {thread.investorName} 
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-primary)', opacity: 0.9, marginBottom: '6px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {thread.lastMessage || 'Start the conversation...'}
                </div>
                <div className="chat-item-meta">
                  <span className="chat-item-time">{timeAgo(thread.lastMessageAt)}</span>
                  {/* Unread dot logic ideally needs tracking unread count, but checking if last msg is from investor and unread isn't directly in thread model easily. We'll simplify to just showing a dot if needed. */}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="chat-main">
        {activeThreadData ? (
          <>
            <div className="chat-header">
              <div style={{ width: 34, height: 34, borderRadius: 4, background: 'var(--elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700 }}>
                {activeThreadData.investorName.charAt(0)}
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700 }}>{activeThreadData.investorName}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Investor</div>
              </div>
            </div>

            <div className="chat-messages">
              {messages.map(msg => {
                const isMe = msg.senderRole === 'founder'
                return (
                  <div key={msg._id} className={`msg ${isMe ? 'msg-user' : ''}`}>
                    <div className="msg-bubble" style={{
                      background: isMe ? 'var(--color-green)' : 'var(--elevated)',
                      color: isMe ? '#000' : 'var(--text-primary)',
                      border: isMe ? 'none' : '1px solid var(--border)'
                    }}>
                      <div style={{ fontSize: 14, lineHeight: 1.5 }}>
                        {msg.content}
                      </div>
                      <div style={{ fontSize: 10, marginTop: 4, opacity: isMe ? 0.7 : 0.5, textAlign: isMe ? 'right' : 'left' }}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>

            <div className="chat-input-area">
              <textarea
                className="chat-textarea"
                placeholder="Type a message..."
                value={draft}
                onChange={e => setDraft(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button
                className="btn btn-primary"
                style={{ padding: '10px 14px', height: '44px' }}
                onClick={handleSend}
                disabled={!draft.trim()}
              >
                <Send size={16} />
              </button>
            </div>
          </>
        ) : (
          <div className="empty-state" style={{ height: '100%', margin: 'auto' }}>
            <MessageSquare size={48} style={{ color: 'var(--border)', marginBottom: 16 }} />
            <h3 className="empty-title" style={{ color: 'var(--text-muted)' }}>Select a thread</h3>
            <p className="empty-desc">Choose an active conversation from the sidebar.</p>
          </div>
        )}
      </div>
    </div>
  )
}
