'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Sidebar from '@/components/Sidebar'
import TopBar from '@/components/TopBar'
import {
  FlaskConical, Plus, Bot, ArrowRight, ArrowLeft, Trash2,
  CheckCircle, XCircle, Target, Sparkles, Loader2, Send,
  AlertCircle, X, CheckCircle2,
} from 'lucide-react'
import { useSelectedProblem } from '@/lib/useSelectedProblem'

const T = {
  page: { display: 'flex', minHeight: '100vh', background: '#060A0F', color: '#E8EDF5', fontFamily: "'DM Sans', sans-serif" } as React.CSSProperties,
  main: { flex: 1, display: 'flex', flexDirection: 'column' as const, overflow: 'hidden', marginLeft: 'var(--sidebar-w)' },
  body: { flex: 1, overflowY: 'auto' as const, padding: '32px' },
  card: { background: '#0C1018', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 6 } as React.CSSProperties,
  innerCard: { background: '#060A0F', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 5 } as React.CSSProperties,
  input: { width: '100%', background: '#060A0F', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 4, padding: '10px 14px', color: '#E8EDF5', fontSize: 13, fontFamily: "'DM Sans', sans-serif", outline: 'none', boxSizing: 'border-box' as const, transition: 'border-color 0.2s' },
  textarea: { width: '100%', background: '#060A0F', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 4, padding: '10px 14px', color: '#E8EDF5', fontSize: 13, fontFamily: "'DM Sans', sans-serif", outline: 'none', resize: 'vertical' as const, minHeight: 80, boxSizing: 'border-box' as const },
  label: { display: 'block', fontSize: 11, color: '#6B7A91', fontFamily: "'Space Mono', monospace", textTransform: 'uppercase' as const, letterSpacing: '0.1em', marginBottom: 8 },
  btn: { padding: '10px 22px', borderRadius: 4, border: 'none', cursor: 'pointer', fontFamily: "'Space Mono', monospace", fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', transition: 'all 0.2s', display: 'inline-flex', alignItems: 'center', gap: 8 } as React.CSSProperties,
  btnGreen: { background: '#00F5A0', color: '#060A0F' },
  btnOutline: { background: 'transparent', color: '#E8EDF5', border: '1px solid rgba(255,255,255,0.15)' },
  tag: { fontFamily: "'Space Mono', monospace", fontSize: 10, padding: '3px 8px', borderRadius: 3, letterSpacing: '0.04em', fontWeight: 600, display: 'inline-block' } as React.CSSProperties,
  syne: { fontFamily: "'Syne', sans-serif" },
  mono: { fontFamily: "'Space Mono', monospace" },
}

const COLUMNS = [
  { id: 'backlog', label: '📋 Backlog' },
  { id: 'running', label: '▶️ Running' },
  { id: 'done', label: '✅ Done' },
  { id: 'failed', label: '❌ Failed' },
]

export default function GrowthExperimentsPage() {
  useSession()
  const { problem } = useSelectedProblem()
  const [experiments, setExperiments] = useState<any[]>([])
  const [showModal, setShowModal] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [singleAiLoading, setSingleAiLoading] = useState(false)
  const [pitchSaving, setPitchSaving] = useState<string | null>(null)
  const [pitchSuccess, setPitchSuccess] = useState<string | null>(null)
  const [error, setError] = useState('')
  // Manual form
  const [form, setForm] = useState({ title: '', hypothesis: '', testMethod: '', successMetric: '', channel: 'Product' })

  const fetchExps = () => {
    fetch('/api/growth/experiments')
      .then(r => r.json())
      .then(d => { if (d.experiments) setExperiments(d.experiments) })
  }

  useEffect(() => { fetchExps() }, [])

  // AI generate 6 experiments
  const generateBatch = async () => {
    setAiLoading(true)
    setError('')
    try {
      const res = await fetch('/api/growth/experiments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          generateWithAI: true,
          problemContext: problem ? { title: problem.title, reason: problem.reason, opportunity: problem.startupOpportunity, location: problem.location } : null,
        }),
      })
      if (res.ok) fetchExps()
    } catch { setError('AI generation failed.') }
    setAiLoading(false)
  }

  // AI generate single experiment
  const generateSingle = async () => {
    if (!problem) return
    setSingleAiLoading(true)
    setError('')
    try {
      const res = await fetch('/api/growth/experiments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          generateWithAI: true,
          singleExperiment: true,
          problemContext: { title: problem.title, reason: problem.reason, opportunity: problem.startupOpportunity },
        }),
      })
      if (res.ok) { setShowModal(false); fetchExps() }
    } catch { setError('AI generation failed.') }
    setSingleAiLoading(false)
  }

  // Manual create
  const createManual = async () => {
    if (!form.title.trim()) { setError('Title is required.'); return }
    setError('')
    const res = await fetch('/api/growth/experiments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, hypothesis: form.hypothesis || form.title }),
    })
    if (res.ok) { setShowModal(false); setForm({ title: '', hypothesis: '', testMethod: '', successMetric: '', channel: 'Product' }); fetchExps() }
  }

  const updateStatus = async (id: string, current: string, direction: 'next' | 'prev' | 'fail' | 'done') => {
    let newStatus = current
    if (direction === 'next' && current === 'backlog') newStatus = 'running'
    else if (direction === 'prev' && current === 'running') newStatus = 'backlog'
    else if (direction === 'fail') newStatus = 'failed'
    else if (direction === 'done') newStatus = 'done'
    if (newStatus === current) return
    setExperiments(prev => prev.map(e => e._id === id ? { ...e, status: newStatus } : e))
    await fetch(`/api/growth/experiments/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: newStatus }) })
  }

  const saveResult = async (id: string, result: string) => {
    await fetch(`/api/growth/experiments/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ result }) })
  }

  const deleteExp = async (id: string) => {
    setExperiments(prev => prev.filter(e => e._id !== id))
    await fetch(`/api/growth/experiments/${id}`, { method: 'DELETE' })
  }

  // "Add to Pitch Report" — append result to PitchRoom traction field
  const addToPitch = async (exp: any) => {
    setPitchSaving(exp._id)
    try {
      const snippet = `[Experiment] ${exp.title}: ${exp.result || 'Positive result'}`
      const pitchRes = await fetch('/api/pitch-room')
      const pitchData = await pitchRes.json()
      const existing = pitchData.pitch?.traction || ''
      const updated = existing ? `${existing}\n${snippet}` : snippet
      await fetch('/api/pitch-room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ traction: updated }),
      })
      setPitchSuccess(exp._id)
      setTimeout(() => setPitchSuccess(null), 3000)
    } catch { /* silent */ }
    setPitchSaving(null)
  }

  const getImpactColor = (i: string) => i === 'High' ? '#00F5A0' : i === 'Medium' ? '#FFB800' : '#00D9E8'
  const getEffortColor = (e: string) => e === 'Low' ? '#00F5A0' : e === 'Medium' ? '#FFB800' : '#FF6B35'

  return (
    <div style={T.page}>
      <Sidebar />
      <div style={T.main}>
        <TopBar title="Experiments Board" subtitle="Run, track and learn from growth experiments" />
        <div style={{ ...T.body, display: 'flex', flexDirection: 'column' }}>

          {problem && (
            <div style={{ background: 'rgba(0,245,160,0.05)', border: '1px solid rgba(0,245,160,0.2)', borderRadius: 6, padding: '14px 18px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ background: '#00F5A0', color: '#060A0F', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Target size={16} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, fontWeight: 700 }}>Experiments for: <span style={{ color: '#00F5A0' }}>{problem.title}</span></p>
                <p style={{ fontSize: 11, color: '#6B7A91', marginTop: 2 }}>Completed experiments with positive results can be pushed directly to your Pitch Room traction.</p>
              </div>
              <button onClick={generateBatch} disabled={aiLoading} style={{ ...T.btn, ...T.btnGreen, padding: '8px 16px', fontSize: 12, opacity: aiLoading ? 0.7 : 1 }}>
                {aiLoading ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Bot size={14} />}
                Quick Generate 6 ⚡
              </button>
            </div>
          )}

          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,107,53,0.08)', border: '1px solid rgba(255,107,53,0.2)', borderRadius: 6, padding: '10px 14px', marginBottom: 16, color: '#FF6B35', fontSize: 13 }}>
              <AlertCircle size={14} /> {error}
            </div>
          )}

          {/* Stats row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <div style={{ display: 'flex', gap: 10 }}>
              <span style={{ ...T.tag, background: 'rgba(255,255,255,0.06)', color: '#A0ADBF' }}>Total: {experiments.length}</span>
              <span style={{ ...T.tag, background: 'rgba(0,217,232,0.1)', color: '#00D9E8', border: '1px solid rgba(0,217,232,0.2)' }}>Running: {experiments.filter(e => e.status === 'running').length}</span>
              <span style={{ ...T.tag, background: 'rgba(0,245,160,0.1)', color: '#00F5A0', border: '1px solid rgba(0,245,160,0.2)' }}>Done: {experiments.filter(e => e.status === 'done').length}</span>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              {!problem && (
                <button onClick={generateBatch} disabled={aiLoading} style={{ ...T.btn, background: 'rgba(123,92,255,0.1)', color: '#7B5CFF', border: '1px solid rgba(123,92,255,0.25)', padding: '8px 16px', opacity: aiLoading ? 0.7 : 1 }}>
                  {aiLoading ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Bot size={14} />}
                  AI Generate 6
                </button>
              )}
              <button onClick={() => { setShowModal(true); setError('') }} style={{ ...T.btn, ...T.btnGreen, padding: '8px 16px' }}>
                <Plus size={14} /> Add Experiment
              </button>
            </div>
          </div>

          {/* Kanban board */}
          <div style={{ display: 'flex', gap: 20, flex: 1, overflowX: 'auto', paddingBottom: 20 }}>
            {COLUMNS.map(col => {
              const columnExps = experiments.filter(e => e.status === col.id)
              return (
                <div key={col.id} style={{ minWidth: 300, width: 330, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ marginBottom: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ ...T.syne, fontSize: 15, fontWeight: 700 }}>{col.label}</div>
                    <div style={{ fontSize: 11, ...T.mono, color: '#6B7A91', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: 10 }}>{columnExps.length}</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14, flex: 1 }}>
                    {columnExps.map(exp => (
                      <div key={exp._id} style={{ ...T.card, padding: 18, position: 'relative' }}>
                        <button onClick={() => deleteExp(exp._id)} style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', color: '#3A4A5E', cursor: 'pointer', opacity: 0.6, transition: 'color 0.15s' }}
                          onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color = '#FF6B35'}
                          onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color = '#3A4A5E'}
                        ><Trash2 size={13} /></button>

                        <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
                          {exp.aiGenerated && <span style={{ ...T.tag, background: 'rgba(129,140,248,0.1)', color: '#818CF8' }}>🤖 AI</span>}
                          <span style={{ ...T.tag, background: 'rgba(255,255,255,0.06)', color: '#A0ADBF' }}>{exp.channel}</span>
                        </div>

                        <div style={{ fontSize: 14, fontWeight: 700, color: '#E8EDF5', marginBottom: 6, paddingRight: 20, lineHeight: 1.4 }}>{exp.title}</div>
                        <div style={{ fontSize: 12, color: '#6B7A91', lineHeight: 1.5, marginBottom: 10, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden' }}>
                          {exp.hypothesis}
                        </div>

                        {/* Test Method */}
                        {exp.testMethod && (
                          <div style={{ fontSize: 11, color: '#A0ADBF', background: 'rgba(0,217,232,0.05)', border: '1px solid rgba(0,217,232,0.12)', borderRadius: 4, padding: '6px 10px', marginBottom: 10, lineHeight: 1.5 }}>
                            <span style={{ color: '#00D9E8', fontWeight: 700, ...T.mono, fontSize: 10, marginRight: 4 }}>TEST:</span>{exp.testMethod}
                          </div>
                        )}

                        {/* Success metric */}
                        {exp.successMetric && (
                          <div style={{ fontSize: 11, color: '#A0ADBF', marginBottom: 10 }}>
                            <span style={{ ...T.mono, fontSize: 10, color: '#7B5CFF', fontWeight: 700, marginRight: 4 }}>SUCCESS:</span>{exp.successMetric}
                          </div>
                        )}

                        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                          <span style={{ fontSize: 10, ...T.mono, color: getImpactColor(exp.expectedImpact) }}>Impact: {exp.expectedImpact}</span>
                          <span style={{ fontSize: 10, ...T.mono, color: '#6B7A91' }}>•</span>
                          <span style={{ fontSize: 10, ...T.mono, color: getEffortColor(exp.effort) }}>Effort: {exp.effort}</span>
                        </div>

                        {/* Result input for done/failed */}
                        {(exp.status === 'done' || exp.status === 'failed') && (
                          <div style={{ marginBottom: 10 }}>
                            <input
                              style={{ ...T.input, fontSize: 11, padding: '6px 10px' }}
                              placeholder="Experiment result / learnings…"
                              defaultValue={exp.result || ''}
                              onBlur={e => saveResult(exp._id, e.target.value)}
                              className="exp-input"
                            />
                          </div>
                        )}

                        {/* "Add to Pitch Report" for done experiments */}
                        {exp.status === 'done' && (
                          <button
                            onClick={() => addToPitch(exp)}
                            disabled={!!pitchSaving}
                            style={{
                              ...T.btn, width: '100%', justifyContent: 'center',
                              padding: '7px 12px', fontSize: 11, marginBottom: 10, borderRadius: 4,
                              background: pitchSuccess === exp._id ? 'rgba(0,245,160,0.1)' : 'rgba(0,245,160,0.06)',
                              color: pitchSuccess === exp._id ? '#00F5A0' : '#6B7A91',
                              border: `1px solid ${pitchSuccess === exp._id ? 'rgba(0,245,160,0.3)' : 'rgba(255,255,255,0.08)'}`,
                              opacity: pitchSaving === exp._id ? 0.6 : 1,
                            }}
                          >
                            {pitchSuccess === exp._id
                              ? <><CheckCircle2 size={12} /> Added to Pitch Room!</>
                              : pitchSaving === exp._id
                                ? <><Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} /> Saving…</>
                                : <><Send size={12} /> Add to Pitch Report</>
                            }
                          </button>
                        )}

                        {/* Controls */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 10, marginTop: 4 }}>
                          {exp.status === 'running' ? (
                            <button onClick={() => updateStatus(exp._id, exp.status, 'prev')} style={{ background: 'none', border: 'none', color: '#A0ADBF', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, ...T.mono }}>
                              <ArrowLeft size={12} /> Back
                            </button>
                          ) : <div />}
                          {exp.status === 'backlog' && (
                            <button onClick={() => updateStatus(exp._id, exp.status, 'next')} style={{ background: 'none', border: 'none', color: '#00D9E8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, ...T.mono }}>
                              Start <ArrowRight size={12} />
                            </button>
                          )}
                          {exp.status === 'running' && (
                            <div style={{ display: 'flex', gap: 10 }}>
                              <button onClick={() => updateStatus(exp._id, exp.status, 'fail')} style={{ background: 'none', border: 'none', color: '#FF6B35', cursor: 'pointer' }} title="Mark Failed"><XCircle size={16} /></button>
                              <button onClick={() => updateStatus(exp._id, exp.status, 'done')} style={{ background: 'none', border: 'none', color: '#00F5A0', cursor: 'pointer' }} title="Mark Done"><CheckCircle size={16} /></button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}

                    {col.id === 'backlog' && (
                      <button onClick={() => { setShowModal(true); setError('') }} style={{ ...T.card, width: '100%', padding: 12, border: '1px dashed rgba(255,255,255,0.12)', color: '#6B7A91', cursor: 'pointer', fontSize: 12, ...T.syne, display: 'flex', justifyContent: 'center', gap: 8, background: 'rgba(255,255,255,0.01)' }}>
                        <Plus size={14} /> Add Experiment
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

        </div>
      </div>

      {/* Add/Generate Experiment Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ ...T.card, width: '100%', maxWidth: 520, padding: 32, animation: 'fadeUp 0.25s ease forwards' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div style={{ ...T.syne, fontSize: 18, fontWeight: 800 }}>Add Experiment</div>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: '#6B7A91', cursor: 'pointer' }}><X size={18} /></button>
            </div>

            {error && <div style={{ background: 'rgba(255,107,53,0.08)', border: '1px solid rgba(255,107,53,0.2)', borderRadius: 4, padding: '10px 12px', marginBottom: 16, color: '#FF6B35', fontSize: 13 }}>{error}</div>}

            {problem && (
              <button onClick={generateSingle} disabled={singleAiLoading} style={{ ...T.btn, width: '100%', justifyContent: 'center', marginBottom: 20, background: 'rgba(123,92,255,0.1)', color: '#7B5CFF', border: '1px solid rgba(123,92,255,0.25)', padding: '12px', opacity: singleAiLoading ? 0.7 : 1 }}>
                {singleAiLoading ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Sparkles size={14} />}
                {singleAiLoading ? 'Generating…' : 'AI Generate Experiment for this Problem'}
              </button>
            )}

            <div style={{ fontSize: 11, color: '#6B7A91', ...T.mono, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
              Or add manually
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div><label style={T.label}>Hypothesis <span style={{ color: '#00F5A0' }}>*</span></label>
                <input className="exp-input" style={T.input} placeholder="If we do X, we expect Y because Z…" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
              </div>
              <div><label style={T.label}>Test Method</label>
                <textarea className="exp-input" style={T.textarea} placeholder="How will you test this in 7 days?" value={form.testMethod} onChange={e => setForm(f => ({ ...f, testMethod: e.target.value }))} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div><label style={T.label}>Success Metric</label>
                  <input className="exp-input" style={T.input} placeholder="e.g. 10 signups" value={form.successMetric} onChange={e => setForm(f => ({ ...f, successMetric: e.target.value }))} />
                </div>
                <div><label style={T.label}>Channel</label>
                  <select className="exp-input" style={{ ...T.input, cursor: 'pointer' }} value={form.channel} onChange={e => setForm(f => ({ ...f, channel: e.target.value }))}>
                    {['Product', 'Email', 'Twitter', 'LinkedIn', 'Reddit', 'SEO', 'YouTube', 'Other'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button onClick={createManual} style={{ ...T.btn, ...T.btnGreen, flex: 1, justifyContent: 'center' }}>
                <Plus size={14} /> Add to Backlog
              </button>
              <button onClick={() => setShowModal(false)} style={{ ...T.btn, ...T.btnOutline }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;700&family=Space+Mono&display=swap');
        @keyframes fadeUp { from { opacity:0; transform: translateY(12px); } to { opacity:1; transform: none; } }
        @keyframes spin { to { transform: rotate(360deg); } }
        .exp-input:focus { border-color: rgba(0,245,160,0.5) !important; }
        .exp-input::placeholder { color: #2A3544; }
        select option { background: #0C1018; }
      `}</style>
    </div>
  )
}
