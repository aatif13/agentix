'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Sidebar from '@/components/Sidebar'
import TopBar from '@/components/TopBar'
import { useSelectedProblem } from '@/lib/useSelectedProblem'
import {
  Flag, Plus, Sparkles, Target, Trash2, CheckCircle2,
  Circle, Clock, CalendarDays, BarChart3, Loader2,
  AlertCircle, X, ChevronDown, Check,
} from 'lucide-react'

// ── Types ─────────────────────────────────────────────────────────────────────
interface Milestone {
  _id: string
  title: string
  description: string
  targetDate: string
  status: 'planned' | 'in-progress' | 'completed'
  metrics: string
  createdAt: string
}

type StatusVal = 'planned' | 'in-progress' | 'completed'

const STATUS_CONFIG: Record<StatusVal, { label: string; color: string; bg: string; border: string; icon: React.ElementType }> = {
  planned:     { label: 'Planned',     color: '#6B7A91', bg: 'rgba(107,122,145,0.1)', border: 'rgba(107,122,145,0.2)', icon: Circle },
  'in-progress': { label: 'In Progress', color: '#FFB800', bg: 'rgba(255,184,0,0.1)',   border: 'rgba(255,184,0,0.25)',  icon: Clock },
  completed:   { label: 'Completed',   color: '#00F5A0', bg: 'rgba(0,245,160,0.1)',   border: 'rgba(0,245,160,0.25)',  icon: CheckCircle2 },
}

