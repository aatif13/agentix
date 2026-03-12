'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { Plus, Filter, X, AlertCircle } from 'lucide-react'
import Sidebar from '@/components/Sidebar'
import TopBar from '@/components/TopBar'
import TaskRow from '@/components/TaskRow'
import EmptyState from '@/components/EmptyState'
import LoadingSkeleton from '@/components/LoadingSkeleton'

const AGENTS = [
  { value: 'Research', label: '🔍 Research' },
  { value: 'Code', label: '💻 Code' },
  { value: 'Marketing', label: '📣 Marketing' },
  { value: 'Legal', label: '⚖️ Legal' },
  { value: 'Finance', label: '💰 Finance' },
  { value: 'Analytics', label: '📊 Analytics' },
]

interface AgentTask {
  _id: string
  taskName: string
  description: string
  agent: string
  agentEmoji: string
  status: 'queued' | 'running' | 'completed' | 'failed'
  result?: string
  startedAt?: string
  completedAt?: string
  createdAt: string
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<AgentTask[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [filterAgent, setFilterAgent] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [form, setForm] = useState({ taskName: '', description: '', agent: 'Research' })
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch('/api/tasks')
      if (res.ok) {
        const data = await res.json()
        setTasks(data.tasks || [])
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchTasks() }, [fetchTasks])

  // Poll every 2s when running/queued tasks exist
  useEffect(() => {
    const hasActive = tasks.some(t => t.status === 'queued' || t.status === 'running')
    if (hasActive) {
      pollRef.current = setInterval(fetchTasks, 2000)
    } else {
      if (pollRef.current) clearInterval(pollRef.current)
    }
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [tasks, fetchTasks])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed to create task'); return }
      setTasks(prev => [data.task, ...prev])
      setForm({ taskName: '', description: '', agent: 'Research' })
      setShowModal(false)
    } catch {
      setError('Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  const filtered = tasks.filter(t => {
    if (filterAgent && t.agent !== filterAgent) return false
    if (filterStatus && t.status !== filterStatus) return false
    return true
  })

  const completed = tasks.filter(t => t.status === 'completed').length
  const running = tasks.filter(t => t.status === 'running' || t.status === 'queued').length

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-main">
        <TopBar title="Agent Tasks" subtitle="Run and monitor AI agent workflows" />
        <div className="dashboard-content">
          {/* Summary row */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
            {[
              { label: 'Total Tasks', value: tasks.length, color: 'var(--color-cyan)' },
              { label: 'Completed', value: completed, color: 'var(--color-green)' },
              { label: 'Running', value: running, color: '#FFC300' },
            ].map(s => (
              <div key={s.label} className="card" style={{ flex: 1, padding: '16px 20px' }}>
                <p style={{ fontFamily: 'Space Mono', fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>{s.label}</p>
                <p style={{ fontFamily: 'Syne', fontSize: 28, fontWeight: 800, color: s.color }}>{s.value}</p>
              </div>
            ))}
            <div style={{ display: 'flex', alignItems: 'stretch' }}>
              <button className="btn btn-primary" onClick={() => setShowModal(true)} style={{ height: '100%', padding: '0 24px', fontSize: 13 }}>
                <Plus size={16} /> New Task
              </button>
            </div>
          </div>

          {error && (
            <div style={{ background: 'rgba(255,107,53,0.08)', border: '1px solid rgba(255,107,53,0.2)', borderRadius: 4, padding: '12px 16px', marginBottom: 16, color: 'var(--color-orange)', fontSize: 13, display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><AlertCircle size={14} />{error}</span>
              <button onClick={() => setError('')} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}><X size={14} /></button>
            </div>
          )}

          {/* Filters */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Filter size={14} style={{ color: 'var(--text-muted)' }} />
              <span style={{ fontFamily: 'Space Mono', fontSize: 11, color: 'var(--text-muted)' }}>FILTER BY</span>
            </div>
            <select className="select" value={filterAgent} onChange={e => setFilterAgent(e.target.value)} style={{ width: 'auto', fontSize: 12 }}>
              <option value="">All Agents</option>
              {AGENTS.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
            </select>
            <select className="select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ width: 'auto', fontSize: 12 }}>
              <option value="">All Statuses</option>
              {['queued', 'running', 'completed', 'failed'].map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
            </select>
            {(filterAgent || filterStatus) && (
              <button className="btn btn-ghost" onClick={() => { setFilterAgent(''); setFilterStatus('') }} style={{ padding: '6px 12px', fontSize: 12 }}>
                <X size={12} /> Clear
              </button>
            )}
          </div>

          {/* New Task Modal */}
          {showModal && (
            <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
              <div className="modal-box" style={{ maxWidth: 500 }}>
                <div className="modal-header">
                  <h2 className="modal-title">New Agent Task</h2>
                  <button className="modal-close" onClick={() => setShowModal(false)}><X size={18} /></button>
                </div>
                <div className="modal-body">
                  <form onSubmit={handleSubmit}>
                    <div className="form-group">
                      <label className="form-label">Task Name</label>
                      <input className="input" placeholder="e.g. Analyze competitor pricing" value={form.taskName} onChange={e => setForm({ ...form, taskName: e.target.value })} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Description</label>
                      <textarea className="textarea" placeholder="Describe what you want the agent to do..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required rows={3} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Agent</label>
                      <select className="select" value={form.agent} onChange={e => setForm({ ...form, agent: e.target.value })}>
                        {AGENTS.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
                      </select>
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={submitting} style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}>
                      {submitting ? <><span className="spinner" /> Creating...</> : <><Plus size={15} /> Create Task</>}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* Tasks list */}
          {loading ? (
            <LoadingSkeleton type="row" count={5} />
          ) : filtered.length === 0 ? (
            tasks.length === 0 ? (
              <EmptyState
                icon={Plus}
                title="No tasks yet"
                description="Create your first agent task to automate research, code generation, marketing, and more."
                action={{ label: 'Create First Task', onClick: () => setShowModal(true) }}
              />
            ) : (
              <EmptyState
                icon={Filter}
                title="No tasks match filters"
                description="Try adjusting your filter criteria."
                action={{ label: 'Clear Filters', onClick: () => { setFilterAgent(''); setFilterStatus('') } }}
              />
            )
          ) : (
            <div>
              {filtered.map(task => <TaskRow key={task._id} task={task} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