const T = {
  page: { display: 'flex', minHeight: '100vh', background: '#060A0F', color: '#E8EDF5', fontFamily: "'DM Sans', sans-serif" } as React.CSSProperties,
  main: { flex: 1, display: 'flex', flexDirection: 'column' as const, overflow: 'hidden', marginLeft: 'var(--sidebar-w)' },
  body: { flex: 1, overflowY: 'auto' as const, padding: '32px' },
  card: { background: '#0C1018', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8 } as React.CSSProperties,
  innerCard: { background: '#060A0F', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 6 } as React.CSSProperties,
  input: { width: '100%', background: '#060A0F', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '10px 14px', color: '#E8EDF5', fontSize: 14, fontFamily: "'DM Sans', sans-serif", outline: 'none', boxSizing: 'border-box' as const, transition: 'border-color 0.2s' },
  textarea: { width: '100%', background: '#060A0F', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '10px 14px', color: '#E8EDF5', fontSize: 14, fontFamily: "'DM Sans', sans-serif", outline: 'none', resize: 'vertical' as const, minHeight: 90, boxSizing: 'border-box' as const },
  label: { display: 'block', fontSize: 11, color: '#6B7A91', fontFamily: "'Space Mono', monospace", textTransform: 'uppercase' as const, letterSpacing: '0.1em', marginBottom: 8 },
  btn: { padding: '10px 22px', borderRadius: 6, border: 'none', cursor: 'pointer', fontFamily: "'Space Mono', monospace", fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', transition: 'all 0.2s', display: 'inline-flex', alignItems: 'center', gap: 8 } as React.CSSProperties,
  btnGreen: { background: '#00F5A0', color: '#060A0F' },
  btnOutline: { background: 'transparent', color: '#6B7A91', border: '1px solid rgba(255,255,255,0.12)' },
  tag: { fontFamily: "'Space Mono', monospace", fontSize: 10, padding: '3px 10px', borderRadius: 4, letterSpacing: '0.06em', fontWeight: 700, display: 'inline-block' } as React.CSSProperties,
  syne: { fontFamily: "'Syne', sans-serif" },
  mono: { fontFamily: "'Space Mono', monospace" },
}

function daysUntil(dateStr: string) {
  const diff = new Date(dateStr).getTime() - Date.now()
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
  if (days < 0) return { label: `${Math.abs(days)}d overdue`, color: '#FF6B35' }
  if (days === 0) return { label: 'Due today', color: '#FFB800' }
  return { label: `${days}d left`, color: '#6B7A91' }
}

// ── Status Dropdown ────────────────────────────────────────────────────────────
function StatusDropdown({ current, onChange }: { current: StatusVal; onChange: (s: StatusVal) => void }) {
  const [open, setOpen] = useState(false)
  const cfg = STATUS_CONFIG[current]
  const Ico = cfg.icon
  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px', borderRadius: 5, background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color, cursor: 'pointer', fontSize: 11, ...T.mono, fontWeight: 700 }}
      >
        <Ico size={12} /> {cfg.label} <ChevronDown size={10} />
      </button>
      {open && (
        <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: 4, background: '#0C1018', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, zIndex: 10, width: 160, overflow: 'hidden' }}>
          {(Object.entries(STATUS_CONFIG) as [StatusVal, typeof STATUS_CONFIG[StatusVal]][]).map(([val, c]) => {
            const Ic = c.icon
            return (
              <button key={val} onClick={() => { onChange(val); setOpen(false) }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'none', border: 'none', color: c.color, cursor: 'pointer', fontSize: 12, ...T.mono, fontWeight: 700, transition: 'background 0.15s' }}>
                <Ic size={13} /> {c.label} {current === val && <Check size={11} style={{ marginLeft: 'auto' }} />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function MilestonesPage() {
  useSession()
  const { problem } = useSelectedProblem()

  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [loading, setLoading] = useState(true)
  const [aiLoading, setAiLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Form state
  const [form, setForm] = useState({ title: '', description: '', targetDate: '', metrics: '' })

  const fetchMilestones = () => {
    fetch('/api/growth/milestones')
      .then(r => r.json())
      .then(d => { if (d.milestones) setMilestones(d.milestones) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchMilestones() }, [])

  const aiSuggest = async () => {
    setAiLoading(true)
    setError('')
    try {
      const res = await fetch('/api/growth/milestones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ generateWithAI: true }),
      })
      const data = await res.json()
      if (data.milestones) {
        setMilestones(prev => [...data.milestones, ...prev])
      }
    } catch {
      setError('AI suggestion failed. Please try again.')
    }
    setAiLoading(false)
  }

  const addMilestone = async () => {
    if (!form.title.trim() || !form.targetDate) { setError('Title and Target Date are required.'); return }
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/growth/milestones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (data.milestone) {
        setMilestones(prev => [data.milestone, ...prev])
        setShowModal(false)
        setForm({ title: '', description: '', targetDate: '', metrics: '' })
      }
    } catch {
      setError('Failed to save milestone.')
    }
    setSaving(false)
  }

  const updateStatus = async (id: string, status: StatusVal) => {
    setMilestones(prev => prev.map(m => m._id === id ? { ...m, status } : m))
    await fetch(`/api/growth/milestones/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
  }

  const deleteMilestone = async (id: string) => {
    setMilestones(prev => prev.filter(m => m._id !== id))
    await fetch(`/api/growth/milestones/${id}`, { method: 'DELETE' })
  }

  const counts = {
    planned: milestones.filter(m => m.status === 'planned').length,
    'in-progress': milestones.filter(m => m.status === 'in-progress').length,
    completed: milestones.filter(m => m.status === 'completed').length,
  }

  return (
    <div style={T.page}>
      <Sidebar />
      <div style={T.main}>
        <TopBar title="Milestone Tracker" subtitle="Track your startup journey, step by step" />
        <div style={T.body}>

          {/* Problem context banner */}
          {problem && (
            <div style={{ background: 'rgba(0,245,160,0.04)', border: '1px solid rgba(0,245,160,0.18)', borderRadius: 8, padding: '14px 20px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#00F5A0', color: '#060A0F', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Target size={16} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, fontWeight: 700 }}>Milestones for: <span style={{ color: '#00F5A0' }}>{problem.title}</span></p>
                <p style={{ fontSize: 11, color: '#6B7A91', marginTop: 2 }}>All milestones are linked to your selected problem and will feed into your Pitch Room report.</p>
              </div>
              <button onClick={aiSuggest} disabled={aiLoading} style={{ ...T.btn, ...T.btnGreen, padding: '9px 18px', fontSize: 12, opacity: aiLoading ? 0.7 : 1, flexShrink: 0 }}>
                {aiLoading ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Sparkles size={14} />}
                {aiLoading ? 'Generating…' : 'AI Suggest Milestones'}
              </button>
            </div>
          )}

          {/* Header actions */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
            <div style={{ display: 'flex', gap: 10 }}>
              {(Object.entries(counts) as [StatusVal, number][]).map(([s, n]) => {
                const c = STATUS_CONFIG[s]
                return <span key={s} style={{ ...T.tag, background: c.bg, color: c.color, border: `1px solid ${c.border}`, fontSize: 11 }}>{c.label}: {n}</span>
              })}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              {!problem && (
                <button onClick={aiSuggest} disabled={aiLoading} style={{ ...T.btn, background: 'rgba(123,92,255,0.1)', color: '#7B5CFF', border: '1px solid rgba(123,92,255,0.25)', padding: '9px 16px', opacity: aiLoading ? 0.7 : 1 }}>
                  {aiLoading ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Sparkles size={14} />}
                  AI Suggest 5
                </button>
              )}
              <button onClick={() => { setShowModal(true); setError('') }} style={{ ...T.btn, ...T.btnGreen, padding: '9px 16px' }}>
                <Plus size={14} /> Add Milestone
              </button>
            </div>
          </div>

          {/* Error banner */}
          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,107,53,0.08)', border: '1px solid rgba(255,107,53,0.2)', borderRadius: 6, padding: '12px 16px', marginBottom: 20, color: '#FF6B35', fontSize: 13 }}>
              <AlertCircle size={15} /> {error}
            </div>
          )}

          {/* Timeline */}
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[1, 2, 3].map(i => (
                <div key={i} style={{ height: 100, borderRadius: 8, background: 'linear-gradient(90deg, #0C1018 25%, #111926 50%, #0C1018 75%)', backgroundSize: '400px 100%', animation: 'shimmer 1.4s ease infinite' }} />
              ))}
            </div>
          ) : milestones.length === 0 ? (
            <div style={{ ...T.card, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 20px', textAlign: 'center' }}>
              <div style={{ width: 72, height: 72, borderRadius: 16, background: 'rgba(0,245,160,0.06)', border: '1px solid rgba(0,245,160,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                <Flag size={32} style={{ color: 'rgba(0,245,160,0.4)' }} />
              </div>
              <h3 style={{ ...T.syne, fontSize: 20, fontWeight: 700, marginBottom: 10 }}>No milestones yet</h3>
              <p style={{ color: '#6B7A91', fontSize: 14, marginBottom: 24, maxWidth: 340 }}>Add milestones manually or let AI suggest 5 key startup milestones based on your selected problem.</p>
              <div style={{ display: 'flex', gap: 12 }}>
                <button onClick={aiSuggest} disabled={aiLoading} style={{ ...T.btn, background: 'rgba(123,92,255,0.1)', color: '#7B5CFF', border: '1px solid rgba(123,92,255,0.25)', opacity: aiLoading ? 0.7 : 1 }}>
                  <Sparkles size={14} /> AI Suggest 5
                </button>
                <button onClick={() => setShowModal(true)} style={{ ...T.btn, ...T.btnGreen }}>
                  <Plus size={14} /> Add Milestone
                </button>
              </div>
            </div>
          ) : (
            <div style={{ position: 'relative', paddingLeft: 36 }}>
              {/* Vertical line */}
              <div style={{ position: 'absolute', left: 14, top: 22, bottom: 22, width: 2, background: 'rgba(255,255,255,0.06)', borderRadius: 1 }} />

              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {milestones.map((m, idx) => {
                  const cfg = STATUS_CONFIG[m.status]
                  const Ico = cfg.icon
                  const due = daysUntil(m.targetDate)
                  return (
                    <div key={m._id} style={{ position: 'relative', animation: `fadeUp 0.3s ease ${idx * 0.05}s both` }}>
                      {/* Timeline dot */}
                      <div style={{
                        position: 'absolute', left: -29, top: 24,
                        width: 18, height: 18, borderRadius: '50%',
                        background: m.status === 'completed' ? '#00F5A0' : m.status === 'in-progress' ? '#FFB800' : '#1A2535',
                        border: `2px solid ${cfg.color}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: m.status === 'completed' ? '0 0 10px rgba(0,245,160,0.4)' : m.status === 'in-progress' ? '0 0 10px rgba(255,184,0,0.3)' : 'none',
                        transition: 'all 0.3s',
                      }}>
                        {m.status === 'completed' && <Check size={10} style={{ color: '#060A0F' }} />}
                        {m.status === 'in-progress' && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#FFB800' }} />}
                      </div>

                      <div style={{
                        ...T.card, padding: '20px 24px',
                        borderLeft: `3px solid ${cfg.color}`,
                        background: m.status === 'completed' ? 'rgba(0,245,160,0.02)' : m.status === 'in-progress' ? 'rgba(255,184,0,0.02)' : '#0C1018',
                        transition: 'all 0.2s',
                        opacity: m.status === 'completed' ? 0.85 : 1,
                      }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
                              <span style={{ ...T.syne, fontSize: 16, fontWeight: 700, color: m.status === 'completed' ? '#6B7A91' : '#E8EDF5', textDecoration: m.status === 'completed' ? 'line-through' : 'none' }}>
                                {m.title}
                              </span>
                              <StatusDropdown current={m.status} onChange={s => updateStatus(m._id, s)} />
                            </div>

                            {m.description && (
                              <p style={{ fontSize: 13, color: '#A0ADBF', lineHeight: 1.6, marginBottom: 12 }}>{m.description}</p>
                            )}

                            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <CalendarDays size={13} style={{ color: '#6B7A91' }} />
                                <span style={{ ...T.mono, fontSize: 11, color: '#6B7A91' }}>
                                  {new Date(m.targetDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </span>
                              </div>
                              {m.status !== 'completed' && (
                                <span style={{ ...T.mono, fontSize: 11, color: due.color, fontWeight: 700 }}>{due.label}</span>
                              )}
                              {m.metrics && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                  <BarChart3 size={13} style={{ color: '#7B5CFF' }} />
                                  <span style={{ fontSize: 12, color: '#6B7A91' }}>{m.metrics.length > 80 ? m.metrics.slice(0, 80) + '…' : m.metrics}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          <button onClick={() => deleteMilestone(m._id)} style={{ background: 'none', border: 'none', color: '#3A4A5E', cursor: 'pointer', padding: 4, borderRadius: 4, transition: 'color 0.15s', flexShrink: 0 }}
                            onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color = '#FF6B35'}
                            onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color = '#3A4A5E'}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Milestone Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ ...T.card, width: '100%', maxWidth: 520, padding: 36, animation: 'fadeUp 0.25s ease forwards' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Flag size={20} style={{ color: '#00F5A0' }} />
                <span style={{ ...T.syne, fontSize: 18, fontWeight: 700 }}>Add Milestone</span>
              </div>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: '#6B7A91', cursor: 'pointer' }}><X size={18} /></button>
            </div>

            {error && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,107,53,0.08)', border: '1px solid rgba(255,107,53,0.2)', borderRadius: 6, padding: '10px 14px', marginBottom: 16, color: '#FF6B35', fontSize: 13 }}>
                <AlertCircle size={14} /> {error}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={T.label}>Title <span style={{ color: '#00F5A0' }}>*</span></label>
                <input className="m-input" style={T.input} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Launch MVP to first 10 users" />
              </div>
              <div>
                <label style={T.label}>Description</label>
                <textarea className="m-input" style={T.textarea} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="What needs to happen for this milestone to be reached?" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={T.label}>Target Date <span style={{ color: '#00F5A0' }}>*</span></label>
                  <input className="m-input" type="date" style={{ ...T.input, colorScheme: 'dark' }} value={form.targetDate} onChange={e => setForm(f => ({ ...f, targetDate: e.target.value }))} />
                </div>
                <div>
                  <label style={T.label}>Success Metrics</label>
                  <input className="m-input" style={T.input} value={form.metrics} onChange={e => setForm(f => ({ ...f, metrics: e.target.value }))} placeholder="What does success look like?" />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
              <button onClick={addMilestone} disabled={saving} style={{ ...T.btn, ...T.btnGreen, flex: 1, justifyContent: 'center', opacity: saving ? 0.7 : 1 }}>
                {saving ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Saving…</> : <><Check size={14} /> Add Milestone</>}
              </button>
              <button onClick={() => setShowModal(false)} style={{ ...T.btn, ...T.btnOutline }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Space+Mono:wght@400;700&family=DM+Sans:wght@400;500;600&display=swap');
        @keyframes fadeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes shimmer { 0% { background-position: -400px 0; } 100% { background-position: 400px 0; } }
        .m-input:focus { border-color: rgba(0,245,160,0.5) !important; }
        .m-input::placeholder { color: #2A3544; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-thumb { background: rgba(0,245,160,0.2); border-radius: 2px; }
        input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(0.5); }
      `}</style>
    </div>
  )
}
